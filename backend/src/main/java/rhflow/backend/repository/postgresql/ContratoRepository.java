package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Contrato;
import rhflow.backend.enums.StatusContrato;

import java.util.List;
import java.util.UUID;

public interface ContratoRepository
        extends JpaRepository<Contrato, UUID> {

    List<Contrato> findByFuncionarioId(UUID funcionarioId);

    List<Contrato> findByStatus(StatusContrato status);

    boolean existsByFuncionarioIdAndStatus(
            UUID funcionarioId,
            StatusContrato status
    );
}