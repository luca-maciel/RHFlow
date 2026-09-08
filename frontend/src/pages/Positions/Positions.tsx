import { useState } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

type Position = {
  id: string;
  nome: string;
  departamento: string;
  empresa: string;
  nivel: "JÚNIOR" | "PLENO" | "SÊNIOR" | "GESTÃO";
  funcionarios: number;
  status: "ATIVO" | "INATIVO";
};

const positionsMock: Position[] = [
  {
    id: "1",
    nome: "Desenvolvedor Backend",
    departamento: "Tecnologia da Informação",
    empresa: "RHFlow Tecnologia",
    nivel: "PLENO",
    funcionarios: 6,
    status: "ATIVO",
  },
  {
    id: "2",
    nome: "Desenvolvedor Frontend",
    departamento: "Tecnologia da Informação",
    empresa: "RHFlow Tecnologia",
    nivel: "JÚNIOR",
    funcionarios: 4,
    status: "ATIVO",
  },
  {
    id: "3",
    nome: "Analista de RH",
    departamento: "Recursos Humanos",
    empresa: "RHFlow Tecnologia",
    nivel: "PLENO",
    funcionarios: 3,
    status: "ATIVO",
  },
  {
    id: "4",
    nome: "Gerente Financeiro",
    departamento: "Financeiro",
    empresa: "Inova Sistemas",
    nivel: "GESTÃO",
    funcionarios: 1,
    status: "ATIVO",
  },
  {
    id: "5",
    nome: "Analista de Marketing",
    departamento: "Marketing",
    empresa: "Tech Solutions",
    nivel: "SÊNIOR",
    funcionarios: 2,
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

function LevelBadge({
  level,
}: {
  level: Position["nivel"];
}) {
  const styles = {
    JÚNIOR:
      "bg-sky-50 text-sky-600",
    PLENO:
      "bg-blue-50 text-blue-600",
    SÊNIOR:
      "bg-violet-50 text-violet-600",
    GESTÃO:
      "bg-amber-50 text-amber-600",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${styles[level]}
      `}
    >
      {level}
    </span>
  );
}

export default function Positions() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const filteredPositions =
    positionsMock.filter((position) => {
      const term =
        search.toLowerCase();

      return (
        position.nome
          .toLowerCase()
          .includes(term) ||
        position.departamento
          .toLowerCase()
          .includes(term) ||
        position.empresa
          .toLowerCase()
          .includes(term)
      );
    });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <Header
        onMenuClick={() =>
          setSidebarOpen(true)
        }
      />

      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px] flex flex-col items-center">
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {/* ==================================================
              CABEÇALHO
          ================================================== */}

          <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-blue-600">
                Organização
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
                Cargos
              </h1>

              <p className="mt-1 text-xs text-slate-500 md:text-sm">
                Gerencie os cargos disponíveis nos departamentos.
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

              Novo cargo
            </button>
          </section>
            <br />
          {/* ==================================================
              CARD
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* Toolbar */}

            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="relative w-full sm:max-w-[360px]">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Pesquisar cargo..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
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
                {
                  filteredPositions.length
                }{" "}
                cargos encontrados
              </p>
            </div>

            {/* ==================================================
                DESKTOP
            ================================================== */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Cargo
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Departamento
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Empresa
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Nível
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
                  {filteredPositions.map(
                    (position) => (
                      <tr
                        key={position.id}
                        className="
                          border-b
                          border-slate-100
                          transition
                          last:border-b-0
                          hover:bg-slate-50/70
                        "
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                text-xs
                                font-bold
                                text-blue-600
                              "
                            >
                              {position.nome.charAt(
                                0
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                {
                                  position.nome
                                }
                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                ID #
                                {
                                  position.id
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {
                            position.departamento
                          }
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {
                            position.empresa
                          }
                        </td>

                        <td className="px-5 py-4">
                          <LevelBadge
                            level={
                              position.nivel
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-xs font-medium text-slate-500">
                          {
                            position.funcionarios
                          }
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              position.status
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              className="
                                rounded-lg
                                px-2.5
                                py-1.5
                                text-[10px]
                                font-semibold
                                text-blue-600
                                transition
                                hover:bg-blue-50
                              "
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-slate-100
                                hover:text-slate-700
                              "
                            >
                              ⋮
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* ==================================================
                MOBILE
            ================================================== */}

            <div className="space-y-3 p-4 md:hidden flex flex-col gap-5">
              {filteredPositions.map(
                (position) => (
                  <article
                    key={position.id}
                    className="
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                      shadow-sm
                    "
                  >
                    {/* Header */}

                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-50
                            text-sm
                            font-bold
                            text-blue-600
                          "
                        >
                          {position.nome.charAt(
                            0
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {
                              position.nome
                            }
                          </h3>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            ID #{position.id}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={
                          position.status
                        }
                      />
                    </div>

                    {/* Informações */}

                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <div className="col-span-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Departamento
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {
                            position.departamento
                          }
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Empresa
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {
                            position.empresa
                          }
                        </p>
                      </div>

                      <div>
                        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Nível
                        </p>

                        <LevelBadge
                          level={
                            position.nivel
                          }
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Funcionários
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-700">
                          {
                            position.funcionarios
                          }
                        </p>
                      </div>
                    </div>

                    {/* Ações */}

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

              {/* EMPTY STATE */}

              {filteredPositions.length ===
                0 && (
                <div className="py-12 text-center">
                  <div
                    className="
                      mx-auto
                      mb-3
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-slate-100
                      text-slate-400
                    "
                  >
                    ⌕
                  </div>

                  <p className="text-xs font-semibold text-slate-900">
                    Nenhum cargo
                    encontrado
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Tente utilizar outro
                    termo de pesquisa.
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