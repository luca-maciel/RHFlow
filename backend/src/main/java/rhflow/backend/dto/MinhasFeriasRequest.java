package rhflow.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class MinhasFeriasRequest {

    @NotNull
    private LocalDate inicioPeriodoAquisitivo;

    @NotNull
    private LocalDate fimPeriodoAquisitivo;

    @NotNull
    private LocalDate inicioGozo;

    @NotNull
    private LocalDate fimGozo;

    @Size(max = 500)
    private String observacao;

    public LocalDate getInicioPeriodoAquisitivo() {
        return inicioPeriodoAquisitivo;
    }

    public void setInicioPeriodoAquisitivo(
            LocalDate inicioPeriodoAquisitivo
    ) {
        this.inicioPeriodoAquisitivo =
                inicioPeriodoAquisitivo;
    }

    public LocalDate getFimPeriodoAquisitivo() {
        return fimPeriodoAquisitivo;
    }

    public void setFimPeriodoAquisitivo(
            LocalDate fimPeriodoAquisitivo
    ) {
        this.fimPeriodoAquisitivo =
                fimPeriodoAquisitivo;
    }

    public LocalDate getInicioGozo() {
        return inicioGozo;
    }

    public void setInicioGozo(
            LocalDate inicioGozo
    ) {
        this.inicioGozo = inicioGozo;
    }

    public LocalDate getFimGozo() {
        return fimGozo;
    }

    public void setFimGozo(
            LocalDate fimGozo
    ) {
        this.fimGozo = fimGozo;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(
            String observacao
    ) {
        this.observacao = observacao;
    }
}