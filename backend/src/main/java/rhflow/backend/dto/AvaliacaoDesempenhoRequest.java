package rhflow.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class AvaliacaoDesempenhoRequest {

    @NotNull
    private UUID funcionarioId;

    @NotNull
    private LocalDate inicioPeriodo;

    @NotNull
    private LocalDate fimPeriodo;

    @NotNull
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "10.0")
    private BigDecimal nota;

    @Size(max = 1000)
    private String pontosFortes;

    @Size(max = 1000)
    private String pontosMelhoria;

    @Size(max = 1000)
    private String observacao;

    public UUID getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(UUID funcionarioId) {
        this.funcionarioId = funcionarioId;
    }

    public LocalDate getInicioPeriodo() {
        return inicioPeriodo;
    }

    public void setInicioPeriodo(LocalDate inicioPeriodo) {
        this.inicioPeriodo = inicioPeriodo;
    }

    public LocalDate getFimPeriodo() {
        return fimPeriodo;
    }

    public void setFimPeriodo(LocalDate fimPeriodo) {
        this.fimPeriodo = fimPeriodo;
    }

    public BigDecimal getNota() {
        return nota;
    }

    public void setNota(BigDecimal nota) {
        this.nota = nota;
    }

    public String getPontosFortes() {
        return pontosFortes;
    }

    public void setPontosFortes(String pontosFortes) {
        this.pontosFortes = pontosFortes;
    }

    public String getPontosMelhoria() {
        return pontosMelhoria;
    }

    public void setPontosMelhoria(String pontosMelhoria) {
        this.pontosMelhoria = pontosMelhoria;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}