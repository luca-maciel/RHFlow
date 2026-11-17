-- 1. Remove tabelas dependentes primeiro (respeitando FKs)
DROP TABLE IF EXISTS funcionario_beneficio CASCADE;
DROP TABLE IF EXISTS beneficio CASCADE;
DROP TABLE IF EXISTS avaliacao_desempenho CASCADE;
DROP TABLE IF EXISTS historico_salarial CASCADE;

-- 2. Remove permissões órfãs ligadas aos módulos removidos (se existirem)
DELETE FROM perfil_permissao
WHERE permissao_id IN (
    SELECT id FROM permissao
    WHERE codigo LIKE 'BENEFICIOS_%'
       OR codigo LIKE 'AVALIACOES_%'
       OR codigo LIKE 'HISTORICO_SALARIAL_%'
);

DELETE FROM usuario_permissao
WHERE permissao_id IN (
    SELECT id FROM permissao
    WHERE codigo LIKE 'BENEFICIOS_%'
       OR codigo LIKE 'AVALIACOES_%'
       OR codigo LIKE 'HISTORICO_SALARIAL_%'
);

DELETE FROM permissao
WHERE codigo LIKE 'BENEFICIOS_%'
   OR codigo LIKE 'AVALIACOES_%'
   OR codigo LIKE 'HISTORICO_SALARIAL_%';