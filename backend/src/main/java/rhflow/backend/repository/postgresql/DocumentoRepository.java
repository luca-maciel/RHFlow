package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Documento;

import java.util.List;
import java.util.UUID;

public interface DocumentoRepository extends JpaRepository<Documento, UUID> {

    List<Documento> findByAtivoTrueOrderByCreatedAtDesc();

    List<Documento> findByFuncionarioIdAndAtivoTrueOrderByCreatedAtDesc(UUID funcionarioId);
}