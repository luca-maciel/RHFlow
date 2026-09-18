CREATE TABLE contrato (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    funcionario_id UUID NOT NULL,

    tipo VARCHAR(50) NOT NULL,

    data_inicio DATE NOT NULL,
    data_fim DATE,

    status VARCHAR(30) NOT NULL,

    descricao VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_contrato_funcionario
        FOREIGN KEY (funcionario_id)
        REFERENCES funcionario(id),

    CONSTRAINT ck_contrato_datas
        CHECK (
            data_fim IS NULL
            OR data_fim >= data_inicio
        )
);

CREATE INDEX idx_contrato_funcionario
    ON contrato(funcionario_id);

CREATE INDEX idx_contrato_status
    ON contrato(status);