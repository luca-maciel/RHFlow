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
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-100 text-slate-500"
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
    <div className="min-h-screen bg-slate-50">
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

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
                Departamentos
              </h1>

              <p className="mt-1 text-xs text-slate-500 md:text-sm">
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

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* Toolbar */}

            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="relative w-full sm:max-w-[340px]">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
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
                    border-slate-200
                    bg-slate-50
                    pl-9
                    pr-4
                    text-xs
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    focus:border-blue-600
                    focus:bg-white
                    focus:ring-[3px]
                    focus:ring-blue-600/10
                  "
                />
              </div>

              <p className="text-[11px] text-slate-400">
                {filteredDepartments.length} departamentos
              </p>
            </div>

            {/* DESKTOP */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Departamento
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Empresa
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Gestor
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Funcionários
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDepartments.map(
                    (department) => (
                      <tr
                        key={department.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                              {department.nome.charAt(0)}
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                {department.nome}
                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                ID #{department.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {department.empresa}
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {department.gestor}
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
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
                            className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-blue-600 transition hover:bg-blue-50"
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
                      border-slate-200
                      bg-white
                      p-4
                      shadow-sm
                    "
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                          {department.nome.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {department.nome}
                          </h3>

                          <p className="mt-0.5 text-[10px] text-slate-400">
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
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Empresa
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {department.empresa}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Gestor
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {department.gestor}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Funcionários
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-700">
                          {department.funcionarios}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        className="
                          flex-1
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-xs
                          font-semibold
                          text-slate-600
                          transition
                          hover:bg-slate-50
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
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    ⌕
                  </div>

                  <p className="text-xs font-semibold text-slate-900">
                    Nenhum departamento encontrado
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
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