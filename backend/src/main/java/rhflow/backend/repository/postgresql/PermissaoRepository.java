package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Permissao;

import java.util.Optional;
import java.util.UUID;

public interface PermissaoRepository
        extends JpaRepository<Permissao, UUID> {

    Optional<Permissao> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);
}