package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;

import rhflow.backend.entity.postgresql.HistoricoSalarial;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HistoricoSalarialRepository
        extends JpaRepository<HistoricoSalarial, UUID> {

    List<HistoricoSalarial>
    findByFuncionarioIdOrderByDataInicioVigenciaDesc(
            UUID funcionarioId
    );

    List<HistoricoSalarial>
    findByContratoIdOrderByDataInicioVigenciaDesc(
            UUID contratoId
    );

    Optional<HistoricoSalarial>
    findFirstByFuncionarioIdAndDataFimVigenciaIsNullOrderByDataInicioVigenciaDesc(
            UUID funcionarioId
    );
}