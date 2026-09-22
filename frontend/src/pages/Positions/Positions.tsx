import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import PositionModal from "../../components/positions/PositionModal";

import positionService from "../../services/positionService";
import departmentService from "../../services/departmentService";

import type {
  Position,
  PositionRequest,
} from "../../types/position";
import type { Department } from "../../types/department";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`
        inline-flex shrink-0 items-center gap-1.5
        rounded-full px-2.5 py-1 text-[10px] font-semibold
        ${
          active
            ? "bg-surface-secondary text-emerald-600"
            : "bg-surface-secondary text-muted"
        }
      `}
    >
      <span
        className={`
          h-1.5 w-1.5 rounded-full
          ${active ? "bg-emerald-500" : "bg-slate-400"}
        `}
      />

      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

function LevelBadge({
  level,
}: {
  level: string | null;
}) {
  if (!level) {
    return (
      <span className="text-xs text-muted-light">
        —
      </span>
    );
  }

  const normalized = level.trim().toUpperCase();

  const style =
    normalized === "JÚNIOR"
      ? "text-sky-600"
      : normalized === "PLENO"
        ? "text-blue-600"
        : normalized === "SÊNIOR"
          ? "text-violet-600"
          : normalized === "GESTÃO"
            ? "text-amber-600"
            : "text-muted";

  return (
    <span
      className={`
        inline-flex rounded-full bg-surface-secondary
        px-2.5 py-1 text-[10px] font-semibold
        ${style}
      `}
    >
      {level}
    </span>
  );
}

function formatSalary(value: number | null) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function Positions() {
  const [positions, setPositions] =
    useState<Position[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedPosition, setSelectedPosition] =
    useState<Position | null>(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredPositions = positions.filter(
    (position) =>
      position.nome
        .toLowerCase()
        .includes(normalizedSearch) ||
      position.departamentoNome
        .toLowerCase()
        .includes(normalizedSearch) ||
      (position.nivel ?? "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      (position.descricao ?? "")
        .toLowerCase()
        .includes(normalizedSearch)
  );

  async function loadPositions() {
    try {
      setLoading(true);
      setError("");

      const [positionsData, departmentsData] =
        await Promise.all([
          positionService.findAll(),
          departmentService.findAll(),
        ]);

      setPositions(positionsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error(error);

      setError(
        "Não foi possível carregar os cargos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPositions();
  }, []);

  async function handleSavePosition(
    data: PositionRequest
  ) {
    try {
      setSaving(true);
      setError("");

      if (selectedPosition) {
        await positionService.update(
          selectedPosition.id,
          data
        );
      } else {
        await positionService.create(data);
      }

      setModalOpen(false);
      setSelectedPosition(null);

      await loadPositions();
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        const message =
          typeof responseData?.message === "string"
            ? responseData.message
            : typeof responseData?.error === "string"
              ? responseData.error
              : null;

        setError(
          message ??
            "Não foi possível salvar o cargo."
        );

        return;
      }

      setError(
        "Não foi possível salvar o cargo."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Header
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main className="flex min-h-screen flex-col items-center pt-[72px] md:ml-[250px] md:pt-[82px]">
        <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
          <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-blue-600">
                Organização
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-[28px]">
                Cargos
              </h1>

              <p className="mt-1 text-xs text-muted md:text-sm">
                Gerencie os cargos disponíveis nos departamentos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedPosition(null);
                setModalOpen(true);
              }}
              className="
                flex h-11 w-full items-center justify-center gap-2
                rounded-xl bg-blue-600 px-5
                text-xs font-semibold text-white
                shadow-[0_6px_15px_rgba(37,99,235,0.18)]
                transition hover:bg-blue-700
                sm:w-auto
              "
            >
              <span className="text-lg leading-none">
                +
              </span>

              Novo cargo
            </button>
          </section>

          <section className="overflow-hidden rounded-2xl border border-app-border bg-surface">
            <div className="flex flex-col gap-4 border-b border-app-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="relative w-full sm:max-w-[360px]">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-light">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Pesquisar cargo..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  className="
                    h-10 w-full rounded-xl
                    border border-app-border bg-background
                    pl-9 pr-4 text-xs text-foreground
                    outline-none placeholder:text-muted-light
                    focus:border-blue-600 focus:bg-surface
                    focus:ring-[3px] focus:ring-blue-600/10
                  "
                />
              </div>

              <p className="text-[11px] text-muted-light">
                {filteredPositions.length} cargos encontrados
              </p>
            </div>

            {loading && (
              <div className="px-5 py-12 text-center">
                <div
                  className="
                    mx-auto mb-3 h-6 w-6 animate-spin
                    rounded-full border-2 border-app-border
                    border-t-primary
                  "
                />

                <p className="text-xs text-muted">
                  Carregando cargos...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="p-5">
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-danger">
                  {error}
                </div>
              </div>
            )}

            {!loading &&
              !error &&
              filteredPositions.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-icon-surface text-primary">
                    ◇
                  </div>

                  <p className="text-sm font-semibold text-foreground">
                    Nenhum cargo encontrado
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Cadastre um cargo ou altere sua pesquisa.
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              filteredPositions.length > 0 && (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[950px]">
                      <thead>
                        <tr className="border-b border-app-border bg-background/70">
                          <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-light">
                            Cargo
                          </th>

                          <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-light">
                            Departamento
                          </th>

                          <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-light">
                            Nível
                          </th>

                          <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-light">
                            Salário base
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
                        {filteredPositions.map(
                          (position) => (
                            <tr
                              key={position.id}
                              className="border-b border-app-border transition last:border-b-0 hover:bg-background/70"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-icon-surface text-xs font-bold text-blue-600">
                                    {position.nome
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[240px] truncate text-xs font-semibold text-foreground">
                                      {position.nome}
                                    </p>

                                    <p
                                      className="mt-0.5 max-w-[260px] truncate text-[10px] text-muted-light"
                                      title={
                                        position.descricao ??
                                        undefined
                                      }
                                    >
                                      {position.descricao ||
                                        "Sem descrição"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 text-xs text-muted">
                                {
                                  position.departamentoNome
                                }
                              </td>

                              <td className="px-5 py-4">
                                <LevelBadge
                                  level={position.nivel}
                                />
                              </td>

                              <td className="px-5 py-4 text-xs font-medium text-foreground">
                                {formatSalary(
                                  position.salarioBase
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <StatusBadge
                                  active={position.ativo}
                                />
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPosition(
                                      position
                                    );
                                    setModalOpen(true);
                                  }}
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

                  <div className="flex flex-col gap-5 p-4 md:hidden">
                    {filteredPositions.map(
                      (position) => (
                        <article
                          key={position.id}
                          className="rounded-2xl border border-app-border bg-surface p-4 shadow-sm"
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-icon-surface text-sm font-bold text-blue-600">
                                {position.nome
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-foreground">
                                  {position.nome}
                                </h3>

                                <p className="mt-0.5 truncate text-[10px] text-muted-light">
                                  {
                                    position.departamentoNome
                                  }
                                </p>
                              </div>
                            </div>

                            <StatusBadge
                              active={position.ativo}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                            <div className="col-span-2">
                              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                                Departamento
                              </p>

                              <p className="mt-1 text-xs text-muted">
                                {
                                  position.departamentoNome
                                }
                              </p>
                            </div>

                            <div>
                              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-light">
                                Nível
                              </p>

                              <LevelBadge
                                level={position.nivel}
                              />
                            </div>

                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                                Salário base
                              </p>

                              <p className="mt-1 text-xs font-semibold text-foreground">
                                {formatSalary(
                                  position.salarioBase
                                )}
                              </p>
                            </div>

                            <div className="col-span-2">
                              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                                Descrição
                              </p>

                              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-muted">
                                {position.descricao ||
                                  "Sem descrição"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2 border-t border-app-border pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPosition(
                                  position
                                );
                                setModalOpen(true);
                              }}
                              className="
                                flex-1 rounded-xl bg-blue-600
                                px-3 py-2.5 text-xs
                                font-semibold text-white transition
                                hover:bg-blue-700
                              "
                            >
                              Editar
                            </button>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                </>
              )}
          </section>
        </div>
      </main>

      <PositionModal
        isOpen={modalOpen}
        position={selectedPosition}
        departments={departments}
        loading={saving}
        onClose={() => {
          if (saving) {
            return;
          }

          setModalOpen(false);
          setSelectedPosition(null);
        }}
        onSubmit={handleSavePosition}
      />
    </div>
  );
}
