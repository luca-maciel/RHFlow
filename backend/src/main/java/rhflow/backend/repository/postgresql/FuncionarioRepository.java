package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Funcionario;
import rhflow.backend.enums.StatusFuncionario;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FuncionarioRepository
        extends JpaRepository<Funcionario, UUID> {

    boolean existsByCpf(String cpf);

    Optional<Funcionario> findByCpf(String cpf);

    List<Funcionario> findByCargoId(UUID cargoId);

    List<Funcionario> findByStatus(StatusFuncionario status);

    List<Funcionario> findByCargoDepartamentoId(UUID departamentoId);

    List<Funcionario> findByCargoDepartamentoEmpresaId(UUID empresaId);
}