CREATE TABLE funcionario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cargo_id UUID NOT NULL,

    nome VARCHAR(150) NOT NULL,

    cpf VARCHAR(11) NOT NULL UNIQUE,
    rg VARCHAR(20),

    data_nascimento DATE,

    email VARCHAR(150),
    telefone VARCHAR(20),

    data_admissao DATE NOT NULL,
    data_demissao DATE,

    status VARCHAR(30) NOT NULL DEFAULT 'ATIVO',

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_funcionario_cargo
        FOREIGN KEY (cargo_id)
        REFERENCES cargo(id),

    CONSTRAINT ck_funcionario_datas
        CHECK (
            data_demissao IS NULL
            OR data_demissao >= data_admissao
        ),

    CONSTRAINT ck_funcionario_status
        CHECK (
            status IN (
                'ATIVO',
                'AFASTADO',
                'FERIAS',
                'DESLIGADO'
            )
        )
);

CREATE INDEX idx_funcionario_cargo
    ON funcionario(cargo_id);

CREATE INDEX idx_funcionario_status
    ON funcionario(status);

CREATE INDEX idx_funcionario_nome
    ON funcionario(nome);