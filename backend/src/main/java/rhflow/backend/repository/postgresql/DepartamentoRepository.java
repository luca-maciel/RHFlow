package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Departamento;

import java.util.List;
import java.util.UUID;

public interface DepartamentoRepository
        extends JpaRepository<Departamento, UUID> {

    List<Departamento> findByEmpresaId(UUID empresaId);

    boolean existsByEmpresaIdAndNomeIgnoreCase(
            UUID empresaId,
            String nome
    );
}