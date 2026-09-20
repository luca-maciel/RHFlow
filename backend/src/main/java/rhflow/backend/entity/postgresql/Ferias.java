package rhflow.backend.entity.postgresql;

import jakarta.persistence.*;
import rhflow.backend.enums.StatusFerias;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "ferias",
    indexes = {
        @Index(
            name = "idx_ferias_funcionario",
            columnList = "funcionario_id"
        ),
        @Index(
            name = "idx_ferias_status",
            columnList = "status"
        ),
        @Index(
            name = "idx_ferias_inicio_gozo",
            columnList = "inicio_gozo"
        )
    }
)
public class Ferias {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "funcionario_id",
        nullable = false
    )
    private Funcionario funcionario;

    @Column(
        name = "inicio_periodo_aquisitivo",
        nullable = false
    )
    private LocalDate inicioPeriodoAquisitivo;

    @Column(
        name = "fim_periodo_aquisitivo",
        nullable = false
    )
    private LocalDate fimPeriodoAquisitivo;

    @Column(
        name = "inicio_gozo",
        nullable = false
    )
    private LocalDate inicioGozo;

    @Column(
        name = "fim_gozo",
        nullable = false
    )
    private LocalDate fimGozo;

    @Column(
        name = "quantidade_dias",
        nullable = false
    )
    private Integer quantidadeDias;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusFerias status = StatusFerias.SOLICITADA;

    @Column(length = 500)
    private String observacao;

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

        if (status == null) {
            status = StatusFerias.SOLICITADA;
        }
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

    public LocalDate getInicioPeriodoAquisitivo() {
        return inicioPeriodoAquisitivo;
    }

    public void setInicioPeriodoAquisitivo(
            LocalDate inicioPeriodoAquisitivo
    ) {
        this.inicioPeriodoAquisitivo =
                inicioPeriodoAquisitivo;
    }

    public LocalDate getFimPeriodoAquisitivo() {
        return fimPeriodoAquisitivo;
    }

    public void setFimPeriodoAquisitivo(
            LocalDate fimPeriodoAquisitivo
    ) {
        this.fimPeriodoAquisitivo =
                fimPeriodoAquisitivo;
    }

    public LocalDate getInicioGozo() {
        return inicioGozo;
    }

    public void setInicioGozo(LocalDate inicioGozo) {
        this.inicioGozo = inicioGozo;
    }

    public LocalDate getFimGozo() {
        return fimGozo;
    }

    public void setFimGozo(LocalDate fimGozo) {
        this.fimGozo = fimGozo;
    }

    public Integer getQuantidadeDias() {
        return quantidadeDias;
    }

    public void setQuantidadeDias(Integer quantidadeDias) {
        this.quantidadeDias = quantidadeDias;
    }

    public StatusFerias getStatus() {
        return status;
    }

    public void setStatus(StatusFerias status) {
        this.status = status;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}