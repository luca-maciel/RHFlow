package rhflow.backend.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class EmpresaRequest {

    @NotBlank(message = "A razão social é obrigatória.")
    @Size(max = 150, message = "A razão social deve ter no máximo 150 caracteres.")
    private String razaoSocial;

    @NotBlank(message = "O nome  é obrigatório.")
    @Size(max = 150, message = "O nome  deve ter no máximo 150 caracteres.")
    private String nome;

    @NotBlank(message = "O CNPJ é obrigatório.")
    @Pattern(
        regexp = "\\d{14}",
        message = "O CNPJ deve conter exatamente 14 dígitos."
    )
    private String cnpj;

    @Email(message = "O e-mail informado é inválido.")
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String telefone;

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
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
}