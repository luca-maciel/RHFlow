package rhflow.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import rhflow.backend.dto.AuthMeResponse;
import rhflow.backend.dto.LoginRequest;
import rhflow.backend.dto.LoginResponse;
import rhflow.backend.entity.postgresql.Perfil;
import rhflow.backend.entity.postgresql.Usuario;
import rhflow.backend.exception.ResourceNotFoundException;
import rhflow.backend.repository.postgresql.UsuarioRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import rhflow.backend.dto.ForgotPasswordRequest;
import rhflow.backend.dto.ResetPasswordRequest;
import rhflow.backend.exception.BusinessException;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final AuditoriaService auditoriaService;
    private final long expirationMinutes;

    private final EmailService emailService;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final long RESET_CODE_EXPIRATION_MINUTES = 15;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            AuditoriaService auditoriaService,
            EmailService emailService,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.auditoriaService = auditoriaService;
        this.emailService = emailService;
        this.expirationMinutes = expirationMinutes;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        Usuario usuario = usuarioRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Credenciais inválidas"));

        if (!usuario.isAtivo()
                || !passwordEncoder.matches(
                        request.senha(),
                        usuario.getSenhaHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Credenciais inválidas");
        }

        Instant agora = Instant.now();

        Instant expiracao = agora.plus(
                expirationMinutes,
                ChronoUnit.MINUTES);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("rhflow")
                .subject(usuario.getId().toString())
                .issuedAt(agora)
                .expiresAt(expiracao)
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)).getTokenValue();

        auditoriaService.registrarComoUsuario(
                usuario.getId().toString(),
                usuario.getNome() + " (" + usuario.getEmail() + ")",
                "LOGIN",
                "AUTENTICACAO",
                usuario.getId().toString(),
                "Login realizado por " + usuario.getNome(),
                Map.of("email", usuario.getEmail())
        );

        return new LoginResponse(
                token,
                "Bearer",
                expirationMinutes * 60);
    }

    @Transactional(readOnly = true)
    public AuthMeResponse me(UUID usuarioId) {

        Usuario usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Usuário não encontrado"
                    )
                );

        Set<String> perfis = usuario.getPerfis()
                .stream()
                .map(Perfil::getNome)
                .collect(Collectors.toSet());

        Set<String> permissoes = usuarioRepository
                .findPermissoesEfetivas(usuarioId);

        return new AuthMeResponse(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.isAtivo(),
            perfis,
            permissoes
        );
    }

    @Transactional
    public void solicitarRecuperacaoSenha(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        usuarioRepository.findByEmailIgnoreCase(email).ifPresent(usuario -> {
            if (!usuario.isAtivo()) {
                return;
            }

            String codigo = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
            usuario.setResetTokenHash(passwordEncoder.encode(codigo));
            usuario.setResetTokenExpiraEm(
                    LocalDateTime.now().plusMinutes(RESET_CODE_EXPIRATION_MINUTES)
            );
            usuarioRepository.save(usuario);

            emailService.enviarCodigoRecuperacao(usuario.getEmail(), usuario.getNome(), codigo);

            auditoriaService.registrarComoUsuario(
                    usuario.getId().toString(),
                    usuario.getNome() + " (" + usuario.getEmail() + ")",
                    "SOLICITAR_RECUPERACAO_SENHA",
                    "AUTENTICACAO",
                    usuario.getId().toString(),
                    "Código de recuperação de senha enviado por e-mail para " + usuario.getEmail(),
                    Map.of("email", usuario.getEmail())
            );
        });
    }

    @Transactional
    public void redefinirSenha(ResetPasswordRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String codigo = request.codigo().trim();

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException("Código de verificação inválido ou expirado."));

        if (!usuario.isAtivo()
                || usuario.getResetTokenHash() == null
                || usuario.getResetTokenExpiraEm() == null
                || usuario.getResetTokenExpiraEm().isBefore(LocalDateTime.now())
                || !passwordEncoder.matches(codigo, usuario.getResetTokenHash())) {
            throw new BusinessException("Código de verificação inválido ou expirado.");
        }

        usuario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
        usuario.setResetTokenHash(null);
        usuario.setResetTokenExpiraEm(null);
        usuarioRepository.save(usuario);

        auditoriaService.registrarComoUsuario(
                usuario.getId().toString(),
                usuario.getNome() + " (" + usuario.getEmail() + ")",
                "REDEFINIR_SENHA",
                "AUTENTICACAO",
                usuario.getId().toString(),
                "Senha redefinida com sucesso por " + usuario.getNome(),
                Map.of("email", usuario.getEmail())
        );
    }
}