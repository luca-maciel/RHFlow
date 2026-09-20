CREATE TABLE ferias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    funcionario_id UUID NOT NULL,

    inicio_periodo_aquisitivo DATE NOT NULL,
    fim_periodo_aquisitivo DATE NOT NULL,

    inicio_gozo DATE NOT NULL,
    fim_gozo DATE NOT NULL,

    quantidade_dias INTEGER NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'SOLICITADA',

    observacao VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ferias_funcionario
        FOREIGN KEY (funcionario_id)
        REFERENCES funcionario(id),

    CONSTRAINT ck_ferias_periodo_aquisitivo
        CHECK (
            fim_periodo_aquisitivo >= inicio_periodo_aquisitivo
        ),

    CONSTRAINT ck_ferias_periodo_gozo
        CHECK (
            fim_gozo >= inicio_gozo
        ),

    CONSTRAINT ck_ferias_quantidade_dias
        CHECK (
            quantidade_dias > 0
        ),

    CONSTRAINT ck_ferias_status
        CHECK (
            status IN (
                'SOLICITADA',
                'APROVADA',
                'REJEITADA',
                'EM_GOZO',
                'CONCLUIDA',
                'CANCELADA'
            )
        )
);

CREATE INDEX idx_ferias_funcionario
    ON ferias(funcionario_id);

CREATE INDEX idx_ferias_status
    ON ferias(status);

CREATE INDEX idx_ferias_inicio_gozo
    ON ferias(inicio_gozo);