package rhflow.backend.dto;

import java.util.Set;
import java.util.UUID;

public record AuthMeResponse(
    UUID id,
    String nome,
    String email,
    boolean ativo,
    Set<String> perfis,
    Set<String> permissoes
) {}