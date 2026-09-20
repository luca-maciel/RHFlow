package rhflow.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class FuncionarioBeneficioResponse {

    private UUID id;

    private UUID funcionarioId;
    private String funcionarioNome;

    private UUID beneficioId;
    private String beneficioNome;

    private BigDecimal valor;

    private LocalDate dataAdesao;
    private LocalDate dataEncerramento;

    private boolean ativo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FuncionarioBeneficioResponse(
            UUID id,
            UUID funcionarioId,
            String funcionarioNome,
            UUID beneficioId,
            String beneficioNome,
            BigDecimal valor,
            LocalDate dataAdesao,
            LocalDate dataEncerramento,
            boolean ativo,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.funcionarioId = funcionarioId;
        this.funcionarioNome = funcionarioNome;
        this.beneficioId = beneficioId;
        this.beneficioNome = beneficioNome;
        this.valor = valor;
        this.dataAdesao = dataAdesao;
        this.dataEncerramento = dataEncerramento;
        this.ativo = ativo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getFuncionarioId() {
        return funcionarioId;
    }

    public String getFuncionarioNome() {
        return funcionarioNome;
    }

    public UUID getBeneficioId() {
        return beneficioId;
    }

    public String getBeneficioNome() {
        return beneficioNome;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public LocalDate getDataAdesao() {
        return dataAdesao;
    }

    public LocalDate getDataEncerramento() {
        return dataEncerramento;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}