import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Pencil, UserRoundCheck, UserRoundX } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

import {
  CheckPermissions,
  field,
  Modal,
  primary,
  secondary,
} from "../../components/admin/AdminUI";

import { accessService } from "../../services/accessService";

import type {
  EmployeeOption,
  Permission,
  Role,
  User,
  UserInput,
} from "../../types/access";

const empty: UserInput = {
  name: "",
  email: "",
  password: "",
  employeeId: null,
  employeeName: null,
  active: true,
  roleIds: [],
  permissionIds: [],
};

export default function Users() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const { hasPermission } = useAuth();

  const canManage = hasPermission("USUARIOS_GERENCIAR");

  const canView = canManage || hasPermission("USUARIOS_VISUALIZAR");

  const canViewEmployees =
    hasPermission("FUNCIONARIOS_VISUALIZAR") ||
    hasPermission("FUNCIONARIOS_GERENCIAR");

  const [sidebar, setSidebar] = useState(false);

  const [users, setUsers] = useState<User[]>([]);

  const [roles, setRoles] = useState<Role[]>([]);

  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [selected, setSelected] = useState<User | null>(null);

  const [form, setForm] = useState<UserInput>(empty);

  const [open, setOpen] = useState(false);

  const [tab, setTab] = useState<"data" | "roles" | "permissions">("data");

  const [error, setError] = useState("");

  const [loadError, setLoadError] = useState("");

  const [actionError, setActionError] = useState("");

  const [busy, setBusy] = useState(false);

  const [loading, setLoading] = useState(true);

  async function load() {
    setLoadError("");

    try {
      setLoading(true);

      const [usersResult, rolesResult, permissionsResult, employeesResult] =
        await Promise.allSettled([
          accessService.getUsers(),
          accessService.getRoles(),
          accessService.getPermissions(),

          canViewEmployees ? accessService.getEmployees() : Promise.resolve([]),
        ]);

      if (usersResult.status === "rejected") {
        throw usersResult.reason;
      }

      if (rolesResult.status === "fulfilled") {
        setRoles(rolesResult.value);
      } else {
        setRoles([]);
      }

      if (permissionsResult.status === "fulfilled") {
        setPermissions(permissionsResult.value);
      } else {
        setPermissions([]);
      }

      let employeeList: EmployeeOption[] = [];

      if (employeesResult.status === "fulfilled") {
        employeeList = employeesResult.value;

        setEmployees(employeeList);
      } else {
        setEmployees([]);
      }

      const employeeMap = new Map(
        employeeList.map((employee) => [employee.id, employee.name]),
      );

      const userList = usersResult.value.map((user) => ({
        ...user,

        employeeName: user.employeeId
          ? (employeeMap.get(user.employeeId) ?? null)
          : null,
      }));

      setUsers(userList);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os usuários.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canView) {
      void load();
    }
  }, [canView, canViewEmployees]);

  function start(user: User | null) {
    if (!canManage) {
      return;
    }

    setSelected(user);

    if (user) {
      setForm({
        name: user.name,
        email: user.email,

        /*
         * Não carregamos senha existente.
         * Senha jamais deve voltar da API.
         */
        password: "",

        employeeId: user.employeeId,
        employeeName: user.employeeName,

        active: user.active,

        roleIds: [...user.roleIds],

        permissionIds: [...user.permissionIds],
      });
    } else {
      setForm({
        ...empty,
        roleIds: [],
        permissionIds: [],
      });
    }

    setError("");
    setActionError("");
    setTab("data");
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage) {
      return;
    }

    /*
     * Nome e e-mail
     */
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Informe nome e e-mail válidos.");

      setTab("data");
      return;
    }

    /*
     * Senha é obrigatória somente
     * na criação.
     */
    if (!selected && (!form.password || form.password.length < 8)) {
      setError("A senha deve possuir pelo menos 8 caracteres.");

      setTab("data");
      return;
    }

    try {
      setBusy(true);
      setError("");

      await accessService.saveUser(
        {
          ...form,

          name: form.name.trim(),

          email: form.email.trim(),
        },

        selected?.id,
      );

      await load();

      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o usuário.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggle(user: User) {
    if (!canManage) {
      return;
    }

    setActionError("");

    try {
      await accessService.toggleUser(user.id);

      await load();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar o status do usuário.",
      );
    }
  }

  const filtered = users.filter((user) => {
    const text = `${user.name} ${user.email} ${
      user.employeeName ?? ""
    }`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    const matchesStatus =
      filter === "ALL" || (filter === "ACTIVE") === user.active;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebar} onClose={() => setSidebar(false)} />

      <Header onMenuClick={() => setSidebar(true)} />

      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px]">
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {/* =====================================
              CABEÇALHO
          ====================================== */}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-primary">
                Administração
              </p>

              <h1 className="mt-1 text-2xl font-bold text-foreground">
                Usuários
              </h1>

              <p className="mt-1 text-sm text-muted">
                Contas, perfis e permissões individuais.
              </p>
            </div>

            {canManage && (
              <button
                type="button"
                className={primary}
                onClick={() => start(null)}
              >
                + Novo usuário
              </button>
            )}
          </div>

          {/* =====================================
              ERROS
          ====================================== */}

          {loadError && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger"
            >
              {loadError}
            </p>
          )}

          {actionError && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger"
            >
              {actionError}
            </p>
          )}

          {/* =====================================
              CONTEÚDO
          ====================================== */}

          <section className="rounded-2xl border border-app-border bg-surface">
            {/* FILTROS */}

            <div className="grid gap-3 border-b border-app-border p-4 sm:grid-cols-[1fr_180px]">
              <input
                className={field}
                placeholder="Pesquisar nome ou e-mail"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className={field}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="ALL">Todos os status</option>

                <option value="ACTIVE">Ativos</option>

                <option value="INACTIVE">Inativos</option>
              </select>
            </div>

            {/* =================================
                LOADING
            ================================== */}

            {loading && (
              <div className="p-10 text-center">
                <p className="text-sm text-muted">Carregando usuários...</p>
              </div>
            )}

            {/* =================================
                DESKTOP
            ================================== */}

            {!loading && (
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-secondary text-xs text-muted">
                    <tr>
                      {[
                        "Usuário",
                        "Funcionário vinculado",
                        "Perfis",
                        "Status",

                        ...(canManage ? ["Ações"] : []),
                      ].map((header) => (
                        <th key={header} className="p-4">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((user) => (
                      <tr
                        key={user.id}
                        className="group border-t border-app-border transition-colors duration-200 hover:bg-surface-hover/60"
                      >
                        {/* USUÁRIO */}

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-icon-surface text-xs font-bold text-primary">
                              {user.name
                                .trim()
                                .split(/\s+/)
                                .map((word) => word[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </span>

                            <div>
                              <p className="font-semibold text-foreground">
                                {user.name}
                              </p>

                              <p className="text-xs text-muted">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* FUNCIONÁRIO */}

                        <td className="p-4 text-muted">
                          {user.employeeName || "Não vinculado"}
                        </td>

                        {/* PERFIS */}

                        <td className="p-4 text-muted">
                          {roles
                            .filter((role) => user.roleIds.includes(role.id))
                            .map((role) => role.name)
                            .join(", ") || "Sem perfil"}
                        </td>

                        {/* STATUS */}

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-semibold ${
                              user.active ? "text-emerald-500" : "text-muted"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                user.active ? "bg-emerald-500" : "bg-muted"
                              }`}
                            />

                            {user.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>

                        {/* AÇÕES */}

                        {canManage && (
                          <td className="p-4">
                            <div className="flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                title="Editar usuário"
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-primary transition-all duration-200 hover:bg-icon-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                                onClick={() => start(user)}
                              >
                                <Pencil size={13} />
                                Editar
                              </button>

                              <button
                                type="button"
                                title={
                                  user.active
                                    ? "Desativar usuário"
                                    : "Ativar usuário"
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-muted transition-all duration-200 hover:bg-surface-secondary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                                onClick={() => void toggle(user)}
                              >
                                {user.active ? (
                                  <UserRoundX size={13} />
                                ) : (
                                  <UserRoundCheck size={13} />
                                )}

                                {user.active ? "Desativar" : "Ativar"}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* =================================
                MOBILE
            ================================== */}

            {!loading && (
              <div className="grid gap-3 p-4 md:hidden">
                {filtered.map((user) => (
                  <article
                    key={user.id}
                    className="rounded-xl border border-app-border p-4 transition-colors duration-200 hover:bg-surface-hover/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-icon-surface text-xs font-bold text-primary">
                        {user.name
                          .trim()
                          .split(/\s+/)
                          .map((word) => word[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {user.name}
                        </p>

                        <p className="break-all text-xs text-muted">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-muted">
                      <p>
                        <span className="font-semibold text-foreground">
                          Perfis:
                        </span>{" "}
                        {roles
                          .filter((role) => user.roleIds.includes(role.id))
                          .map((role) => role.name)
                          .join(", ") || "Sem perfil"}
                      </p>

                      <p>
                        <span className="font-semibold text-foreground">
                          Status:
                        </span>{" "}
                        {user.active ? "Ativo" : "Inativo"}
                      </p>

                      <p>
                        <span className="font-semibold text-foreground">
                          Funcionário:
                        </span>{" "}
                        {user.employeeName || "Não vinculado"}
                      </p>
                    </div>

                    {canManage && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={primary}
                          onClick={() => start(user)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className={secondary}
                          onClick={() => void toggle(user)}
                        >
                          {user.active ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            {/* =================================
                VAZIO
            ================================== */}

            {!loading && filtered.length === 0 && (
              <p className="p-8 text-center text-sm text-muted">
                Nenhum usuário encontrado.
              </p>
            )}
          </section>
        </div>
      </main>

      {/* =========================================
          MODAL
      ========================================== */}

      {open && canManage && (
        <Modal
          title={selected ? "Editar usuário" : "Novo usuário"}
          onClose={() => {
            if (!busy) {
              setOpen(false);
            }
          }}
        >
          <form onSubmit={save}>
            {/* ABAS */}

            <div className="mb-5 flex flex-wrap gap-2">
              {(
                [
                  ["data", "Dados"],

                  ["roles", "Perfis"],

                  ["permissions", "Permissões"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={tab === id ? primary : secondary}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* =================================
                DADOS
            ================================== */}

            {tab === "data" && (
              <div className="grid gap-4 sm:grid-cols-2">
                {/* NOME */}

                <label className="text-sm text-foreground">
                  Nome
                  <input
                    className={`mt-2 ${field}`}
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />
                </label>

                {/* E-MAIL */}

                <label className="text-sm text-foreground">
                  E-mail
                  <input
                    type="email"
                    className={`mt-2 ${field}`}
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                  />
                </label>

                {/* SENHA - SOMENTE CADASTRO */}

                {!selected && (
                  <label className="text-sm text-foreground sm:col-span-2">
                    Senha
                    <input
                      type="password"
                      minLength={8}
                      autoComplete="new-password"
                      className={`mt-2 ${field}`}
                      placeholder="Mínimo de 8 caracteres"
                      value={form.password ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                    />
                    <span className="mt-1 block text-xs text-muted">
                      A senha é obrigatória no cadastro e não é exibida
                      novamente após a criação.
                    </span>
                  </label>
                )}

                {/* FUNCIONÁRIO */}

                <label className="text-sm text-foreground sm:col-span-2">
                  Funcionário vinculado
                  <select
                    className={`mt-2 ${field}`}
                    value={form.employeeId ?? ""}
                    disabled={!canViewEmployees}
                    onChange={(e) => {
                      const employeeId = e.target.value;

                      const employee = employees.find(
                        (item) => item.id === employeeId,
                      );

                      setForm({
                        ...form,

                        employeeId: employeeId || null,

                        employeeName: employee?.name ?? null,
                      });
                    }}
                  >
                    <option value="">Sem vínculo</option>

                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                        {!employee.active ? " · Inativo" : ""}
                      </option>
                    ))}
                  </select>
                  {!canViewEmployees && (
                    <span className="mt-1 block text-xs text-muted">
                      Não há permissão para consultar funcionários.
                    </span>
                  )}
                  {canViewEmployees && employees.length === 0 && (
                    <span className="mt-1 block text-xs text-muted">
                      Nenhum funcionário disponível.
                    </span>
                  )}
                </label>

                {/* ATIVO */}

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm({
                        ...form,

                        active: e.target.checked,
                      })
                    }
                  />
                  Conta ativa
                </label>
              </div>
            )}

            {/* =================================
                PERFIS
            ================================== */}

            {tab === "roles" && (
              <div className="space-y-3">
                {roles.length === 0 && (
                  <p className="text-sm text-muted">
                    Nenhum perfil disponível.
                  </p>
                )}

                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-start gap-3 rounded-xl border border-app-border p-3 text-sm text-foreground transition-colors hover:bg-surface-hover/50"
                  >
                    <input
                      type="checkbox"
                      checked={form.roleIds.includes(role.id)}
                      onChange={(e) => {
                        setForm({
                          ...form,

                          roleIds: e.target.checked
                            ? [...form.roleIds, role.id]
                            : form.roleIds.filter((id) => id !== role.id),
                        });
                      }}
                    />

                    <span>
                      <strong>{role.name}</strong>

                      <span className="block text-xs text-muted">
                        {role.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* =================================
                PERMISSÕES
            ================================== */}

            {tab === "permissions" && (
              <>
                <p className="mb-4 text-sm text-muted">
                  Permissões individuais adicionais. As permissões dos perfis
                  são herdadas.
                </p>

                {permissions.length === 0 ? (
                  <p className="text-sm text-muted">
                    Nenhuma permissão disponível.
                  </p>
                ) : (
                  <CheckPermissions
                    permissions={permissions}
                    selected={form.permissionIds}
                    onChange={(ids) =>
                      setForm({
                        ...form,
                        permissionIds: ids,
                      })
                    }
                  />
                )}
              </>
            )}

            {/* =================================
                ERRO DO FORMULÁRIO
            ================================== */}

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger"
              >
                {error}
              </p>
            )}

            {/* =================================
                AÇÕES
            ================================== */}

            <div className="mt-6 flex justify-end gap-2 border-t border-app-border pt-4">
              <button
                type="button"
                className={secondary}
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>

              <button type="submit" disabled={busy} className={primary}>
                {busy
                  ? "Salvando..."
                  : selected
                    ? "Salvar alterações"
                    : "Criar usuário"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
