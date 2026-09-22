package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.AvaliacaoDesempenho;
import rhflow.backend.enums.StatusAvaliacao;

import java.util.List;
import java.util.UUID;

public interface AvaliacaoDesempenhoRepository
        extends JpaRepository<AvaliacaoDesempenho, UUID> {

    List<AvaliacaoDesempenho>
    findByFuncionarioIdOrderByFimPeriodoDesc(
            UUID funcionarioId
    );

    List<AvaliacaoDesempenho>
    findByStatus(StatusAvaliacao status);

    List<AvaliacaoDesempenho>
    findByFuncionarioIdAndStatus(
            UUID funcionarioId,
            StatusAvaliacao status
    );
}