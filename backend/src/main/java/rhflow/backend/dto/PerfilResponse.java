package rhflow.backend.dto;

import java.util.Set;
import java.util.UUID;

public record PerfilResponse(
    UUID id,
    String nome,
    String descricao,
    Set<String> permissoes
) {}