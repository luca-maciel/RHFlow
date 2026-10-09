import type { Permission, Role, User } from '../types/access';
const definitions = [
  ['Usuários', 'USERS', ['VISUALIZAR', 'CRIAR', 'EDITAR', 'DESATIVAR']],
  ['Funcionários', 'EMPLOYEES', ['VISUALIZAR', 'CRIAR', 'EDITAR', 'DESLIGAR']],
  ['Empresas', 'COMPANIES', ['VISUALIZAR', 'CRIAR', 'EDITAR']],
  ['Departamentos', 'DEPARTMENTS', ['VISUALIZAR', 'CRIAR', 'EDITAR']],
  ['Cargos', 'POSITIONS', ['VISUALIZAR', 'CRIAR', 'EDITAR']],
  ['Férias', 'VACATIONS', ['VISUALIZAR', 'SOLICITAR', 'APROVAR']],
  ['Documentos', 'DOCUMENTS', ['VISUALIZAR', 'ENVIAR', 'EXCLUIR']],
  ['Avaliações', 'REVIEWS', ['VISUALIZAR', 'CRIAR', 'EDITAR']],
] as const;
export const initialPermissions: Permission[] = definitions.flatMap(([module, prefix, actions]) => actions.map(action => ({
  id: `${prefix}_${action}`, code: `${prefix}_${action}`, name: action.charAt(0) + action.slice(1).toLowerCase(),
  description: `${action.charAt(0) + action.slice(1).toLowerCase()} registros do módulo ${module.toLowerCase()}.`, module,
})));
const all = initialPermissions.map(p => p.id);
export const initialRoles: Role[] = [
  { id: 'admin', code: 'ADMIN', name: 'Administrador', description: 'Acesso administrativo completo.', permissionIds: all, system: true },
  { id: 'hr', code: 'RH', name: 'Recursos Humanos', description: 'Gestão de colaboradores e rotinas de RH.', permissionIds: all.filter(id => !id.startsWith('USERS_')), system: true },
  { id: 'manager', code: 'GESTOR', name: 'Gestor', description: 'Consulta de dados e aprovação de férias.', permissionIds: ['EMPLOYEES_VISUALIZAR','VACATIONS_VISUALIZAR','VACATIONS_APROVAR','DOCUMENTS_VISUALIZAR','REVIEWS_VISUALIZAR'], system: true },
  { id: 'employee', code: 'FUNCIONARIO', name: 'Funcionário', description: 'Acesso básico às informações e solicitações.', permissionIds: ['VACATIONS_VISUALIZAR','VACATIONS_SOLICITAR','DOCUMENTS_VISUALIZAR'], system: true },
];
export const initialUsers: User[] = [
  { id: 'u1', name: 'João Silva', email: 'joao@empresa.com', employeeId: 'demo-1', employeeName: 'João Silva', active: true, roleIds: ['admin'], permissionIds: [], createdAt: '2026-09-01' },
  { id: 'u2', name: 'Mariana Costa', email: 'mariana@empresa.com', employeeId: 'demo-2', employeeName: 'Mariana Costa', active: true, roleIds: ['hr'], permissionIds: ['USERS_VISUALIZAR'], createdAt: '2026-09-03' },
  { id: 'u3', name: 'Pedro Almeida', email: 'pedro@empresa.com', employeeId: 'demo-3', employeeName: 'Pedro Almeida', active: false, roleIds: ['manager'], permissionIds: [], createdAt: '2026-09-05' },
];
