package rhflow.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import rhflow.backend.enums.TipoDocumento;

public class SolicitacaoDocumentoRequest {

    @NotNull(message = "O tipo de documento é obrigatório.")
    private TipoDocumento tipoDocumento;

    @Size(max = 500, message = "A justificativa deve ter no máximo 500 caracteres.")
    private String justificativa;

    public TipoDocumento getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(TipoDocumento tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public void setJustificativa(String justificativa) {
        this.justificativa = justificativa;
    }
}