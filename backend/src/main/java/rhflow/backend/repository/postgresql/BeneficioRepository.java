package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Beneficio;

import java.util.List;
import java.util.UUID;

public interface BeneficioRepository
        extends JpaRepository<Beneficio, UUID> {

    boolean existsByNomeIgnoreCase(String nome);

    List<Beneficio> findByAtivoTrue();
}