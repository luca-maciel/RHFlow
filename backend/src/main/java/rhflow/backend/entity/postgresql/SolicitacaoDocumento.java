package rhflow.backend.entity.postgresql;

import jakarta.persistence.*;
import rhflow.backend.enums.StatusSolicitacaoDocumento;
import rhflow.backend.enums.TipoDocumento;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "solicitacao_documento",
    indexes = {
        @Index(name = "idx_solicitacao_doc_funcionario", columnList = "funcionario_id"),
        @Index(name = "idx_solicitacao_doc_status", columnList = "status")
    }
)
public class SolicitacaoDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", nullable = false, length = 40)
    private TipoDocumento tipoDocumento;

    @Column(length = 500)
    private String justificativa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusSolicitacaoDocumento status = StatusSolicitacaoDocumento.PENDENTE;

    @Column(name = "motivo_rejeicao", length = 500)
    private String motivoRejeicao;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documento_id")
    private Documento documento;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime agora = LocalDateTime.now();
        createdAt = agora;
        updatedAt = agora;
        if (status == null) {
            status = StatusSolicitacaoDocumento.PENDENTE;
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

    public StatusSolicitacaoDocumento getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacaoDocumento status) {
        this.status = status;
    }

    public String getMotivoRejeicao() {
        return motivoRejeicao;
    }

    public void setMotivoRejeicao(String motivoRejeicao) {
        this.motivoRejeicao = motivoRejeicao;
    }

    public Documento getDocumento() {
        return documento;
    }

    public void setDocumento(Documento documento) {
        this.documento = documento;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}