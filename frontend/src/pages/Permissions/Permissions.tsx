
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  KeyRound,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

import {
  field,
  Modal,
  primary,
  secondary,
} from "../../components/admin/AdminUI";

import { accessService } from "../../services/accessService";

import type {
  Permission,
  PermissionModule,
} from "../../types/access";

type PermissionForm = {
  code: string;
  description: string;
};

const empty: PermissionForm = {
  code: "",
  description: "",
};

const moduleNames: Record<string, PermissionModule> = {
  USUARIOS: "Usuários",
  PERFIS: "Perfis",
  PERMISSOES: "Permissões",
  FUNCIONARIOS: "Funcionários",
  EMPRESAS: "Empresas",
  DEPARTAMENTOS: "Departamentos",
  CARGOS: "Cargos",
  FERIAS: "Férias",
  DOCUMENTOS: "Documentos",
  AVALIACOES: "Avaliações",
};

export default function Permissions() {
  const { hasPermission } = useAuth();

  const canManage = hasPermission(
    "PERMISSOES_GERENCIAR",
  );

  const canView =
    canManage ||
    hasPermission("PERMISSOES_VISUALIZAR");

  const [sidebar, setSidebar] = useState(false);

  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [search, setSearch] = useState("");
  const [module, setModule] = useState("TODOS");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selected, setSelected] =
    useState<Permission | null>(null);

  const [form, setForm] =
    useState<PermissionForm>({ ...empty });

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!canView) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const data =
        await accessService.getPermissions();

      setPermissions(data);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as permissões.",
      );
    } finally {
      setLoading(false);
    }
  }, [canView]);

  useEffect(() => {
    void load();
  }, [load]);

  function start(permission: Permission | null) {
    if (!canManage) return;

    setSelected(permission);

    setForm(
      permission
        ? {
            code: permission.code,
            description: permission.description,
          }
        : { ...empty },
    );

    setError("");
    setOpen(true);
  }

  async function save(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canManage || busy) return;

    const code = form.code
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

    const description = form.description.trim();

    if (!/^[A-Z][A-Z0-9_]*$/.test(code)) {
      setError(
        "Use letras maiúsculas, números e sublinhados no código.",
      );
      return;
    }

    if (code.length > 100) {
      setError(
        "O código deve possuir no máximo 100 caracteres.",
      );
      return;
    }

    if (description.length > 255) {
      setError(
        "A descrição deve possuir no máximo 255 caracteres.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await accessService.savePermission(
        { code, description },
        selected?.id,
      );

      await load();
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a permissão.",
      );
    } finally {
      setBusy(false);
    }
  }

  const modules = [
    ...new Set(
      permissions.map((permission) => permission.module),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const filtered = permissions.filter((permission) => {
    const matchesModule =
      module === "TODOS" ||
      permission.module === module;

    const matchesSearch = [
      permission.name,
      permission.code,
      permission.description,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    return matchesModule && matchesSearch;
  });

  const grouped = modules
    .map((name) => ({
      name,
      items: filtered.filter(
        (permission) => permission.module === name,
      ),
    }))
    .filter((group) => group.items.length > 0);

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
                Permissões
              </h1>

              <p className="mt-1 text-sm text-muted">
                Gerencie o catálogo de permissões
                utilizado por usuários e perfis.
              </p>
            </div>

            {canManage && (
              <button
                type="button"
                className={primary}
                onClick={() => start(null)}
              >
                <span className="inline-flex items-center gap-2">
                  <Plus size={16} />
                  Nova permissão
                </span>
              </button>
            )}
          </div>

          {/* ERROS */}

          {loadError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-app-border bg-surface p-4"
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

          {/* FILTROS E CATÁLOGO */}

          <section className="mt-6 rounded-2xl border border-app-border bg-surface">
            <div className="grid gap-3 border-b border-app-border p-4 sm:grid-cols-[1fr_220px]">
              <div className="flex items-center gap-2 rounded-xl border border-app-border bg-background px-3 focus-within:border-primary">
                <Search
                  size={17}
                  className="shrink-0 text-muted"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Pesquisar permissões..."
                  className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted"
                />
              </div>

              <select
                className={field}
                value={module}
                onChange={(event) =>
                  setModule(event.target.value)
                }
              >
                <option value="TODOS">
                  Todos os módulos
                </option>

                {modules.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* CARREGAMENTO */}

            {loading && (
              <div className="p-12 text-center">
                <KeyRound
                  size={28}
                  className="mx-auto mb-3 animate-pulse text-primary"
                />

                <p className="text-sm text-muted">
                  Carregando permissões...
                </p>
              </div>
            )}

            {/* GRUPOS */}

            {!loading && (
              <div className="grid gap-4 p-4 lg:grid-cols-2">
                {grouped.map((group) => (
                  <section
                    key={group.name}
                    className="rounded-xl border border-app-border p-4 transition-all duration-200 hover:border-primary/25"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-icon-surface text-primary">
                          <ShieldCheck size={18} />
                        </span>

                        <h2 className="font-semibold text-foreground">
                          {group.name}
                        </h2>
                      </div>

                      <span className="rounded-full bg-icon-surface px-2.5 py-1 text-xs font-medium text-muted">
                        {group.items.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {group.items.map((permission) => (
                        <article
                          key={permission.id}
                          className="group/item rounded-xl border border-transparent bg-surface-secondary p-3 transition-all duration-200 hover:border-primary/25 hover:bg-surface-hover"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {permission.name}
                              </p>

                              <p className="mt-1 break-all font-mono text-xs text-primary">
                                {permission.code}
                              </p>
                            </div>

                            {canManage && (
                              <button
                                type="button"
                                title="Editar permissão"
                                aria-label={`Editar ${permission.code}`}
                                onClick={() =>
                                  start(permission)
                                }
                                className="rounded-lg p-2 text-muted transition-colors hover:bg-icon-surface hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                          </div>

                          <p className="mt-2 text-xs text-muted">
                            {permission.description ||
                              "Sem descrição."}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}

                {grouped.length === 0 && (
                  <div className="col-span-full py-10 text-center">
                    <KeyRound
                      size={28}
                      className="mx-auto mb-3 text-muted"
                    />

                    <p className="text-sm text-muted">
                      Nenhuma permissão encontrada.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL */}

      {open && canManage && (
        <Modal
          title={
            selected
              ? "Editar permissão"
              : "Nova permissão"
          }
          onClose={() => {
            if (!busy) setOpen(false);
          }}
        >
          <form onSubmit={save}>
            <div className="space-y-4">
              <label className="block text-sm text-foreground">
                Código

                <input
                  className={`mt-2 ${field}`}
                  value={form.code}
                  maxLength={100}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      code: event.target.value
                        .toUpperCase()
                        .replace(/\s+/g, "_"),
                    })
                  }
                  placeholder="EX.: DOCUMENTOS_VISUALIZAR"
                  required
                />

                <span className="mt-1 block text-xs text-muted">
                  Identificador utilizado pelo
                  Spring Security para autorizar
                  operações.
                </span>
              </label>

              <label className="block text-sm text-foreground">
                Descrição

                <textarea
                  className={`mt-2 min-h-24 py-3 ${field}`}
                  value={form.description}
                  maxLength={255}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Descreva o acesso concedido."
                />
              </label>

              <div className="rounded-xl border border-app-border bg-icon-surface p-3">
                <p className="text-xs text-muted">
                  {selected
                    ? "Alterações no código podem afetar verificações de autorização existentes."
                    : "Cadastrar uma permissão não a associa automaticamente a nenhum perfil ou usuário."}
                </p>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 text-sm text-danger"
              >
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2 border-t border-app-border pt-4">
              <button
                type="button"
                className={secondary}
                disabled={busy}
                onClick={() => setOpen(false)}
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
                    : "Criar permissão"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}