package rhflow.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class DesligamentoFuncionarioRequest {

    @NotNull(message = "A data de desligamento é obrigatória.")
    private LocalDate dataDemissao;

    public LocalDate getDataDemissao() {
        return dataDemissao;
    }

    public void setDataDemissao(LocalDate dataDemissao) {
        this.dataDemissao = dataDemissao;
    }
}