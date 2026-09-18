CREATE TABLE historico_salarial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    funcionario_id UUID NOT NULL,
    contrato_id UUID NOT NULL,

    valor NUMERIC(12,2) NOT NULL,

    data_inicio_vigencia DATE NOT NULL,
    data_fim_vigencia DATE,

    motivo VARCHAR(255),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_historico_salarial_funcionario
        FOREIGN KEY (funcionario_id)
        REFERENCES funcionario(id),

    CONSTRAINT fk_historico_salarial_contrato
        FOREIGN KEY (contrato_id)
        REFERENCES contrato(id),

    CONSTRAINT ck_historico_salarial_valor
        CHECK (valor >= 0),

    CONSTRAINT ck_historico_salarial_datas
        CHECK (
            data_fim_vigencia IS NULL
            OR data_fim_vigencia >= data_inicio_vigencia
        )
);

CREATE INDEX idx_historico_salarial_funcionario
    ON historico_salarial(funcionario_id);

CREATE INDEX idx_historico_salarial_contrato
    ON historico_salarial(contrato_id);

CREATE INDEX idx_historico_salarial_vigencia
    ON historico_salarial(data_inicio_vigencia);