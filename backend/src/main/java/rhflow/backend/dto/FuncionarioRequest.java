package rhflow.backend.dto;

import jakarta.validation.constraints.*;
import rhflow.backend.enums.StatusFuncionario;

import java.time.LocalDate;
import java.util.UUID;

public class FuncionarioRequest {

    @NotNull(message = "O cargo é obrigatório.")
    private UUID cargoId;

    @NotBlank(message = "O nome é obrigatório.")
    @Size(
        max = 150,
        message = "O nome deve ter no máximo 150 caracteres."
    )
    private String nome;

    @NotBlank(message = "O CPF é obrigatório.")
    @Pattern(
        regexp = "\\d{11}",
        message = "O CPF deve conter exatamente 11 dígitos."
    )
    private String cpf;

    @Size(max = 20)
    private String rg;

    @Past(
        message = "A data de nascimento deve estar no passado."
    )
    private LocalDate dataNascimento;

    @Email(message = "O e-mail informado é inválido.")
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String telefone;

    @NotNull(message = "A data de admissão é obrigatória.")
    private LocalDate dataAdmissao;

    private StatusFuncionario status;

    public UUID getCargoId() {
        return cargoId;
    }

    public void setCargoId(UUID cargoId) {
        this.cargoId = cargoId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public LocalDate getDataAdmissao() {
        return dataAdmissao;
    }

    public void setDataAdmissao(LocalDate dataAdmissao) {
        this.dataAdmissao = dataAdmissao;
    }

    public StatusFuncionario getStatus() {
        return status;
    }

    public void setStatus(StatusFuncionario status) {
        this.status = status;
    }
}