package rhflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PerfilRequest(
    @NotBlank
    @Size(max = 50)
    String nome,

    @Size(max = 255)
    String descricao
) {}