
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldCheck,
} from "lucide-react";

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
  Permission,
  Role,
  RoleInput,
} from "../../types/access";

const empty: RoleInput = {
  code: "",
  name: "",
  description: "",
  permissionIds: [],
  system: false,
};

export default function Roles() {
  const { hasPermission } = useAuth();

  const canManage = hasPermission("PERFIS_GERENCIAR");

  const canView =
    canManage || hasPermission("PERFIS_VISUALIZAR");

  const canViewPermissions =
    hasPermission("PERMISSOES_VISUALIZAR") ||
    hasPermission("PERMISSOES_GERENCIAR");

  const [sidebar, setSidebar] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [selected, setSelected] = useState<Role | null>(
    null,
  );

  const [form, setForm] = useState<RoleInput>({
    ...empty,
  });

  const [open, setOpen] = useState(false);

  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  /*
   * Os métodos getRoles() e saveRole() do
   * accessService atual consultam também
   * o catálogo de permissões.
   *
   * Por isso, a visualização completa
   * depende dessa autorização.
   */
  const canLoadRoles = canView && canViewPermissions;

  const load = useCallback(async () => {
    if (!canLoadRoles) {
      setRoles([]);
      setPermissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const [roleList, permissionList] =
        await Promise.all([
          accessService.getRoles(),
          accessService.getPermissions(),
        ]);

      setRoles(roleList);
      setPermissions(permissionList);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os perfis.",
      );
    } finally {
      setLoading(false);
    }
  }, [canLoadRoles]);

  useEffect(() => {
    void load();
  }, [load]);

  function start(role: Role | null) {
    if (!canManage) {
      return;
    }

    setSelected(role);

    setForm(
      role
        ? {
            code: role.code,
            name: role.name,
            description: role.description,
            permissionIds: [...role.permissionIds],
            system: role.system,
          }
        : {
            ...empty,
            permissionIds: [],
          },
    );

    setError("");
    setActionError("");
    setOpen(true);
  }

  async function save(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !canManage ||
      !canViewPermissions ||
      busy
    ) {
      return;
    }

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError("Informe o nome do perfil.");
      return;
    }

    if (name.length > 50) {
      setError(
        "O nome do perfil deve ter no máximo 50 caracteres.",
      );
      return;
    }

    if (description.length > 255) {
      setError(
        "A descrição deve ter no máximo 255 caracteres.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      /*
       * O backend usa apenas "nome".
       * Mantemos code por compatibilidade
       * com os tipos atuais do frontend.
       */
      await accessService.saveRole(
        {
          ...form,
          name,
          code: name,
          description,
        },
        selected?.id,
      );

      await load();
      setOpen(false);
    } catch (err) {
      /*
       * Se a atualização do perfil funcionar,
       * mas alguma associação falhar,
       * recarregamos os dados ao cancelar.
       */
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o perfil.",
      );
    } finally {
      setBusy(false);
    }
  }

  const filtered = roles.filter((role) => {
    const term = search.trim().toLowerCase();

    return (
      role.name.toLowerCase().includes(term) ||
      role.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebar}
        onClose={() => setSidebar(false)}
      />

      <Header
        onMenuClick={() => setSidebar(true)}
      />

      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px]">
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {/* CABEÇALHO */}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-primary">
                Administração
              </p>

              <h1 className="mt-1 text-2xl font-bold text-foreground">
                Perfis
              </h1>

              <p className="mt-1 text-sm text-muted">
                Organize as permissões por perfil
                de acesso.
              </p>
            </div>

            {canManage && canViewPermissions && (
              <button
                type="button"
                className={primary}
                onClick={() => start(null)}
              >
                <span className="inline-flex items-center gap-2">
                  <Plus size={16} />
                  Novo perfil
                </span>
              </button>
            )}
          </div>

          {/* ERROS */}

          {loadError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-app-border bg-surface p-4"
            >
              <p className="text-sm text-danger">
                {loadError}
              </p>

              <button
                type="button"
                className={`mt-3 ${secondary}`}
                onClick={() => void load()}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {actionError && (
            <p
              role="alert"
              className="mb-4 text-sm text-danger"
            >
              {actionError}
            </p>
          )}

          {!canLoadRoles && (
            <div className="rounded-2xl border border-app-border bg-surface p-6">
              <p className="text-sm text-muted">
                A visualização completa dos perfis
                depende do acesso ao catálogo de
                permissões.
              </p>
            </div>
          )}

          {canLoadRoles && (
            <>
              {/* PESQUISA */}

              <div className="mb-5 flex max-w-md items-center gap-3 rounded-xl border border-app-border bg-surface px-3 transition-colors focus-within:border-primary">
                <Search
                  size={18}
                  className="shrink-0 text-muted"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Pesquisar perfil"
                  className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted"
                />
              </div>

              {/* CARREGAMENTO */}

              {loading && (
                <div className="rounded-2xl border border-app-border bg-surface p-10 text-center">
                  <Shield
                    size={28}
                    className="mx-auto mb-3 animate-pulse text-primary"
                  />

                  <p className="text-sm text-muted">
                    Carregando perfis...
                  </p>
                </div>
              )}

              {/* CARDS */}

              {!loading && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {filtered.map((role) => {
                    const associatedPermissions =
                      permissions.filter(
                        (permission) =>
                          role.permissionIds.includes(
                            permission.id,
                          ),
                      );

                    return (
                      <article
                        key={role.id}
                        className="group rounded-2xl border border-app-border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-surface-hover/40 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-icon-surface text-primary transition-transform duration-200 group-hover:scale-105">
                              <ShieldCheck size={21} />
                            </span>

                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-primary">
                                Perfil de acesso
                              </p>

                              <h2 className="mt-1 break-words text-lg font-bold text-foreground">
                                {role.name}
                              </h2>
                            </div>
                          </div>
                        </div>

                        <p className="mt-4 min-h-10 text-sm text-muted">
                          {role.description ||
                            "Nenhuma descrição informada."}
                        </p>

                        <div className="my-4 border-t border-app-border pt-4">
                          <p className="mb-3 text-xs font-semibold text-muted">
                            {associatedPermissions.length}{" "}
                            {associatedPermissions.length === 1
                              ? "permissão associada"
                              : "permissões associadas"}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {associatedPermissions
                              .slice(0, 4)
                              .map((permission) => (
                                <span
                                  key={permission.id}
                                  title={
                                    permission.description
                                  }
                                  className="max-w-full truncate rounded-lg border border-app-border bg-icon-surface px-2.5 py-1 text-xs text-muted"
                                >
                                  {permission.code}
                                </span>
                              ))}

                            {associatedPermissions.length >
                              4 && (
                              <span className="rounded-lg bg-icon-surface px-2.5 py-1 text-xs font-medium text-primary">
                                +
                                {associatedPermissions.length -
                                  4}
                              </span>
                            )}

                            {associatedPermissions.length ===
                              0 && (
                              <span className="text-xs text-muted">
                                Nenhuma permissão associada.
                              </span>
                            )}
                          </div>
                        </div>

                        {canManage && (
                          <button
                            type="button"
                            className={secondary}
                            onClick={() => start(role)}
                          >
                            <span className="inline-flex items-center gap-2">
                              <Pencil size={14} />
                              Editar perfil
                            </span>
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="mt-4 rounded-2xl border border-app-border bg-surface p-10 text-center">
                  <Shield
                    size={28}
                    className="mx-auto mb-3 text-muted"
                  />

                  <p className="text-sm font-medium text-foreground">
                    Nenhum perfil encontrado.
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Experimente outro termo de pesquisa.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL */}

      {open && canManage && canViewPermissions && (
        <Modal
          title={
            selected ? "Editar perfil" : "Novo perfil"
          }
          onClose={() => {
            if (!busy) {
              setOpen(false);
              void load();
            }
          }}
        >
          <form onSubmit={save}>
            <div className="grid gap-4">
              {/* NOME */}

              <label className="text-sm text-foreground">
                Nome do perfil

                <input
                  className={`mt-2 ${field}`}
                  maxLength={50}
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Ex.: RH, Gerente, Administrador"
                  required
                />
              </label>

              {/* DESCRIÇÃO */}

              <label className="text-sm text-foreground">
                Descrição

                <textarea
                  className={`mt-2 min-h-24 py-3 ${field}`}
                  maxLength={255}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Descreva as responsabilidades deste perfil"
                />
              </label>
            </div>

            {/* PERMISSÕES */}

            <div className="mt-6 border-t border-app-border pt-5">
              <h3 className="font-semibold text-foreground">
                Permissões associadas
              </h3>

              <p className="mb-4 mt-1 text-xs text-muted">
                Os usuários associados a este
                perfil herdarão suas permissões.
              </p>

              {permissions.length > 0 ? (
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
              ) : (
                <p className="text-sm text-muted">
                  Nenhuma permissão disponível.
                </p>
              )}
            </div>

            {/* ERRO */}

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-app-border bg-surface p-3 text-sm text-danger"
              >
                {error}
              </p>
            )}

            {/* BOTÕES */}

            <div className="mt-6 flex justify-end gap-2 border-t border-app-border pt-4">
              <button
                type="button"
                className={secondary}
                disabled={busy}
                onClick={() => {
                  setOpen(false);
                  void load();
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={primary}
                disabled={busy}
              >
                {busy
                  ? "Salvando..."
                  : selected
                    ? "Salvar alterações"
                    : "Criar perfil"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}