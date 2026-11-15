INSERT INTO permissao (codigo, descricao)
VALUES ('AUDITORIA_VISUALIZAR', 'Visualizar logs de auditoria do sistema')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO perfil_permissao (perfil_id, permissao_id)
SELECT perfil.id, permissao.id
FROM perfil
CROSS JOIN permissao
WHERE perfil.nome = 'ADMIN'
  AND permissao.codigo = 'AUDITORIA_VISUALIZAR'
ON CONFLICT DO NOTHING;