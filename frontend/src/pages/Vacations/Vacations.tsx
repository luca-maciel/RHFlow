import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import axios from "axios";

import {

  CalendarDays,

  Check,

  CircleCheck,

  Clock3,

  MoreHorizontal,

  Palmtree,

  Play,

  Search,

  X,

} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";

import Header from "../../components/layout/Header";

import vacationService from "../../services/vacationService";

import { useAuth } from "../../contexts/AuthContext";

import VacationModal from "../../components/vacations/VacationModal";

import employeeService from "../../services/employeeService";

import type { Employee } from "../../types/employee";

import type {
  MyVacationRequest,
  Vacation,
  VacationRequest,
  VacationStatus,
} from "../../types/vacation";

import {

  VACATION_STATUS_LABELS,

  isVacationHistory,

} from "../../types/vacation";

type VacationFilter =

  | "TODAS"

  | "SOLICITADA"

  | "APROVADA"

  | "EM_GOZO"

  | "HISTORICO";

function formatDate(value: string | null | undefined) {

  if (!value) return "—";

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;

}

function initials(name: string) {

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {

    return parts[0].slice(0, 2).toUpperCase();

  }

  return (parts[0][0] + parts.at(-1)![0]).toUpperCase();

}

function getErrorMessage(error: unknown, fallback: string) {

  if (!axios.isAxiosError(error)) {

    return fallback;

  }

  const data = error.response?.data;

  if (data && typeof data === "object") {

    if ("message" in data && typeof data.message === "string") {

      return data.message;

    }

    if ("error" in data && typeof data.error === "string") {

      return data.error;

    }

  }

  return fallback;

}

export default function Vacations() {

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [modalOpen, setModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const { hasPermission } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [vacations, setVacations] = useState<Vacation[]>([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<VacationFilter>("TODAS");

  const [openMenu, setOpenMenu] = useState<string | null>(null);




  const canManage = hasPermission("FERIAS_GERENCIAR");

  const canRequest =
    hasPermission("FERIAS_SOLICITAR") || canManage;

  const canApprove =
    hasPermission("FERIAS_APROVAR") || canManage;

  const canViewAll =
    hasPermission("FERIAS_VISUALIZAR") ||
    hasPermission("FERIAS_APROVAR") ||
    canManage;

  const selfOnly = !canViewAll && canRequest;
  const requestForSelf = canRequest && !canManage;




  async function loadVacations() {
    try {
      setLoading(true);
      setError("");

      if (canViewAll) {
        const vacationData = await vacationService.findAll();
        setVacations(vacationData);

        if (canManage) {
          const employeeData = await employeeService.findAll();
          setEmployees(employeeData);
        } else {
          setEmployees([]);
        }

        return;
      }

      if (canRequest) {
        const vacationData = await vacationService.findMine();
        setVacations(vacationData);
        setEmployees([]);
        return;
      }

      setVacations([]);
      setEmployees([]);
      setError("Você não possui permissão para visualizar férias.");
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Não foi possível carregar as férias."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVacations();
  }, [canViewAll, canManage, canRequest]);




  const requestedCount = useMemo(

    () =>

      vacations.filter((vacation) => vacation.status === "SOLICITADA").length,

    [vacations],

  );

  const approvedCount = useMemo(

    () => vacations.filter((vacation) => vacation.status === "APROVADA").length,

    [vacations],

  );

  const ongoingCount = useMemo(

    () => vacations.filter((vacation) => vacation.status === "EM_GOZO").length,

    [vacations],

  );

  const completedCount = useMemo(

    () =>

      vacations.filter((vacation) => vacation.status === "CONCLUIDA").length,

    [vacations],

  );




  const filtered = useMemo(() => {

    const query = search.trim().toLowerCase();

    return vacations.filter((vacation) => {

      const matchesSearch =

        query === "" || vacation.funcionarioNome.toLowerCase().includes(query);

      let matchesFilter = true;

      if (filter === "HISTORICO") {

        matchesFilter = isVacationHistory(vacation.status);

      } else if (filter !== "TODAS") {

        matchesFilter = vacation.status === filter;

      }

      return matchesSearch && matchesFilter;

    });

  }, [vacations, search, filter]);




  async function executeAction(

vacation: Vacation,

action: "approve" | "reject" | "start" | "complete" | "cancel",

  ) {

    try {

      setActionLoading(vacation.id);

      setOpenMenu(null);

      setError("");

      let updated: Vacation;

      switch (action) {

        case "approve":

          updated = await vacationService.approve(vacation.id);

          break;

        case "reject":

          updated = await vacationService.reject(vacation.id);

          break;

        case "start":

          updated = await vacationService.start(vacation.id);

          break;

        case "complete":

          updated = await vacationService.complete(vacation.id);

          break;

        case "cancel":

          updated = await vacationService.cancel(vacation.id);

          break;

      }

      setVacations((current) =>

current.map((item) => (item.id === updated.id ? updated : item)),

      );

    } catch (error) {

      console.error(error);

      setError(getErrorMessage(error, "Não foi possível realizar a ação."));

    } finally {

      setActionLoading(null);

    }

  }

  async function requestVacation(data: VacationRequest) {
    try {
      setSaving(true);
      setError("");

      const created = await vacationService.request(data);
      setVacations((current) => [created, ...current]);
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Não foi possível solicitar as férias."));
    } finally {
      setSaving(false);
    }
  }

  async function requestMyVacation(data: MyVacationRequest) {
    try {
      setSaving(true);
      setError("");

      const created = await vacationService.requestMine(data);
      setVacations((current) => [created, ...current]);
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error, "Não foi possível solicitar suas férias."));
    } finally {
      setSaving(false);
    }
  }

  return (

    <div className="min-h-screen bg-background">

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Header onMenuClick={() => setSidebarOpen(true)} />

      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px]">

        <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">


          <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="mb-1 text-xs font-medium text-primary">

                Gestão de pessoas

              </p>

              <h1 className="text-2xl font-bold text-foreground md:text-[28px]">

                Férias

              </h1>

              <p className="mt-1 text-xs text-muted">

                {selfOnly
                ? "Acompanhe e solicite seus períodos de férias."
                : "Gerencie solicitações e períodos de férias dos colaboradores."}

              </p>

            </div>

            {canRequest && (

              <button

type="button"

onClick={() => setModalOpen(true)}

className="

                  h-11

                  rounded-xl

                  bg-primary

                  px-5

                  text-xs

                  font-semibold

                  text-white

                  transition-opacity

                  hover:opacity-90

                "

              >

                Nova solicitação

              </button>

            )}

          </section>


          {error && (

            <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-app-border bg-surface p-4">

              <p className="text-xs text-danger">{error}</p>

              <button

type="button"

onClick={() => setError("")}

className="shrink-0 text-muted transition-colors hover:text-foreground"

              >

                <X size={16} />

              </button>

            </div>

          )}


          <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

            <VacationStatCard

title="Solicitadas"

value={loading ? "..." : requestedCount}

description="Aguardando análise"

icon={<Clock3 size={18} />}

active={filter === "SOLICITADA"}

onClick={() =>

                setFilter(filter === "SOLICITADA" ? "TODAS" : "SOLICITADA")

              }

            />

            <VacationStatCard

title="Aprovadas"

value={loading ? "..." : approvedCount}

description="Aguardando início"

icon={<CircleCheck size={18} />}

active={filter === "APROVADA"}

onClick={() =>

                setFilter(filter === "APROVADA" ? "TODAS" : "APROVADA")

              }

            />

            <VacationStatCard

title="Em gozo"

value={loading ? "..." : ongoingCount}

description="Férias em andamento"

icon={<Palmtree size={18} />}

active={filter === "EM_GOZO"}

onClick={() =>

                setFilter(filter === "EM_GOZO" ? "TODAS" : "EM_GOZO")

              }

            />

            <VacationStatCard

title="Concluídas"

value={loading ? "..." : completedCount}

description="Períodos finalizados"

icon={<Check size={18} />}

active={filter === "HISTORICO"}

onClick={() => setFilter("HISTORICO")}

            />

          </section>


          <section className="overflow-hidden rounded-2xl border border-app-border bg-surface">


            <div className="overflow-x-auto border-b border-app-border">

              <div className="flex min-w-max px-4 sm:px-5">

                <FilterTab

active={filter === "TODAS"}

label="Todas"

onClick={() => setFilter("TODAS")}

                />

                <FilterTab

active={filter === "SOLICITADA"}

label="Solicitadas"

count={requestedCount}

onClick={() => setFilter("SOLICITADA")}

                />

                <FilterTab

active={filter === "APROVADA"}

label="Aprovadas"

count={approvedCount}

onClick={() => setFilter("APROVADA")}

                />

                <FilterTab

active={filter === "EM_GOZO"}

label="Em gozo"

count={ongoingCount}

onClick={() => setFilter("EM_GOZO")}

                />

                <FilterTab

active={filter === "HISTORICO"}

label="Histórico"

onClick={() => setFilter("HISTORICO")}

                />

              </div>

            </div>


            <div className="border-b border-app-border p-4 sm:p-5">

              <div className="relative w-full max-w-[420px]">

                <Search

size={15}

className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light"

                />

                <input

value={search}

onChange={(event) => setSearch(event.target.value)}

placeholder="Pesquisar funcionário..."

className="

                    h-10

                    w-full

                    rounded-xl

                    border

                    border-app-border

                    bg-background

                    pl-10

                    pr-4

                    text-xs

                    text-foreground

                    outline-none

                    transition-colors

                    placeholder:text-muted-light

                    focus:border-primary

                  "

                />

              </div>

              <p className="mt-4 text-[11px] text-muted-light">

                {filtered.length}{" "}

                {filtered.length === 1

                  ? "registro encontrado"

                  : "registros encontrados"}

              </p>

            </div>


            {loading ? (

              <div className="py-16 text-center text-xs text-muted">

                Carregando férias...

              </div>

            ) : filtered.length === 0 ? (

              <div className="flex flex-col items-center justify-center py-16 text-center">

                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-icon-surface text-muted">

                  <CalendarDays size={19} />

                </div>

                <p className="text-xs font-semibold text-foreground">

                  Nenhum registro encontrado

                </p>

                <p className="mt-1 text-[10px] text-muted">

                  Não existem férias correspondentes aos filtros selecionados.

                </p>

              </div>

            ) : (

              <>


                <div className="hidden overflow-x-auto md:block">

                  <table className="w-full min-w-[950px]">

                    <thead>

                      <tr className="border-b border-app-border bg-background/70">

                        <TableHeader>Funcionário</TableHeader>

                        <TableHeader>Período aquisitivo</TableHeader>

                        <TableHeader>Período de férias</TableHeader>

                        <TableHeader>Dias</TableHeader>

                        <TableHeader>Status</TableHeader>

                        <TableHeader right>Ações</TableHeader>

                      </tr>

                    </thead>

                    <tbody>

                      {filtered.map((vacation) => (

                        <tr

key={vacation.id}

className="border-b border-app-border transition-colors last:border-0 hover:bg-background/70"

                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-icon-surface text-[11px] font-bold text-primary">

                                {initials(vacation.funcionarioNome)}

                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-xs font-semibold text-foreground">

                                  {vacation.funcionarioNome}

                                </p>

                                <p className="mt-0.5 text-[10px] text-muted-light">

                                  {vacation.quantidadeDias}{" "}

                                  {vacation.quantidadeDias === 1

                                    ? "dia"

                                    : "dias"}

                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs text-muted">

                              {formatDate(vacation.inicioPeriodoAquisitivo)}

                            </p>

                            <p className="mt-0.5 text-[10px] text-muted-light">

                              até {formatDate(vacation.fimPeriodoAquisitivo)}

                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <p className="text-xs font-medium text-foreground">

                              {formatDate(vacation.inicioGozo)}

                            </p>

                            <p className="mt-0.5 text-[10px] text-muted-light">

                              até {formatDate(vacation.fimGozo)}

                            </p>

                          </td>

                          <td className="px-5 py-4 text-xs text-muted">

                            {vacation.quantidadeDias}

                          </td>

                          <td className="px-5 py-4">

                            <VacationBadge status={vacation.status} />

                          </td>

                          <td className="relative px-5 py-4 text-right">

                            <VacationActions

vacation={vacation}

open={openMenu === vacation.id}

loading={actionLoading === vacation.id}

canApprove={canApprove}

canManage={canManage}

onToggle={() =>

                                setOpenMenu(

                                  openMenu === vacation.id ? null : vacation.id,

                                )

                              }

onAction={(action) =>

                                void executeAction(vacation, action)

                              }

                            />

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>


                <div className="flex flex-col gap-4 p-4 md:hidden">

                  {filtered.map((vacation) => (

                    <article

key={vacation.id}

className="rounded-2xl border border-app-border p-4"

                    >

                      <div className="mb-4 flex items-start justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-icon-surface text-[11px] font-bold text-primary">

                            {initials(vacation.funcionarioNome)}

                          </div>

                          <div className="min-w-0">

                            <h3 className="truncate text-sm font-semibold text-foreground">

                              {vacation.funcionarioNome}

                            </h3>

                            <p className="text-[10px] text-muted-light">

                              {vacation.quantidadeDias}{" "}

                              {vacation.quantidadeDias === 1 ? "dia" : "dias"}

                            </p>

                          </div>

                        </div>

                        <VacationBadge status={vacation.status} />

                      </div>

                      <div className="grid grid-cols-2 gap-4 rounded-xl bg-background/70 p-3">

                        <div>

                          <p className="text-[9px] font-semibold uppercase text-muted-light">

                            Período aquisitivo

                          </p>

                          <p className="mt-1 text-[11px] text-muted">

                            {formatDate(vacation.inicioPeriodoAquisitivo)}

                          </p>

                          <p className="text-[10px] text-muted-light">

                            até {formatDate(vacation.fimPeriodoAquisitivo)}

                          </p>

                        </div>

                        <div>

                          <p className="text-[9px] font-semibold uppercase text-muted-light">

                            Férias

                          </p>

                          <p className="mt-1 text-[11px] font-medium text-foreground">

                            {formatDate(vacation.inicioGozo)}

                          </p>

                          <p className="text-[10px] text-muted-light">

                            até {formatDate(vacation.fimGozo)}

                          </p>

                        </div>

                      </div>

                      {vacation.observacao && (

                        <div className="mt-3">

                          <p className="text-[9px] font-semibold uppercase text-muted-light">

                            Observação

                          </p>

                          <p className="mt-1 text-xs leading-5 text-muted">

                            {vacation.observacao}

                          </p>

                        </div>

                      )}

                      <div className="mt-4 border-t border-app-border pt-4">

                        <MobileActions

vacation={vacation}

loading={actionLoading === vacation.id}

canApprove={canApprove}

canManage={canManage}

onAction={(action) =>

                            void executeAction(vacation, action)

                          }

                        />

                      </div>

                    </article>

                  ))}

                </div>

              </>

            )}

          </section>

        </div>

      </main>

      <VacationModal

isOpen={modalOpen}

employees={employees}

loading={saving}

onClose={() => {

          if (!saving) {

            setModalOpen(false);

          }

        }}

onSubmit={requestVacation}

      />

    </div>

  );

}


function SelfVacationModal({
  isOpen,
  loading,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: MyVacationRequest) => Promise<void> | void;
}) {
  const [inicioPeriodoAquisitivo, setInicioPeriodoAquisitivo] = useState("");
  const [fimPeriodoAquisitivo, setFimPeriodoAquisitivo] = useState("");
  const [inicioGozo, setInicioGozo] = useState("");
  const [fimGozo, setFimGozo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setInicioPeriodoAquisitivo("");
    setFimPeriodoAquisitivo("");
    setInicioGozo("");
    setFimGozo("");
    setObservacao("");
    setFormError("");
  }, [isOpen]);

  if (!isOpen) return null;

  function inclusiveDays(start: string, end: string) {
    if (!start || !end) return 0;

    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);

    return Math.floor(
      (endDate.getTime() - startDate.getTime()) / 86_400_000,
    ) + 1;
  }

  const quantityDays = inclusiveDays(inicioGozo, fimGozo);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (
      !inicioPeriodoAquisitivo ||
      !fimPeriodoAquisitivo ||
      !inicioGozo ||
      !fimGozo
    ) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (fimPeriodoAquisitivo < inicioPeriodoAquisitivo) {
      setFormError(
        "O fim do período aquisitivo não pode ser anterior ao início.",
      );
      return;
    }

    if (fimGozo < inicioGozo) {
      setFormError("O fim das férias não pode ser anterior ao início.");
      return;
    }

    if (quantityDays < 1 || quantityDays > 30) {
      setFormError("O período de férias deve possuir entre 1 e 30 dias.");
      return;
    }

    await onSubmit({
      inicioPeriodoAquisitivo,
      fimPeriodoAquisitivo,
      inicioGozo,
      fimGozo,
      observacao: observacao.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-app-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-app-border p-5 sm:p-6">
          <div>
            <p className="mb-1 text-xs font-medium text-primary">Minhas férias</p>
            <h2 className="text-lg font-bold text-foreground">Nova solicitação</h2>
            <p className="mt-1 text-xs text-muted">
              A solicitação será vinculada automaticamente ao seu funcionário.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-6">
            {formError && (
              <div className="mb-5 rounded-xl border border-app-border bg-background p-3 text-xs text-danger">
                {formError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <SelfDateField
                label="Início do período aquisitivo"
                value={inicioPeriodoAquisitivo}
                onChange={setInicioPeriodoAquisitivo}
                disabled={loading}
              />
              <SelfDateField
                label="Fim do período aquisitivo"
                value={fimPeriodoAquisitivo}
                onChange={setFimPeriodoAquisitivo}
                disabled={loading}
              />
              <SelfDateField
                label="Início das férias"
                value={inicioGozo}
                onChange={setInicioGozo}
                disabled={loading}
              />
              <SelfDateField
                label="Fim das férias"
                value={fimGozo}
                onChange={setFimGozo}
                disabled={loading}
              />
            </div>

            {inicioGozo && fimGozo && quantityDays > 0 && (
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-icon-surface p-3">
                <CalendarDays size={16} className="text-primary" />
                <p className="text-xs text-muted">
                  Período solicitado:{" "}
                  <span className="font-semibold text-foreground">
                    {quantityDays} {quantityDays === 1 ? "dia" : "dias"}
                  </span>
                </p>
              </div>
            )}

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-foreground">
                Observação
              </label>

              <textarea
                value={observacao}
                onChange={(event) => setObservacao(event.target.value)}
                maxLength={500}
                disabled={loading}
                rows={4}
                placeholder="Adicione uma observação, se necessário..."
                className="w-full resize-none rounded-xl border border-app-border bg-background px-4 py-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-light focus:border-primary disabled:opacity-60"
              />

              <p className="mt-1 text-right text-[10px] text-muted-light">
                {observacao.length}/500
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-app-border p-5 sm:flex-row sm:justify-end sm:p-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-app-border px-5 text-xs font-semibold text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl bg-primary px-5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Solicitando..." : "Solicitar férias"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SelfDateField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-foreground">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-app-border bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-primary disabled:opacity-60"
      />
    </div>
  );
}

function todayISO(): string {

  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

}

function canStartVacation(vacation: Vacation): boolean {

  return vacation.status === "APROVADA" && todayISO() >= vacation.inicioGozo;

}

function canCompleteVacation(vacation: Vacation): boolean {

  return vacation.status === "EM_GOZO" && todayISO() >= vacation.fimGozo;

}




function VacationStatCard({

title,

value,

description,

icon,

active,

onClick,

}: {

  title: string;

  value: number | string;

  description: string;

  icon: ReactNode;

  active: boolean;

  onClick: () => void;

}) {

  return (

    <button

type="button"

onClick={onClick}

className={`

        rounded-2xl

        border

        bg-surface

        p-4

        text-left

        transition-all

        duration-200

        sm:p-5

        ${

active

            ? "border-primary"

            : "border-app-border hover:-translate-y-0.5 hover:bg-surface-hover"

        }

      `}

    >

      <div className="mb-4 flex items-start justify-between gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-icon-surface text-primary">

          {icon}

        </div>

        {active && (

          <span className="rounded-full bg-icon-surface px-2 py-1 text-[9px] font-semibold text-primary">

            Filtrado

          </span>

        )}

      </div>

      <p className="text-[10px] font-medium text-muted">{title}</p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">

        {value}

      </p>

      <p className="mt-1 text-[10px] text-muted-light">{description}</p>

    </button>

  );

}




function FilterTab({

active,

label,

count,

onClick,

}: {

  active: boolean;

  label: string;

  count?: number;

  onClick: () => void;

}) {

  return (

    <button

type="button"

onClick={onClick}

className={`

        relative

        flex

        items-center

        gap-2

        px-4

        py-4

        text-xs

        font-semibold

        transition-colors

        ${active ? "text-primary" : "text-muted hover:text-foreground"}

      `}

    >

      {label}

      {count !== undefined && count > 0 && (

        <span className="rounded-full bg-icon-surface px-1.5 py-0.5 text-[9px]">

          {count}

        </span>

      )}

      <span

className={`

          absolute

          bottom-0

          left-0

          h-0.5

          w-full

          bg-primary

          transition-transform

          ${active ? "scale-x-100" : "scale-x-0"}

        `}

      />

    </button>

  );

}




function VacationBadge({ status }: { status: VacationStatus }) {

  const styles: Record<VacationStatus, string> = {

    SOLICITADA: "text-amber-600",

    APROVADA: "text-blue-600",

    REJEITADA: "text-danger",

    EM_GOZO: "text-emerald-600",

    CONCLUIDA: "text-muted",

    CANCELADA: "text-muted-light",

  };

  return (

    <span

className={`

        inline-flex

        whitespace-nowrap

        rounded-full

        bg-surface-secondary

        px-2.5

        py-1

        text-[10px]

        font-semibold

        ${styles[status]}

      `}

    >

      {VACATION_STATUS_LABELS[status]}

    </span>

  );

}




function TableHeader({

children,

right = false,

}: {

  children: ReactNode;

  right?: boolean;

}) {

  return (

    <th

className={`

        px-5

        py-3

        text-[10px]

        uppercase

        text-muted-light

        ${right ? "text-right" : "text-left"}

      `}

    >

      {children}

    </th>

  );

}

type VacationAction = "approve" | "reject" | "start" | "complete" | "cancel";




function VacationActions({

vacation,

open,

loading,

canApprove,

canManage,

onToggle,

onAction,

}: {

  vacation: Vacation;

  open: boolean;

  loading: boolean;

  canApprove: boolean;

  canManage: boolean;

  onToggle: () => void;

  onAction: (action: VacationAction) => void;

}) {

  const hasActions =

    (vacation.status === "SOLICITADA" && canApprove) ||

    (vacation.status === "APROVADA" && canManage) ||

    (vacation.status === "EM_GOZO" && canManage);

  if (!hasActions) {

    return <span className="text-[10px] text-muted-light">—</span>;

  }

  return (

    <div className="relative inline-block text-left">

      <button

type="button"

disabled={loading}

onClick={onToggle}

className="

          inline-flex

          h-8

          w-8

          items-center

          justify-center

          rounded-lg

          text-muted

          transition-colors

          hover:bg-surface-hover

          hover:text-foreground

          disabled:opacity-50

        "

      >

        {loading ? (

          <span className="text-[9px]">...</span>

        ) : (

          <MoreHorizontal size={17} />

        )}

      </button>

      {open && !loading && (

        <div

className="

            absolute

            right-0

            top-9

            z-30

            min-w-[165px]

            overflow-hidden

            rounded-xl

            border

            border-app-border

            bg-surface

            p-1.5

            text-left

            shadow-xl

          "

        >

          {vacation.status === "SOLICITADA" && canApprove && (

            <>

              <ActionButton

icon={<Check size={14} />}

label="Aprovar"

onClick={() => onAction("approve")}

              />

              <ActionButton

icon={<X size={14} />}

label="Rejeitar"

danger

onClick={() => onAction("reject")}

              />

            </>

          )}

          {vacation.status === "APROVADA" && canManage && (

            <>

              <ActionButton

icon={<Play size={13} />}

label={

                  canStartVacation(vacation)

                    ? "Iniciar férias"

                    : `Inicia em ${formatDate(vacation.inicioGozo)}`

                }

disabled={!canStartVacation(vacation)}

title={

                  canStartVacation(vacation)

                    ? "Iniciar férias"

                    : `As férias só podem ser iniciadas a partir de ${formatDate(

vacation.inicioGozo,

                      )}.`

                }

onClick={() => onAction("start")}

              />

              <ActionButton

icon={<X size={14} />}

label="Cancelar"

danger

onClick={() => onAction("cancel")}

              />

            </>

          )}

          {vacation.status === "EM_GOZO" && canManage && (

            <ActionButton

icon={

    <CircleCheck size={14} />

  }

label={

    canCompleteVacation(vacation)

      ? "Concluir férias"

      : `Termina em ${formatDate(

vacation.fimGozo,

        )}`

  }

disabled={

    !canCompleteVacation(vacation)

  }

title={

    canCompleteVacation(vacation)

      ? "Concluir férias"

      : `As férias só podem ser concluídas a partir de ${formatDate(

vacation.fimGozo,

        )}.`

  }

onClick={() =>

    onAction("complete")

  }

/>

          )}

        </div>

      )}

    </div>

  );

}

function ActionButton({

icon,

label,

danger = false,

disabled = false,

title,

onClick,

}: {

  icon: ReactNode;

  label: string;

  danger?: boolean;

  disabled?: boolean;

  title?: string;

  onClick: () => void;

}) {

  return (

    <button

type="button"

disabled={disabled}

title={title}

onClick={onClick}

className={`

        flex

        w-full

        items-center

        gap-2

        rounded-lg

        px-3

        py-2.5

        text-[10px]

        font-semibold

        transition-colors

        disabled:cursor-not-allowed

        disabled:opacity-40

        ${

danger

            ? "text-danger hover:bg-surface-hover disabled:hover:bg-transparent"

            : "text-foreground hover:bg-surface-hover disabled:hover:bg-transparent"

        }

      `}

    >

      {icon}

      <span className="flex-1">{label}</span>

    </button>

  );

}


function MobileActions({

vacation,

loading,

canApprove,

canManage,

onAction,

}: {

  vacation: Vacation;

  loading: boolean;

  canApprove: boolean;

  canManage: boolean;

  onAction: (action: VacationAction) => void;

}) {

  if (loading) {

    return (

      <div className="py-2 text-center text-[10px] text-muted">

        Processando...

      </div>

    );

  }

  if (vacation.status === "SOLICITADA" && canApprove) {

    return (

      <div className="grid grid-cols-2 gap-2">

        <button

type="button"

onClick={() => onAction("reject")}

className="rounded-xl border border-app-border py-2.5 text-xs font-semibold text-danger"

        >

          Rejeitar

        </button>

        <button

type="button"

onClick={() => onAction("approve")}

className="rounded-xl bg-primary py-2.5 text-xs font-semibold text-white"

        >

          Aprovar

        </button>

      </div>

    );

  }

  if (

vacation.status ===

    "APROVADA" &&

canManage

) {

  const canStart =

    canStartVacation(vacation);

  return (

    <div>

      {!canStart && (

        <div className="mb-3 flex items-center gap-2 rounded-xl bg-icon-surface px-3 py-2.5">

          <Clock3

size={14}

className="shrink-0 text-primary"

          />

          <p className="text-[10px] text-muted">

            Início disponível em{" "}

            <span className="font-semibold text-foreground">

              {formatDate(

vacation.inicioGozo,

              )}

            </span>

          </p>

        </div>

      )}

      <div className="grid grid-cols-2 gap-2">

        <button

type="button"

onClick={() =>

            onAction("cancel")

          }

className="

            rounded-xl

            border border-app-border

            py-2.5

            text-xs font-semibold

            text-danger

            transition-colors

            hover:bg-surface-hover

          "

        >

          Cancelar

        </button>

        <button

type="button"

disabled={!canStart}

onClick={() =>

            onAction("start")

          }

className="

            rounded-xl

            bg-primary

            py-2.5

            text-xs font-semibold

            text-white

            transition-opacity

            hover:opacity-90

            disabled:cursor-not-allowed

            disabled:opacity-40

          "

        >

          Iniciar férias

        </button>

      </div>

    </div>

  );

}

  if (

vacation.status ===

    "EM_GOZO" &&

canManage

) {

  const canComplete =

    canCompleteVacation(vacation);

  return (

    <div>

      {!canComplete && (

        <div className="mb-3 flex items-center gap-2 rounded-xl bg-icon-surface px-3 py-2.5">

          <Clock3

size={14}

className="shrink-0 text-primary"

          />

          <p className="text-[10px] text-muted">

            Conclusão disponível em{" "}

            <span className="font-semibold text-foreground">

              {formatDate(

vacation.fimGozo,

              )}

            </span>

          </p>

        </div>

      )}

      <button

type="button"

disabled={!canComplete}

onClick={() =>

          onAction("complete")

        }

className="

          w-full

          rounded-xl

          bg-primary

          py-2.5

          text-xs font-semibold

          text-white

          transition-opacity

          hover:opacity-90

          disabled:cursor-not-allowed

          disabled:opacity-40

        "

      >

        {canComplete

          ? "Concluir férias"

          : `Término em ${formatDate(

vacation.fimGozo,

            )}`}

      </button>

    </div>

  );

}

  return (

    <p className="text-center text-[10px] text-muted-light">

      Nenhuma ação disponível

    </p>

  );

}