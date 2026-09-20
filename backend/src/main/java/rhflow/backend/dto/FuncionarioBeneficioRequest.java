package rhflow.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class FuncionarioBeneficioRequest {

    @NotNull
    private UUID funcionarioId;

    @NotNull
    private UUID beneficioId;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal valor;

    @NotNull
    private LocalDate dataAdesao;

    public UUID getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(UUID funcionarioId) {
        this.funcionarioId = funcionarioId;
    }

    public UUID getBeneficioId() {
        return beneficioId;
    }

    public void setBeneficioId(UUID beneficioId) {
        this.beneficioId = beneficioId;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getDataAdesao() {
        return dataAdesao;
    }

    public void setDataAdesao(LocalDate dataAdesao) {
        this.dataAdesao = dataAdesao;
    }
}