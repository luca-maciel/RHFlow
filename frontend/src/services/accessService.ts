import axios from "axios";

import { api } from "./api";


import type {
  EmployeeOption,
  Permission,
  PermissionModule,
  Role,
  RoleInput,
  User,
  UserInput,
} from "../types/access";

interface UsuarioApi {
  id: string;
  nome: string;
  email: string;

  funcionarioId: string | null;

  ativo: boolean;

  perfis: string[];
  perfilIds: string[];
  permissaoIdsIndividuais: string[];

  createdAt: string;
  updatedAt: string;
}

interface FuncionarioApi {
  id: string;

  cargoId: string | null;
  cargoNome: string | null;

  departamentoId: string | null;
  departamentoNome: string | null;

  empresaId: string | null;
  empresaNome: string | null;

  nome: string;
  cpf: string;
  rg: string | null;

  dataNascimento: string | null;

  email: string;
  telefone: string | null;

  dataAdmissao: string;
  dataDemissao: string | null;

  status: string;
  ativo: boolean;

  createdAt: string;
  updatedAt: string;
}

interface PerfilApi {
  id: string;
  nome: string;
  descricao: string;
  permissoes: string[];
}

interface PermissaoApi {
  id: string;
  codigo: string;
  descricao: string;
}

function getPermissionModule(
  code: string,
): PermissionModule {
  const prefix = code.split("_")[0];

  switch (prefix) {
    case "USUARIOS":
      return "Usuários";

    case "PERFIS":
      return "Perfis";

    case "PERMISSOES":
      return "Permissões";

    case "FUNCIONARIOS":
      return "Funcionários";

    case "EMPRESAS":
      return "Empresas";

    case "DEPARTAMENTOS":
      return "Departamentos";

    case "CARGOS":
      return "Cargos";

    case "FERIAS":
      return "Férias";

    case "DOCUMENTOS":
      return "Documentos";

    case "AVALIACOES":
      return "Avaliações";

    default:
      return "Usuários";
  }
}

function mapPermission(
  permission: PermissaoApi,
): Permission {
  return {
    id: permission.id,
    code: permission.codigo,

    name:
      permission.descricao ||
      permission.codigo,

    description:
      permission.descricao ?? "",

    module: getPermissionModule(
      permission.codigo,
    ),
  };
}

function mapUser(
  user: UsuarioApi,
): User {
  return {
    id: user.id,

    name: user.nome,

    email: user.email,

    employeeId:
      user.funcionarioId ?? null,

    /*
     * O UsuarioResponse ainda não envia
     * o nome do funcionário.
     *
     * Vamos integrar isso depois usando
     * /funcionarios.
     */
    employeeName: null,

    active: user.ativo,

    roleIds:
      user.perfilIds ?? [],

    permissionIds:
      user.permissaoIdsIndividuais ?? [],

    createdAt: user.createdAt,
  };
}

function apiError(
  error: unknown,
  fallback: string,
): Error {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (
      typeof data === "object" &&
      data !== null
    ) {
      if (
        "message" in data &&
        typeof data.message === "string"
      ) {
        return new Error(data.message);
      }

      if (
        "erro" in data &&
        typeof data.erro === "string"
      ) {
        return new Error(data.erro);
      }

      if (
        "error" in data &&
        typeof data.error === "string"
      ) {
        return new Error(data.error);
      }
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallback);
}

async function getRawPermissions() {
  const { data } =
    await api.get<PermissaoApi[]>(
      "/permissoes",
    );

  return data;
}

async function syncUserRoles(
  userId: string,
  currentIds: string[],
  desiredIds: string[],
) {
  const current =
    new Set(currentIds);

  const desired =
    new Set(desiredIds);

  const add = desiredIds.filter(
    (id) => !current.has(id),
  );

  const remove = currentIds.filter(
    (id) => !desired.has(id),
  );

  await Promise.all([
    ...add.map((roleId) =>
      api.post(
        `/usuarios/${userId}/perfis/${roleId}`,
      ),
    ),

    ...remove.map((roleId) =>
      api.delete(
        `/usuarios/${userId}/perfis/${roleId}`,
      ),
    ),
  ]);
}

async function syncUserPermissions(
  userId: string,
  currentIds: string[],
  desiredIds: string[],
) {
  const current =
    new Set(currentIds);

  const desired =
    new Set(desiredIds);

  const add = desiredIds.filter(
    (id) => !current.has(id),
  );

  const remove = currentIds.filter(
    (id) => !desired.has(id),
  );

  await Promise.all([
    ...add.map((permissionId) =>
      api.post(
        `/usuarios/${userId}/permissoes/${permissionId}`,
      ),
    ),

    ...remove.map((permissionId) =>
      api.delete(
        `/usuarios/${userId}/permissoes/${permissionId}`,
      ),
    ),
  ]);
}

async function syncRolePermissions(
  roleId: string,
  currentIds: string[],
  desiredIds: string[],
) {
  const current =
    new Set(currentIds);

  const desired =
    new Set(desiredIds);

  const add = desiredIds.filter(
    (id) => !current.has(id),
  );

  const remove = currentIds.filter(
    (id) => !desired.has(id),
  );

  await Promise.all([
    ...add.map((permissionId) =>
      api.post(
        `/perfis/${roleId}/permissoes/${permissionId}`,
      ),
    ),

    ...remove.map((permissionId) =>
      api.delete(
        `/perfis/${roleId}/permissoes/${permissionId}`,
      ),
    ),
  ]);
}

export const accessService = {

  async getEmployees(): Promise<EmployeeOption[]> {
    try {
      const { data } =
        await api.get<FuncionarioApi[]>(
          "/funcionarios",
        );

      return data
        .map((employee) => ({
          id: employee.id,
          name: employee.nome,
          email: employee.email,
          active: employee.ativo,
          status: employee.status,
        }))
        .sort((a, b) =>
          a.name.localeCompare(
            b.name,
            "pt-BR",
          ),
        );
    } catch (error) {
      throw apiError(
        error,
        "Não foi possível carregar os funcionários.",
      );
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const { data } =
        await api.get<UsuarioApi[]>(
          "/usuarios",
        );

      return data.map(mapUser);
    } catch (error) {
      throw apiError(
        error,
        "Não foi possível carregar os usuários.",
      );
    }
  },

  async getRoles(): Promise<Role[]> {
    try {
      const [
        rolesResponse,
        permissions,
      ] = await Promise.all([
        api.get<PerfilApi[]>("/perfis"),
        getRawPermissions(),
      ]);

      const permissionByCode =
        new Map(
          permissions.map((permission) => [
            permission.codigo,
            permission.id,
          ]),
        );

      return rolesResponse.data.map(
        (role) => ({
          id: role.id,

          /*
           * Seu backend não possui
           * código separado para perfil.
           *
           * Por enquanto usamos o nome.
           */
          code: role.nome,

          name: role.nome,

          description:
            role.descricao ?? "",

          permissionIds:
            (role.permissoes ?? [])
              .map((code) =>
                permissionByCode.get(code),
              )
              .filter(
                (
                  id,
                ): id is string =>
                  Boolean(id),
              ),

          /*
           * O backend também não possui
           * a propriedade "system".
           */
          system: false,
        }),
      );
    } catch (error) {
      throw apiError(
        error,
        "Não foi possível carregar os perfis.",
      );
    }
  },

  async getPermissions():
    Promise<Permission[]> {
    try {
      const data =
        await getRawPermissions();

      return data.map(mapPermission);
    } catch (error) {
      throw apiError(
        error,
        "Não foi possível carregar as permissões.",
      );
    }
  },


  async savePermission(
    input: {
      code: string;
      description: string;
    },
    id?: string,
  ): Promise<Permission> {
    try {
      const payload = {
        codigo: input.code.trim().toUpperCase(),
        descricao: input.description.trim(),
      };

      const { data } = id
        ? await api.put<PermissaoApi>(
          `/permissoes/${id}`,
          payload,
        )
        : await api.post<PermissaoApi>(
          "/permissoes",
          payload,
        );

      return mapPermission(data);
    } catch (error) {
      throw apiError(
        error,
        "Não foi possível salvar a permissão.",
      );
    }
  },

  async saveUser(
    input: UserInput,
    id?: string,
  ): Promise<User> {
    try {
      let response: UsuarioApi;

      /*
       * =================================
       * EDIÇÃO
       * =================================
       */
      if (id) {
        const currentResponse =
          await api.get<UsuarioApi>(
            `/usuarios/${id}`,
          );

        const current =
          currentResponse.data;

        const updateResponse =
          await api.put<UsuarioApi>(
            `/usuarios/${id}`,
            {
              nome: input.name.trim(),
              email: input.email.trim(),
              funcionarioId:
                input.employeeId,
            },
          );

        response =
          updateResponse.data;

        await syncUserRoles(
          id,
          current.perfilIds ?? [],
          input.roleIds,
        );

        await syncUserPermissions(
          id,
          current.permissaoIdsIndividuais ??
          [],
          input.permissionIds,
        );

        if (
          response.ativo !==
          input.active
        ) {
          await api.patch(
            `/usuarios/${id}/${input.active
              ? "ativar"
              : "desativar"
            }`,
          );
        }
      }

      /*
       * =================================
       * CADASTRO
       * =================================
       */
      else {
        if (
          !input.password ||
          input.password.length < 8
        ) {
          throw new Error(
            "A senha deve possuir pelo menos 8 caracteres.",
          );
        }

        const createResponse =
          await api.post<UsuarioApi>(
            "/usuarios",
            {
              nome: input.name.trim(),
              email: input.email.trim(),
              senha: input.password,
              funcionarioId:
                input.employeeId,
            },
          );

        response =
          createResponse.data;

        await syncUserRoles(
          response.id,
          response.perfilIds ?? [],
          input.roleIds,
        );

        await syncUserPermissions(
          response.id,
          response.permissaoIdsIndividuais ??
          [],
          input.permissionIds,
        );

        if (!input.active) {
          await api.patch(
            `/usuarios/${response.id}/desativar`,
          );
        }
      }

      /*
       * Recarrega o usuário porque perfis,
       * permissões ou status podem ter
       * mudado depois do POST/PUT.
       */
      const finalResponse =
        await api.get<UsuarioApi>(
          `/usuarios/${response.id}`,
        );

      return mapUser(
        finalResponse.data,
      );
    } catch (error) {
      throw apiError(
        error,
        "Não foi possível salvar o usuário.",
      );
    }
  },

  async toggleUser(
    id: string,
  ): Promise<void> {
    try {
      const { data } =
        await api.get<UsuarioApi>(
          `/usuarios/${id}`,
        );

      await api.patch(
        `/usuarios/${id}/${data.ativo
          ? "desativar"
          : "ativar"
        }`,
      );
    } catch (error) {
      throw apiError(
        error,
        "Não foi possível alterar o status do usuário.",
      );
    }
  },

  async saveRole(
    input: RoleInput,
    id?: string,
  ): Promise<Role> {
    try {
      let response: PerfilApi;

      let currentPermissionIds:
        string[] = [];

      const permissions =
        await getRawPermissions();

      const permissionByCode =
        new Map(
          permissions.map((permission) => [
            permission.codigo,
            permission.id,
          ]),
        );

      if (id) {
        const currentResponse =
          await api.get<PerfilApi>(
            `/perfis/${id}`,
          );

        currentPermissionIds =
          (
            currentResponse.data
              .permissoes ?? []
          )
            .map((code) =>
              permissionByCode.get(code),
            )
            .filter(
              (
                permissionId,
              ): permissionId is string =>
                Boolean(permissionId),
            );

        const updateResponse =
          await api.put<PerfilApi>(
            `/perfis/${id}`,
            {
              nome: input.name.trim(),
              descricao:
                input.description.trim(),
            },
          );

        response =
          updateResponse.data;
      } else {
        const createResponse =
          await api.post<PerfilApi>(
            "/perfis",
            {
              nome: input.name.trim(),
              descricao:
                input.description.trim(),
            },
          );

        response =
          createResponse.data;
      }

      await syncRolePermissions(
        response.id,
        currentPermissionIds,
        input.permissionIds,
      );

      const updated =
        await api.get<PerfilApi>(
          `/perfis/${response.id}`,
        );

      return {
        id: updated.data.id,
        code: updated.data.nome,
        name: updated.data.nome,

        description:
          updated.data.descricao ?? "",

        permissionIds:
          (updated.data.permissoes ?? [])
            .map((code) =>
              permissionByCode.get(code),
            )
            .filter(
              (
                permissionId,
              ): permissionId is string =>
                Boolean(permissionId),
            ),

        system: false,
      };
    } catch (error) {
      throw apiError(
        error,
        "Não foi possível salvar o perfil.",
      );
    }
  },
};