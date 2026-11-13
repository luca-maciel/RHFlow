package rhflow.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public class FeriasRequest {

    @NotNull(message = "O funcionário é obrigatório.")
    private UUID funcionarioId;

    private LocalDate inicioPeriodoAquisitivo;

    private LocalDate fimPeriodoAquisitivo;

    @NotNull(message = "A data de início das férias é obrigatória.")
    private LocalDate inicioGozo;

    @NotNull(message = "A data de término das férias é obrigatória.")
    private LocalDate fimGozo;

    @Size(max = 500, message = "A observação deve ter no máximo 500 caracteres.")
    private String observacao;

    public UUID getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(UUID funcionarioId) {
        this.funcionarioId = funcionarioId;
    }

    public LocalDate getInicioPeriodoAquisitivo() {
        return inicioPeriodoAquisitivo;
    }

    public void setInicioPeriodoAquisitivo(LocalDate inicioPeriodoAquisitivo) {
        this.inicioPeriodoAquisitivo = inicioPeriodoAquisitivo;
    }

    public LocalDate getFimPeriodoAquisitivo() {
        return fimPeriodoAquisitivo;
    }

    public void setFimPeriodoAquisitivo(LocalDate fimPeriodoAquisitivo) {
        this.fimPeriodoAquisitivo = fimPeriodoAquisitivo;
    }

    public LocalDate getInicioGozo() {
        return inicioGozo;
    }

    public void setInicioGozo(LocalDate inicioGozo) {
        this.inicioGozo = inicioGozo;
    }

    public LocalDate getFimGozo() {
        return fimGozo;
    }

    public void setFimGozo(LocalDate fimGozo) {
        this.fimGozo = fimGozo;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}