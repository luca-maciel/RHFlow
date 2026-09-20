package rhflow.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class BeneficioResponse {

    private UUID id;
    private String nome;
    private String descricao;
    private boolean ativo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BeneficioResponse(
            UUID id,
            String nome,
            String descricao,
            boolean ativo,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.ativo = ativo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
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