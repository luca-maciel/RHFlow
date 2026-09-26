package rhflow.backend.dto;

import rhflow.backend.dto.UsuarioUpdateRequest;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UsuarioUpdateRequest(

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 150)
    String nome,

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail inválido")
    @Size(max = 150)
    String email,

    UUID funcionarioId

) {}