package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import rhflow.backend.entity.postgresql.Usuario;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface UsuarioRepository
        extends JpaRepository<Usuario, UUID> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByFuncionarioId(UUID funcionarioId);

    @Query(value = """
            SELECT p.codigo
            FROM permissao p
            JOIN perfil_permissao pp
                ON pp.permissao_id = p.id
            JOIN usuario_perfil up
                ON up.perfil_id = pp.perfil_id
            WHERE up.usuario_id = :usuarioId

            UNION

            SELECT p.codigo
            FROM permissao p
            JOIN usuario_permissao up
                ON up.permissao_id = p.id
            WHERE up.usuario_id = :usuarioId
            """, nativeQuery = true)
    Set<String> findPermissoesEfetivas(
            @Param("usuarioId") UUID usuarioId);
}