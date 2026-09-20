CREATE TABLE beneficio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(500),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE funcionario_beneficio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    funcionario_id UUID NOT NULL,
    beneficio_id UUID NOT NULL,

    valor NUMERIC(12,2),

    data_adesao DATE NOT NULL,
    data_encerramento DATE,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_funcionario_beneficio_funcionario
        FOREIGN KEY (funcionario_id)
        REFERENCES funcionario(id),

    CONSTRAINT fk_funcionario_beneficio_beneficio
        FOREIGN KEY (beneficio_id)
        REFERENCES beneficio(id),

    CONSTRAINT ck_funcionario_beneficio_valor
        CHECK (
            valor IS NULL
            OR valor >= 0
        ),

    CONSTRAINT ck_funcionario_beneficio_datas
        CHECK (
            data_encerramento IS NULL
            OR data_encerramento >= data_adesao
        )
);

CREATE INDEX idx_funcionario_beneficio_funcionario
    ON funcionario_beneficio(funcionario_id);

CREATE INDEX idx_funcionario_beneficio_beneficio
    ON funcionario_beneficio(beneficio_id);

CREATE INDEX idx_funcionario_beneficio_ativo
    ON funcionario_beneficio(ativo);