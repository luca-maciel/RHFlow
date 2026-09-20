package rhflow.backend.dto;

import rhflow.backend.enums.StatusFerias;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class FeriasResponse {

    private UUID id;

    private UUID funcionarioId;
    private String funcionarioNome;

    private LocalDate inicioPeriodoAquisitivo;
    private LocalDate fimPeriodoAquisitivo;

    private LocalDate inicioGozo;
    private LocalDate fimGozo;

    private Integer quantidadeDias;

    private StatusFerias status;

    private String observacao;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FeriasResponse(
            UUID id,
            UUID funcionarioId,
            String funcionarioNome,
            LocalDate inicioPeriodoAquisitivo,
            LocalDate fimPeriodoAquisitivo,
            LocalDate inicioGozo,
            LocalDate fimGozo,
            Integer quantidadeDias,
            StatusFerias status,
            String observacao,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.funcionarioId = funcionarioId;
        this.funcionarioNome = funcionarioNome;
        this.inicioPeriodoAquisitivo = inicioPeriodoAquisitivo;
        this.fimPeriodoAquisitivo = fimPeriodoAquisitivo;
        this.inicioGozo = inicioGozo;
        this.fimGozo = fimGozo;
        this.quantidadeDias = quantidadeDias;
        this.status = status;
        this.observacao = observacao;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public LocalDate getInicioPeriodoAquisitivo() {
        return inicioPeriodoAquisitivo;
    }

    public LocalDate getFimPeriodoAquisitivo() {
        return fimPeriodoAquisitivo;
    }

    public LocalDate getInicioGozo() {
        return inicioGozo;
    }

    public LocalDate getFimGozo() {
        return fimGozo;
    }

    public Integer getQuantidadeDias() {
        return quantidadeDias;
    }

    public StatusFerias getStatus() {
        return status;
    }

    public String getObservacao() {
        return observacao;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}