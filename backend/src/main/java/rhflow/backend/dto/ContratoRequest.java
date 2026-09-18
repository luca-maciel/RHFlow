package rhflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public class ContratoRequest {

    @NotNull
    private UUID funcionarioId;

    @NotBlank
    @Size(max = 50)
    private String tipo;

    @NotNull
    private LocalDate dataInicio;

    @Size(max = 500)
    private String descricao;

    public UUID getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(UUID funcionarioId) {
        this.funcionarioId = funcionarioId;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}