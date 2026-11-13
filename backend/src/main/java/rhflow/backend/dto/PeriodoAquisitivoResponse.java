package rhflow.backend.dto;

import java.time.LocalDate;
import java.util.UUID;

public record PeriodoAquisitivoResponse(
        UUID funcionarioId,
        String funcionarioNome,
        LocalDate dataAdmissao,
        LocalDate inicioPeriodoAquisitivo,
        LocalDate fimPeriodoAquisitivo,
        LocalDate inicioPeriodoConcessivo,
        LocalDate fimPeriodoConcessivo,
        int diasUtilizados,
        int saldoDisponivel,
        boolean direitoAdquirido
) {
}