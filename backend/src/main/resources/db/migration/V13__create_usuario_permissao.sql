CREATE TABLE usuario_permissao (
    usuario_id UUID NOT NULL,
    permissao_id UUID NOT NULL,

    PRIMARY KEY (usuario_id, permissao_id),

    CONSTRAINT fk_usuario_permissao_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_usuario_permissao_permissao
        FOREIGN KEY (permissao_id)
        REFERENCES permissao(id)
);