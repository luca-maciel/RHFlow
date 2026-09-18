package rhflow.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class EncerramentoContratoRequest {

    @NotNull
    private LocalDate dataFim;

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }
}