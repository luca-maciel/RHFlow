package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import rhflow.backend.entity.postgresql.Ferias;
import rhflow.backend.enums.StatusFerias;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface FeriasRepository
        extends JpaRepository<Ferias, UUID> {

    List<Ferias> findByFuncionarioIdOrderByInicioGozoDesc(
            UUID funcionarioId
    );

    List<Ferias> findByStatus(
            StatusFerias status
    );

    List<Ferias>
    findByInicioGozoBetweenOrderByInicioGozo(
            LocalDate inicio,
            LocalDate fim
    );
}