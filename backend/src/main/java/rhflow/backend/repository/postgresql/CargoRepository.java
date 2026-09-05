package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Cargo;

import java.util.List;
import java.util.UUID;

public interface CargoRepository extends JpaRepository<Cargo, UUID> {

    List<Cargo> findByDepartamentoId(UUID departamentoId);

    boolean existsByDepartamentoIdAndNomeIgnoreCase(
            UUID departamentoId,
            String nome
    );
}