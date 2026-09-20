package rhflow.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class EncerramentoBeneficioRequest {

    @NotNull
    private LocalDate dataEncerramento;

    public LocalDate getDataEncerramento() {
        return dataEncerramento;
    }

    public void setDataEncerramento(
            LocalDate dataEncerramento
    ) {
        this.dataEncerramento = dataEncerramento;
    }
}