INSERT INTO permissao (codigo, descricao)
VALUES
    ('USUARIOS_VISUALIZAR', 'Visualizar usuários'),
    ('USUARIOS_GERENCIAR', 'Gerenciar usuários'),

    ('PERFIS_VISUALIZAR', 'Visualizar perfis'),
    ('PERFIS_GERENCIAR', 'Gerenciar perfis'),

    ('PERMISSOES_VISUALIZAR', 'Visualizar permissões'),
    ('PERMISSOES_GERENCIAR', 'Gerenciar permissões'),

    ('FUNCIONARIOS_VISUALIZAR', 'Visualizar funcionários'),
    ('FUNCIONARIOS_GERENCIAR', 'Gerenciar funcionários'),

    ('EMPRESAS_VISUALIZAR', 'Visualizar empresas'),
    ('EMPRESAS_GERENCIAR', 'Gerenciar empresas'),

    ('DEPARTAMENTOS_VISUALIZAR', 'Visualizar departamentos'),
    ('DEPARTAMENTOS_GERENCIAR', 'Gerenciar departamentos'),

    ('CARGOS_VISUALIZAR', 'Visualizar cargos'),
    ('CARGOS_GERENCIAR', 'Gerenciar cargos'),

    ('FERIAS_VISUALIZAR', 'Visualizar férias'),
    ('FERIAS_SOLICITAR', 'Solicitar férias'),
    ('FERIAS_APROVAR', 'Aprovar ou rejeitar férias')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO perfil_permissao (
    perfil_id,
    permissao_id
)
SELECT
    perfil.id,
    permissao.id
FROM perfil
CROSS JOIN permissao
WHERE perfil.nome = 'ADMIN'
ON CONFLICT DO NOTHING;