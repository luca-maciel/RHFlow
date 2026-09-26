-- 1. Usuários
CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    funcionario_id UUID UNIQUE,

    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_funcionario
        FOREIGN KEY (funcionario_id)
        REFERENCES funcionario(id)
);

CREATE UNIQUE INDEX uk_usuario_email
    ON usuario (LOWER(email));


-- 2. Perfis
CREATE TABLE perfil (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 3. Permissões
CREATE TABLE permissao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    codigo VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255)
);


-- 4. Associação entre usuários e perfis
CREATE TABLE usuario_perfil (
    usuario_id UUID NOT NULL,
    perfil_id UUID NOT NULL,

    PRIMARY KEY (usuario_id, perfil_id),

    CONSTRAINT fk_usuario_perfil_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_usuario_perfil_perfil
        FOREIGN KEY (perfil_id)
        REFERENCES perfil(id)
);


-- 5. Associação entre perfis e permissões
CREATE TABLE perfil_permissao (
    perfil_id UUID NOT NULL,
    permissao_id UUID NOT NULL,

    PRIMARY KEY (perfil_id, permissao_id),

    CONSTRAINT fk_perfil_permissao_perfil
        FOREIGN KEY (perfil_id)
        REFERENCES perfil(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_perfil_permissao_permissao
        FOREIGN KEY (permissao_id)
        REFERENCES permissao(id)
);