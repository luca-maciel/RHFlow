package rhflow.backend.entity.postgresql;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "historico_salarial",
    indexes = {
        @Index(
            name = "idx_historico_salarial_funcionario",
            columnList = "funcionario_id"
        ),
        @Index(
            name = "idx_historico_salarial_contrato",
            columnList = "contrato_id"
        ),
        @Index(
            name = "idx_historico_salarial_vigencia",
            columnList = "data_inicio_vigencia"
        )
    }
)
public class HistoricoSalarial {

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
        name = "contrato_id",
        nullable = false
    )
    private Contrato contrato;

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal valor;

    @Column(
        name = "data_inicio_vigencia",
        nullable = false
    )
    private LocalDate dataInicioVigencia;

    @Column(name = "data_fim_vigencia")
    private LocalDate dataFimVigencia;

    @Column(length = 255)
    private String motivo;

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
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

    public Contrato getContrato() {
        return contrato;
    }

    public void setContrato(Contrato contrato) {
        this.contrato = contrato;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getDataInicioVigencia() {
        return dataInicioVigencia;
    }

    public void setDataInicioVigencia(
            LocalDate dataInicioVigencia
    ) {
        this.dataInicioVigencia =
                dataInicioVigencia;
    }

    public LocalDate getDataFimVigencia() {
        return dataFimVigencia;
    }

    public void setDataFimVigencia(
            LocalDate dataFimVigencia
    ) {
        this.dataFimVigencia =
                dataFimVigencia;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}