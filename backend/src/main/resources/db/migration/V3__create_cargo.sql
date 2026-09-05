CREATE TABLE cargo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    departamento_id UUID NOT NULL,

    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    nivel VARCHAR(50),

    salario_base NUMERIC(12,2),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cargo_departamento
        FOREIGN KEY (departamento_id)
        REFERENCES departamento(id),

    CONSTRAINT uk_cargo_departamento_nome
        UNIQUE (departamento_id, nome),

    CONSTRAINT ck_cargo_salario
        CHECK (salario_base IS NULL OR salario_base >= 0)
);

CREATE INDEX idx_cargo_departamento
    ON cargo(departamento_id);