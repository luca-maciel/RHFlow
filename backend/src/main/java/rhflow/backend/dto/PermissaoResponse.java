package rhflow.backend.dto;

import java.util.UUID;

public record PermissaoResponse(
    UUID id,
    String codigo,
    String descricao
) {}