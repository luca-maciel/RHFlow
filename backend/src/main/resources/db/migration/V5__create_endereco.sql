CREATE TABLE endereco (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    funcionario_id UUID NOT NULL UNIQUE,

    cep VARCHAR(8),
    logradouro VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado CHAR(2),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_endereco_funcionario
        FOREIGN KEY (funcionario_id)
        REFERENCES funcionario(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_endereco_funcionario
    ON endereco(funcionario_id);