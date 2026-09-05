package rhflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class DepartamentoRequest {

    @NotNull(message = "A empresa é obrigatória.")
    private UUID empresaId;

    @NotBlank(message = "O nome do departamento é obrigatório.")
    @Size(
        max = 100,
        message = "O nome deve ter no máximo 100 caracteres."
    )
    private String nome;

    @Size(
        max = 500,
        message = "A descrição deve ter no máximo 500 caracteres."
    )
    private String descricao;

    public UUID getEmpresaId() {
        return empresaId;
    }

    public void setEmpresaId(UUID empresaId) {
        this.empresaId = empresaId;
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
}