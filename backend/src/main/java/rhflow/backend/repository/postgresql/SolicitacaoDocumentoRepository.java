package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.SolicitacaoDocumento;

import java.util.List;
import java.util.UUID;

public interface SolicitacaoDocumentoRepository extends JpaRepository<SolicitacaoDocumento, UUID> {

    List<SolicitacaoDocumento> findAllByOrderByCreatedAtDesc();

    List<SolicitacaoDocumento> findByFuncionarioIdOrderByCreatedAtDesc(UUID funcionarioId);
}