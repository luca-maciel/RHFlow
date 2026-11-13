package rhflow.backend.dto;

import rhflow.backend.enums.StatusSolicitacaoDocumento;
import rhflow.backend.enums.TipoDocumento;

import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitacaoDocumentoResponse(
        UUID id,
        UUID funcionarioId,
        String funcionarioNome,
        TipoDocumento tipoDocumento,
        String justificativa,
        StatusSolicitacaoDocumento status,
        String motivoRejeicao,
        UUID documentoId,
        String documentoTitulo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}