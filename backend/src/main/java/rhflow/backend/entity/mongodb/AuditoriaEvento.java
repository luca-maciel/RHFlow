package rhflow.backend.entity.mongodb;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "auditoria_eventos")
public class AuditoriaEvento {

    @Id
    private String id;

    @Indexed
    private String acao;

    @Indexed
    private String entidade;

    private String entidadeId;

    @Indexed
    private String usuarioId;

    private String usuarioNome;

    private String descricao;

    private Map<String, Object> detalhes;

    @Indexed
    private LocalDateTime dataHora;

    public AuditoriaEvento() {
    }

    public AuditoriaEvento(
            String acao,
            String entidade,
            String entidadeId,
            String usuarioId,
            String usuarioNome,
            String descricao,
            Map<String, Object> detalhes) {
        this.acao = acao;
        this.entidade = entidade;
        this.entidadeId = entidadeId;
        this.usuarioId = usuarioId;
        this.usuarioNome = usuarioNome;
        this.descricao = descricao;
        this.detalhes = detalhes;
        this.dataHora = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public String getAcao() {
        return acao;
    }

    public void setAcao(String acao) {
        this.acao = acao;
    }

    public String getEntidade() {
        return entidade;
    }

    public void setEntidade(String entidade) {
        this.entidade = entidade;
    }

    public String getEntidadeId() {
        return entidadeId;
    }

    public void setEntidadeId(String entidadeId) {
        this.entidadeId = entidadeId;
    }

    public String getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(String usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Map<String, Object> getDetalhes() {
        return detalhes;
    }

    public void setDetalhes(Map<String, Object> detalhes) {
        this.detalhes = detalhes;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}