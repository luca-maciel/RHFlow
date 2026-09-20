package rhflow.backend.entity.postgresql;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "funcionario_beneficio",
    indexes = {
        @Index(
            name = "idx_funcionario_beneficio_funcionario",
            columnList = "funcionario_id"
        ),
        @Index(
            name = "idx_funcionario_beneficio_beneficio",
            columnList = "beneficio_id"
        ),
        @Index(
            name = "idx_funcionario_beneficio_ativo",
            columnList = "ativo"
        )
    }
)
public class FuncionarioBeneficio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "funcionario_id",
        nullable = false
    )
    private Funcionario funcionario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "beneficio_id",
        nullable = false
    )
    private Beneficio beneficio;

    @Column(
        precision = 12,
        scale = 2
    )
    private BigDecimal valor;

    @Column(
        name = "data_adesao",
        nullable = false
    )
    private LocalDate dataAdesao;

    @Column(name = "data_encerramento")
    private LocalDate dataEncerramento;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
        name = "updated_at",
        nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime agora = LocalDateTime.now();

        createdAt = agora;
        updatedAt = agora;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public Funcionario getFuncionario() {
        return funcionario;
    }

    public void setFuncionario(Funcionario funcionario) {
        this.funcionario = funcionario;
    }

    public Beneficio getBeneficio() {
        return beneficio;
    }

    public void setBeneficio(Beneficio beneficio) {
        this.beneficio = beneficio;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getDataAdesao() {
        return dataAdesao;
    }

    public void setDataAdesao(LocalDate dataAdesao) {
        this.dataAdesao = dataAdesao;
    }

    public LocalDate getDataEncerramento() {
        return dataEncerramento;
    }

    public void setDataEncerramento(
            LocalDate dataEncerramento
    ) {
        this.dataEncerramento = dataEncerramento;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}