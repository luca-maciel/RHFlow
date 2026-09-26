package rhflow.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UsuarioRequest(

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 150)
    String nome,

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail inválido")
    @Size(max = 150)
    String email,

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, max = 72)
    String senha,

    UUID funcionarioId

) {}