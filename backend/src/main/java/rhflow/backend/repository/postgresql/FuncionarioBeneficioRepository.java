package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.FuncionarioBeneficio;

import java.util.List;
import java.util.UUID;

public interface FuncionarioBeneficioRepository
        extends JpaRepository<FuncionarioBeneficio, UUID> {

    List<FuncionarioBeneficio>
    findByFuncionarioId(UUID funcionarioId);

    List<FuncionarioBeneficio>
    findByFuncionarioIdAndAtivoTrue(UUID funcionarioId);

    List<FuncionarioBeneficio>
    findByBeneficioIdAndAtivoTrue(UUID beneficioId);

    boolean existsByFuncionarioIdAndBeneficioIdAndAtivoTrue(
            UUID funcionarioId,
            UUID beneficioId
    );
}