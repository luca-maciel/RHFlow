package rhflow.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "Informe um e-mail válido.")
        String email,

        @NotBlank(message = "Informe o código de verificação.")
        String codigo,

        @NotBlank(message = "Informe a nova senha.")
        @Size(min = 8, message = "A nova senha deve ter pelo menos 8 caracteres.")
        String novaSenha
) {}