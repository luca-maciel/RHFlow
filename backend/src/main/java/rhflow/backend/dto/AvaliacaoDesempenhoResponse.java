package rhflow.backend.dto;

import rhflow.backend.enums.StatusAvaliacao;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class AvaliacaoDesempenhoResponse {

    private UUID id;

    private UUID funcionarioId;
    private String funcionarioNome;

    private LocalDate inicioPeriodo;
    private LocalDate fimPeriodo;

    private BigDecimal nota;

    private String pontosFortes;
    private String pontosMelhoria;
    private String observacao;

    private StatusAvaliacao status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AvaliacaoDesempenhoResponse(
            UUID id,
            UUID funcionarioId,
            String funcionarioNome,
            LocalDate inicioPeriodo,
            LocalDate fimPeriodo,
            BigDecimal nota,
            String pontosFortes,
            String pontosMelhoria,
            String observacao,
            StatusAvaliacao status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.funcionarioId = funcionarioId;
        this.funcionarioNome = funcionarioNome;
        this.inicioPeriodo = inicioPeriodo;
        this.fimPeriodo = fimPeriodo;
        this.nota = nota;
        this.pontosFortes = pontosFortes;
        this.pontosMelhoria = pontosMelhoria;
        this.observacao = observacao;
        this.status = status;
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

    public LocalDate getInicioPeriodo() {
        return inicioPeriodo;
    }

    public LocalDate getFimPeriodo() {
        return fimPeriodo;
    }

    public BigDecimal getNota() {
        return nota;
    }

    public String getPontosFortes() {
        return pontosFortes;
    }

    public String getPontosMelhoria() {
        return pontosMelhoria;
    }

    public String getObservacao() {
        return observacao;
    }

    public StatusAvaliacao getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}