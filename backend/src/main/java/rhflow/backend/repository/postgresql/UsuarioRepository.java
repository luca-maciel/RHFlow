package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Usuario;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository
        extends JpaRepository<Usuario, UUID> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByFuncionarioId(UUID funcionarioId);
}