package rhflow.backend.dto;

import rhflow.backend.enums.StatusContrato;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class ContratoResponse {

    private UUID id;

    private UUID funcionarioId;
    private String funcionarioNome;

    private String tipo;

    private LocalDate dataInicio;
    private LocalDate dataFim;

    private StatusContrato status;

    private String descricao;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ContratoResponse(
            UUID id,
            UUID funcionarioId,
            String funcionarioNome,
            String tipo,
            LocalDate dataInicio,
            LocalDate dataFim,
            StatusContrato status,
            String descricao,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.funcionarioId = funcionarioId;
        this.funcionarioNome = funcionarioNome;
        this.tipo = tipo;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.status = status;
        this.descricao = descricao;
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

    public String getTipo() {
        return tipo;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public StatusContrato getStatus() {
        return status;
    }

    public String getDescricao() {
        return descricao;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}