CREATE TABLE avaliacao_desempenho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    funcionario_id UUID NOT NULL,

    inicio_periodo DATE NOT NULL,
    fim_periodo DATE NOT NULL,

    nota NUMERIC(4,2) NOT NULL,

    pontos_fortes VARCHAR(1000),
    pontos_melhoria VARCHAR(1000),
    observacao VARCHAR(1000),

    status VARCHAR(30) NOT NULL DEFAULT 'RASCUNHO',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_avaliacao_desempenho_funcionario
        FOREIGN KEY (funcionario_id)
        REFERENCES funcionario(id),

    CONSTRAINT ck_avaliacao_desempenho_periodo
        CHECK (
            fim_periodo >= inicio_periodo
        ),

    CONSTRAINT ck_avaliacao_desempenho_nota
        CHECK (
            nota >= 0
            AND nota <= 10
        ),

    CONSTRAINT ck_avaliacao_desempenho_status
        CHECK (
            status IN (
                'RASCUNHO',
                'FINALIZADA',
                'CANCELADA'
            )
        )
);

CREATE INDEX idx_avaliacao_desempenho_funcionario
    ON avaliacao_desempenho(funcionario_id);

CREATE INDEX idx_avaliacao_desempenho_status
    ON avaliacao_desempenho(status);

CREATE INDEX idx_avaliacao_desempenho_periodo
    ON avaliacao_desempenho(inicio_periodo, fim_periodo);