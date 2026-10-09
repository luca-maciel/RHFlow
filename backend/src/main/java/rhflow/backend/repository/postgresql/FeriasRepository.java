package rhflow.backend.repository.postgresql;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
    SELECT COUNT(f) > 0
    FROM Ferias f
    WHERE f.funcionario.id = :funcionarioId
      AND f.status IN :status
      AND f.inicioGozo <= :fimGozo
      AND f.fimGozo >= :inicioGozo
""")
boolean existsPeriodoSobreposto(
        @Param("funcionarioId") UUID funcionarioId,
        @Param("inicioGozo") LocalDate inicioGozo,
        @Param("fimGozo") LocalDate fimGozo,
        @Param("status") List<StatusFerias> status
);
}