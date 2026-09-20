import { useState } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

type Department = {
  id: string;
  nome: string;
  empresa: string;
  gestor: string;
  funcionarios: number;
  status: "ATIVO" | "INATIVO";
};

const departmentsMock: Department[] = [
  {
    id: "1",
    nome: "Tecnologia da Informação",
    empresa: "RHFlow Tecnologia",
    gestor: "Carlos Henrique",
    funcionarios: 18,
    status: "ATIVO",
  },
  {
    id: "2",
    nome: "Recursos Humanos",
    empresa: "RHFlow Tecnologia",
    gestor: "Mariana Souza",
    funcionarios: 9,
    status: "ATIVO",
  },
  {
    id: "3",
    nome: "Financeiro",
    empresa: "Inova Sistemas",
    gestor: "Ricardo Lima",
    funcionarios: 7,
    status: "ATIVO",
  },
  {
    id: "4",
    nome: "Marketing",
    empresa: "Tech Solutions",
    gestor: "Ana Beatriz",
    funcionarios: 5,
    status: "INATIVO",
  },
];

function StatusBadge({
  status,
}: {
  status: "ATIVO" | "INATIVO";
}) {
  const active = status === "ATIVO";

  return (
    <span
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${
          active
            ? "bg-surface-secondary text-emerald-600"
            : "bg-surface-secondary text-muted"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${
            active
              ? "bg-emerald-500"
              : "bg-slate-400"
          }
        `}
      />

      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

export default function Departments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredDepartments = departmentsMock.filter(
    (department) =>
      department.nome
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      department.empresa
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      department.gestor
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Header
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px] flex flex-col items-center">
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {/* Header da página */}

          <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-blue-600">
                Organização
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-[28px]">
                Departamentos
              </h1>

              <p className="mt-1 text-xs text-muted md:text-sm">
                Organize os departamentos vinculados às empresas.
              </p>
            </div>

            <button
              type="button"
              className="
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                text-xs
                font-semibold
                text-white
                shadow-[0_6px_15px_rgba(37,99,235,0.18)]
                transition
                hover:bg-blue-700
                sm:w-auto
                
              "
            >
              <span className="text-lg leading-none">
                +
              </span>

              Novo departamento
            </button>
          </section>
    <br />
          {/* Card principal */}

          <section className="overflow-hidden rounded-2xl border border-app-border bg-surface">
            {/* Toolbar */}

            <div className="flex flex-col gap-4 border-b border-app-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="relative w-full sm:max-w-[340px]">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-light">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Pesquisar departamento..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-app-border
                    bg-background
                    pl-9
                    pr-4
                    text-xs
                    text-foreground
                    outline-none
                    placeholder:text-muted-light
                    focus:border-blue-600
                    focus:bg-surface
                    focus:ring-[3px]
                    focus:ring-blue-600/10
                  "
                />
              </div>

              <p className="text-[11px] text-muted-light">
                {filteredDepartments.length} departamentos
              </p>
            </div>

            {/* DESKTOP */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-app-border bg-background/70">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-light">
                      Departamento
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-light">
                      Empresa
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-light">
                      Gestor
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-light">
                      Funcionários
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-light">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-light">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDepartments.map(
                    (department) => (
                      <tr
                        key={department.id}
                        className="border-b border-app-border transition last:border-b-0 hover:bg-background/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-icon-surface text-xs font-bold text-blue-600">
                              {department.nome.charAt(0)}
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                {department.nome}
                              </p>

                              <p className="mt-0.5 text-[10px] text-muted-light">
                                ID #{department.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-xs text-muted">
                          {department.empresa}
                        </td>

                        <td className="px-5 py-4 text-xs text-muted">
                          {department.gestor}
                        </td>

                        <td className="px-5 py-4 text-xs text-muted">
                          {department.funcionarios}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={department.status}
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-blue-600 transition hover:bg-icon-surface"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}

            <div className="space-y-3 p-4 md:hidden flex flex-col gap-5">
              {filteredDepartments.map(
                (department) => (
                  <article
                    key={department.id}
                    className="
                      rounded-2xl
                      border
                      border-app-border
                      bg-surface
                      p-4
                      shadow-sm
                    "
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-icon-surface text-sm font-bold text-blue-600">
                          {department.nome.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-foreground">
                            {department.nome}
                          </h3>

                          <p className="mt-0.5 text-[10px] text-muted-light">
                            ID #{department.id}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={department.status}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="col-span-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                          Empresa
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {department.empresa}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                          Gestor
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {department.gestor}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                          Funcionários
                        </p>

                        <p className="mt-1 text-xs font-semibold text-foreground">
                          {department.funcionarios}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-app-border pt-4">
                      <button
                        type="button"
                        className="
                          flex-1
                          rounded-xl
                          border
                          border-app-border
                          px-3
                          py-2.5
                          text-xs
                          font-semibold
                          text-muted
                          transition
                          hover:bg-background
                        "
                      >
                        Visualizar
                      </button>

                      <button
                        type="button"
                        className="
                          flex-1
                          rounded-xl
                          bg-blue-600
                          px-3
                          py-2.5
                          text-xs
                          font-semibold
                          text-white
                          transition
                          hover:bg-blue-700
                        "
                      >
                        Editar
                      </button>
                    </div>
                  </article>
                )
              )}

              {filteredDepartments.length === 0 && (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary">
                    ⌕
                  </div>

                  <p className="text-xs font-semibold text-foreground">
                    Nenhum departamento encontrado
                  </p>

                  <p className="mt-1 text-[10px] text-muted-light">
                    Tente utilizar outro termo de pesquisa.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}