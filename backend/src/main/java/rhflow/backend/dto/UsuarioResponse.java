package rhflow.backend.dto;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record UsuarioResponse(

    UUID id,
    String nome,
    String email,
    UUID funcionarioId,
    boolean ativo,
    Set<String> perfis,
    LocalDateTime createdAt,
    LocalDateTime updatedAt

) {}