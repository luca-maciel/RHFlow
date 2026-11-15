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

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final AuditoriaService auditoriaService;
    private final long expirationMinutes;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            AuditoriaService auditoriaService,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.auditoriaService = auditoriaService;
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
}