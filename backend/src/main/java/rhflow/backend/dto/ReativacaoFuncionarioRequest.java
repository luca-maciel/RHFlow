package rhflow.backend.dto;

import jakarta.validation.constraints.NotNull;
import rhflow.backend.enums.StatusFuncionario;

public record ReativacaoFuncionarioRequest(@NotNull StatusFuncionario status) {}
