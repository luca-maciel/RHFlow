package rhflow.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import rhflow.backend.entity.mongodb.AuditoriaEvento;
import rhflow.backend.repository.mongodb.AuditoriaEventoRepository;
import rhflow.backend.repository.postgresql.UsuarioRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditoriaService {

    private static final Logger log = LoggerFactory.getLogger(AuditoriaService.class);

    private final AuditoriaEventoRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public AuditoriaService(
            AuditoriaEventoRepository auditoriaRepository,
            UsuarioRepository usuarioRepository) {
        this.auditoriaRepository = auditoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public void registrar(
            String acao,
            String entidade,
            String entidadeId,
            String descricao,
            Map<String, Object> detalhes) {
        try {
            String usuarioId = "SISTEMA";
            String usuarioNome = "Sistema / Agendador";

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof Jwt jwt) {
                usuarioId = jwt.getSubject();
                String nomeClaim = jwt.getClaimAsString("nome");
                String emailClaim = jwt.getClaimAsString("email");

                if (nomeClaim != null && !nomeClaim.isBlank()) {
                    usuarioNome = nomeClaim;
                } else {
                    usuarioNome = resolverNomePorId(usuarioId, emailClaim);
                }
            }

            AuditoriaEvento evento = new AuditoriaEvento(
                    acao,
                    entidade,
                    entidadeId,
                    usuarioId,
                    usuarioNome,
                    descricao,
                    detalhes
            );

            auditoriaRepository.save(evento);
        } catch (Exception e) {
            log.warn("Falha ao registrar evento de auditoria no MongoDB: {}", e.getMessage());
        }
    }

    private String resolverNomePorId(String subject, String fallbackEmail) {
        try {
            UUID id = UUID.fromString(subject);
            return usuarioRepository.findById(id)
                    .map(u -> u.getNome() + " (" + u.getEmail() + ")")
                    .orElse(fallbackEmail != null ? fallbackEmail : subject);
        } catch (IllegalArgumentException e) {
            return fallbackEmail != null ? fallbackEmail : subject;
        }
    }

    public List<AuditoriaEvento> listarRecentes() {
        return auditoriaRepository.findTop200ByOrderByDataHoraDesc();
    }

    public void registrarComoUsuario(
            String usuarioId,
            String usuarioNome,
            String acao,
            String entidade,
            String entidadeId,
            String descricao,
            Map<String, Object> detalhes) {
        try {
            AuditoriaEvento evento = new AuditoriaEvento(
                    acao,
                    entidade,
                    entidadeId,
                    usuarioId,
                    usuarioNome,
                    descricao,
                    detalhes
            );
            auditoriaRepository.save(evento);
        } catch (Exception e) {
            log.warn("Falha ao registrar evento de auditoria no MongoDB: {}", e.getMessage());
        }
    }
}