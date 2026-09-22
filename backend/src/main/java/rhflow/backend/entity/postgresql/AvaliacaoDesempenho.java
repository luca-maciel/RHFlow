package rhflow.backend.entity.postgresql;

import jakarta.persistence.*;
import rhflow.backend.enums.StatusAvaliacao;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "avaliacao_desempenho",
    indexes = {
        @Index(
            name = "idx_avaliacao_desempenho_funcionario",
            columnList = "funcionario_id"
        ),
        @Index(
            name = "idx_avaliacao_desempenho_status",
            columnList = "status"
        ),
        @Index(
            name = "idx_avaliacao_desempenho_periodo",
            columnList = "inicio_periodo,fim_periodo"
        )
    }
)
public class AvaliacaoDesempenho {

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
        name = "inicio_periodo",
        nullable = false
    )
    private LocalDate inicioPeriodo;

    @Column(
        name = "fim_periodo",
        nullable = false
    )
    private LocalDate fimPeriodo;

    @Column(
        nullable = false,
        precision = 4,
        scale = 2
    )
    private BigDecimal nota;

    @Column(
        name = "pontos_fortes",
        length = 1000
    )
    private String pontosFortes;

    @Column(
        name = "pontos_melhoria",
        length = 1000
    )
    private String pontosMelhoria;

    @Column(length = 1000)
    private String observacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusAvaliacao status =
            StatusAvaliacao.RASCUNHO;

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
            status = StatusAvaliacao.RASCUNHO;
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

    public LocalDate getInicioPeriodo() {
        return inicioPeriodo;
    }

    public void setInicioPeriodo(LocalDate inicioPeriodo) {
        this.inicioPeriodo = inicioPeriodo;
    }

    public LocalDate getFimPeriodo() {
        return fimPeriodo;
    }

    public void setFimPeriodo(LocalDate fimPeriodo) {
        this.fimPeriodo = fimPeriodo;
    }

    public BigDecimal getNota() {
        return nota;
    }

    public void setNota(BigDecimal nota) {
        this.nota = nota;
    }

    public String getPontosFortes() {
        return pontosFortes;
    }

    public void setPontosFortes(String pontosFortes) {
        this.pontosFortes = pontosFortes;
    }

    public String getPontosMelhoria() {
        return pontosMelhoria;
    }

    public void setPontosMelhoria(String pontosMelhoria) {
        this.pontosMelhoria = pontosMelhoria;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public StatusAvaliacao getStatus() {
        return status;
    }

    public void setStatus(StatusAvaliacao status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}