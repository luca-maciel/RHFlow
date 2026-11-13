package rhflow.backend.dto;

import rhflow.backend.enums.TipoDocumento;

import java.time.LocalDateTime;
import java.util.UUID;

public record DocumentoResponse(
        UUID id,
        UUID funcionarioId,
        String funcionarioNome,
        UUID solicitacaoId,
        String titulo,
        TipoDocumento tipo,
        String nomeArquivoOriginal,
        String contentType,
        Long tamanhoBytes,
        String observacao,
        LocalDateTime createdAt
) {
}