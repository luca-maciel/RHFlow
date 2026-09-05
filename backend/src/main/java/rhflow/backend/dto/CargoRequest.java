package rhflow.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public class CargoRequest {

    @NotNull(message = "O departamento é obrigatório.")
    private UUID departamentoId;

    @NotBlank(message = "O nome do cargo é obrigatório.")
    @Size(max = 100)
    private String nome;

    @Size(max = 500)
    private String descricao;

    @Size(max = 50)
    private String nivel;

    @DecimalMin(
        value = "0.0",
        inclusive = true,
        message = "O salário base não pode ser negativo."
    )
    private BigDecimal salarioBase;

    public UUID getDepartamentoId() {
        return departamentoId;
    }

    public void setDepartamentoId(UUID departamentoId) {
        this.departamentoId = departamentoId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getNivel() {
        return nivel;
    }

    public void setNivel(String nivel) {
        this.nivel = nivel;
    }

    public BigDecimal getSalarioBase() {
        return salarioBase;
    }

    public void setSalarioBase(BigDecimal salarioBase) {
        this.salarioBase = salarioBase;
    }
}