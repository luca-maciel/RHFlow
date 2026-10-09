export type PermissionModule =
  | "Usuários"
  | "Perfis"
  | "Permissões"
  | "Funcionários"
  | "Empresas"
  | "Departamentos"
  | "Cargos"
  | "Férias"
  | "Documentos"
  | "Avaliações";

export type Permission = {
  id: string;
  code: string;
  name: string;
  description: string;
  module: PermissionModule;
};

export type Role = {
  id: string;
  code: string;
  name: string;
  description: string;
  permissionIds: string[];
  system: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;

  employeeId: string | null;
  employeeName: string | null;

  active: boolean;

  roleIds: string[];
  permissionIds: string[];

  createdAt: string;
};

export type UserInput = {
  name: string;
  email: string;

  password?: string;

  employeeId: string | null;
  employeeName: string | null;

  active: boolean;

  roleIds: string[];
  permissionIds: string[];
};

export type EmployeeOption = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  status: string;
};

export type RoleInput = Omit<Role, "id">;