package rhflow.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class HistoricoSalarialResponse {

    private UUID id;

    private UUID funcionarioId;
    private String funcionarioNome;

    private UUID contratoId;

    private BigDecimal valor;

    private LocalDate dataInicioVigencia;
    private LocalDate dataFimVigencia;

    private String motivo;

    private LocalDateTime createdAt;

    public HistoricoSalarialResponse(
            UUID id,
            UUID funcionarioId,
            String funcionarioNome,
            UUID contratoId,
            BigDecimal valor,
            LocalDate dataInicioVigencia,
            LocalDate dataFimVigencia,
            String motivo,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.funcionarioId = funcionarioId;
        this.funcionarioNome = funcionarioNome;
        this.contratoId = contratoId;
        this.valor = valor;
        this.dataInicioVigencia = dataInicioVigencia;
        this.dataFimVigencia = dataFimVigencia;
        this.motivo = motivo;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getFuncionarioId() {
        return funcionarioId;
    }

    public String getFuncionarioNome() {
        return funcionarioNome;
    }

    public UUID getContratoId() {
        return contratoId;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDate getDataInicioVigencia() {
        return dataInicioVigencia;
    }

    public LocalDate getDataFimVigencia() {
        return dataFimVigencia;
    }

    public String getMotivo() {
        return motivo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}