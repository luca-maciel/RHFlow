CREATE TABLE documento (
    id UUID PRIMARY KEY,
    funcionario_id UUID NOT NULL,
    solicitacao_id UUID NULL,
    titulo VARCHAR(150) NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    nome_arquivo_original VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    observacao VARCHAR(500) NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_documento_funcionario
        FOREIGN KEY (funcionario_id) REFERENCES funcionario (id)
);

CREATE INDEX idx_documento_funcionario ON documento (funcionario_id);
CREATE INDEX idx_documento_tipo ON documento (tipo);

CREATE TABLE solicitacao_documento (
    id UUID PRIMARY KEY,
    funcionario_id UUID NOT NULL,
    tipo_documento VARCHAR(40) NOT NULL,
    justificativa VARCHAR(500) NULL,
    status VARCHAR(30) NOT NULL,
    motivo_rejeicao VARCHAR(500) NULL,
    documento_id UUID NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_solicitacao_doc_funcionario
        FOREIGN KEY (funcionario_id) REFERENCES funcionario (id),
    CONSTRAINT fk_solicitacao_doc_documento
        FOREIGN KEY (documento_id) REFERENCES documento (id)
);

CREATE INDEX idx_solicitacao_doc_funcionario ON solicitacao_documento (funcionario_id);
CREATE INDEX idx_solicitacao_doc_status ON solicitacao_documento (status);

ALTER TABLE documento
    ADD CONSTRAINT fk_documento_solicitacao
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacao_documento (id);

-- Seed das permissões do módulo de Documentos e Solicitações
INSERT INTO permissao (codigo, descricao)
VALUES
    ('DOCUMENTOS_VISUALIZAR', 'Visualizar documentos e solicitações'),
    ('DOCUMENTOS_SOLICITAR', 'Solicitar documentos e visualizar os próprios arquivos'),
    ('DOCUMENTOS_GERENCIAR', 'Enviar, atender e gerenciar documentos')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO perfil_permissao (perfil_id, permissao_id)
SELECT perfil.id, permissao.id
FROM perfil
CROSS JOIN permissao
WHERE perfil.nome = 'ADMIN'
  AND permissao.codigo IN (
      'DOCUMENTOS_VISUALIZAR',
      'DOCUMENTOS_SOLICITAR',
      'DOCUMENTOS_GERENCIAR'
  )
ON CONFLICT DO NOTHING;