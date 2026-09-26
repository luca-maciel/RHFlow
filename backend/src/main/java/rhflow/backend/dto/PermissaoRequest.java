package rhflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PermissaoRequest(
    @NotBlank
    @Size(max = 100)
    String codigo,

    @Size(max = 255)
    String descricao
) {}