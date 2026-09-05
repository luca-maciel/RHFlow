CREATE TABLE departamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    empresa_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_departamento_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresa(id),

    CONSTRAINT uk_departamento_empresa_nome
        UNIQUE (empresa_id, nome)
);

CREATE INDEX idx_departamento_empresa
    ON departamento(empresa_id);