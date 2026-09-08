package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Endereco;

import java.util.Optional;
import java.util.UUID;

public interface EnderecoRepository extends JpaRepository<Endereco, UUID> {

    Optional<Endereco> findByFuncionarioId(UUID funcionarioId);

    boolean existsByFuncionarioId(UUID funcionarioId);
}