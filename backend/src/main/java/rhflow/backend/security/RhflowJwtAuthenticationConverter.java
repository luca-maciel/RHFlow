package rhflow.backend.security;

import java.util.UUID;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import rhflow.backend.entity.postgresql.Usuario;
import rhflow.backend.repository.postgresql.UsuarioRepository;

@Component
public class RhflowJwtAuthenticationConverter
        implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UsuarioRepository usuarioRepository;

    public RhflowJwtAuthenticationConverter(
            UsuarioRepository usuarioRepository
    ) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AbstractAuthenticationToken convert(Jwt jwt) {

        UUID usuarioId;

        try {
            usuarioId = UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException exception) {
            throw new InvalidBearerTokenException(
                "Identificador do token inválido"
            );
        }

        Usuario usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() ->
                    new InvalidBearerTokenException(
                        "Usuário não encontrado"
                    )
                );

        if (!usuario.isAtivo()) {
            throw new InvalidBearerTokenException(
                "Usuário desativado"
            );
        }

        var authorities = usuarioRepository
                .findPermissoesEfetivas(usuarioId)
                .stream()
                .map(SimpleGrantedAuthority::new)
                .toList();

        return new JwtAuthenticationToken(
            jwt,
            authorities,
            usuario.getEmail()
        );
    }
}