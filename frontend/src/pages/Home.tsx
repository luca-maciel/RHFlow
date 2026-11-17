import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Cake,
  CircleDot,
  Users,
} from "lucide-react";
import { api } from "../services/api";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import StatCard from "../components/dashboard/StatCard";
import employeeService from "../services/employeeService";
import { useAuth } from "../contexts/AuthContext";
import type { Employee } from "../types/employee";

type BirthdayEvent = {
  id: string;
  name: string;
  department: string;
  date: Date;
  daysUntil: number;
};

type DetailTab =
  | "departments"
  | "status"
  | "admissions"
  | "birthdays";

const MONTHS = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDepartmentLabel(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "Sem departamento";
  if (trimmed.length <= 3) return trimmed.toUpperCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getNextBirthday(employee: Employee): BirthdayEvent | null {
  if (!employee.dataNascimento) {
    return null;
  }

  const [, month, day] = employee.dataNascimento.split("-").map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let birthday = new Date(today.getFullYear(), month - 1, day);
  birthday.setHours(0, 0, 0, 0);

  if (birthday < today) {
    birthday = new Date(today.getFullYear() + 1, month - 1, day);
  }

  const daysUntil = Math.round(
    (birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    id: employee.id,
    name: employee.nome,
    department: formatDepartmentLabel(
      employee.departamentoNome ?? "Sem departamento",
    ),
    date: birthday,
    daysUntil,
  };
}

export default function Home() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  /*
   * PERMISSÕES
   */
  const canViewEmployees =
    hasPermission("FUNCIONARIOS_VISUALIZAR") ||
    hasPermission("FUNCIONARIOS_GERENCIAR");

  const canViewCompanies =
    hasPermission("EMPRESAS_VISUALIZAR") ||
    hasPermission("EMPRESAS_GERENCIAR");

  const canViewDepartments =
    hasPermission("DEPARTAMENTOS_VISUALIZAR") ||
    hasPermission("DEPARTAMENTOS_GERENCIAR");

  const canViewPositions =
    hasPermission("CARGOS_VISUALIZAR") ||
    hasPermission("CARGOS_GERENCIAR");

  const canViewVacations =
    hasPermission("FERIAS_APROVAR") ||
    hasPermission("FERIAS_GERENCIAR") ||
    hasPermission("FERIAS_VISUALIZAR");

  const canViewDocuments =
    hasPermission("DOCUMENTOS_GERENCIAR") ||
    hasPermission("DOCUMENTOS_VISUALIZAR");

  const hasDashboardAccess =
    canViewEmployees ||
    canViewCompanies ||
    canViewDepartments ||
    canViewPositions;

  /*
   * ESTADOS
   */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalAtivos, setTotalAtivos] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [totalPositions, setTotalPositions] = useState(0);
  const [pendingVacations, setPendingVacations] = useState(0);
  const [pendingDocuments, setPendingDocuments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailTab, setDetailTab] = useState<DetailTab>("departments");

  // Filtros interativos do Detalhamento
  const [statusDeptFilter, setStatusDeptFilter] = useState("TODOS");
  const [selectedAdmissionMonth, setSelectedAdmissionMonth] = useState<
    string | null
  >(null);
  const [birthdayMonthFilter, setBirthdayMonthFilter] = useState("PROXIMOS");

  /*
   * ESTRUTURA ORGANIZACIONAL E PENDÊNCIAS
   */
  useEffect(() => {
    if (!hasDashboardAccess) return;

    async function loadOrganizationAndPending() {
      const requests: Promise<void>[] = [];

      if (canViewCompanies) {
        requests.push(
          api.get<unknown[]>("/empresas").then(({ data }) => {
            setTotalCompanies(data.length);
          }),
        );
      }

      if (canViewDepartments) {
        requests.push(
          api.get<unknown[]>("/departamentos").then(({ data }) => {
            setTotalDepartments(data.length);
          }),
        );
      }

      if (canViewPositions) {
        requests.push(
          api.get<unknown[]>("/cargos").then(({ data }) => {
            setTotalPositions(data.length);
          }),
        );
      }

      if (canViewVacations) {
        requests.push(
          api
            .get<Array<{ status?: string }>>("/ferias")
            .then(({ data }) => {
              setPendingVacations(
                data.filter((item) => item.status === "SOLICITADA").length,
              );
            }),
        );
      }

      if (canViewDocuments) {
        requests.push(
          api
            .get<Array<{ status?: string }>>("/solicitacoes-documento")
            .then(({ data }) => {
              setPendingDocuments(
                data.filter((item) => item.status === "PENDENTE").length,
              );
            }),
        );
      }

      await Promise.allSettled(requests);
    }

    void loadOrganizationAndPending();
  }, [
    hasDashboardAccess,
    canViewCompanies,
    canViewDepartments,
    canViewPositions,
    canViewVacations,
    canViewDocuments,
  ]);

  /*
   * DASHBOARD
   */
  useEffect(() => {
    if (!hasDashboardAccess) return;

    async function loadDashboard() {
      if (!canViewEmployees) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [activeCount, employeeList] = await Promise.all([
          employeeService.countByStatus("ATIVO"),
          employeeService.findAll(),
        ]);

        setTotalAtivos(activeCount);
        setEmployees(employeeList);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError("Não foi possível carregar os indicadores do dashboard.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, [hasDashboardAccess, canViewEmployees]);

  /*
   * INDICADORES
   */
  const ferias = useMemo(
    () =>
      employees.filter((employee) => employee.status === "FERIAS").length,
    [employees],
  );

  const afastados = useMemo(
    () =>
      employees.filter((employee) => employee.status === "AFASTADO").length,
    [employees],
  );

  const novasAdmissoes = useMemo(() => {
    const today = new Date();
    return employees.filter((employee) => {
      const admission = parseLocalDate(employee.dataAdmissao);
      return (
        admission.getMonth() === today.getMonth() &&
        admission.getFullYear() === today.getFullYear()
      );
    }).length;
  }, [employees]);

  /*
   * OPÇÕES DE DEPARTAMENTO PARA FILTROS
   */
  const departmentOptions = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((employee) => {
      if (employee.departamentoId) {
        map.set(
          employee.departamentoId,
          formatDepartmentLabel(
            employee.departamentoNome ?? "Sem departamento",
          ),
        );
      }
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [employees]);

  /*
   * DISTRIBUIÇÃO POR DEPARTAMENTO
   */
  const departmentDistribution = useMemo(() => {
    const activeEmployees = employees.filter(
      (employee) => employee.status === "ATIVO",
    );

    const groups = new Map<
      string,
      { id: string; name: string; total: number }
    >();

    activeEmployees.forEach((employee) => {
      const id = employee.departamentoId ?? "SEM_DEPARTAMENTO";
      const name = formatDepartmentLabel(
        employee.departamentoNome ?? "Sem departamento",
      );
      const current = groups.get(id);

      if (current) {
        current.total += 1;
        return;
      }

      groups.set(id, { id, name, total: 1 });
    });

    return Array.from(groups.values())
      .sort((a, b) => b.total - a.total)
      .map((department) => ({
        ...department,
        percentage:
          activeEmployees.length === 0
            ? 0
            : Math.round((department.total / activeEmployees.length) * 100),
      }));
  }, [employees]);

  /*
   * DISTRIBUIÇÃO POR STATUS (COM FILTRO DE DEPARTAMENTO)
   */
  const statusDistribution = useMemo(() => {
    const scopedEmployees =
      statusDeptFilter === "TODOS"
        ? employees
        : employees.filter(
            (employee) => employee.departamentoId === statusDeptFilter,
          );

    const statuses = [
      { key: "ATIVO", label: "Ativos", description: "Em atividade" },
      { key: "FERIAS", label: "Férias", description: "Em período de férias" },
      {
        key: "AFASTADO",
        label: "Afastados",
        description: "Temporariamente afastados",
      },
      {
        key: "DESLIGADO",
        label: "Desligados",
        description: "Vínculo encerrado",
      },
    ];

    return statuses.map((status) => {
      const total = scopedEmployees.filter(
        (employee) => employee.status === status.key,
      ).length;

      return {
        ...status,
        total,
        percentage:
          scopedEmployees.length === 0
            ? 0
            : Math.round((total / scopedEmployees.length) * 100),
      };
    });
  }, [employees, statusDeptFilter]);

  /*
   * ADMISSÕES DOS ÚLTIMOS 12 MESES
   */
  const monthlyAdmissions = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (11 - index),
        1,
      );
      const key = getMonthKey(date);

      const list = employees.filter((employee) => {
        const admission = parseLocalDate(employee.dataAdmissao);
        return getMonthKey(admission) === key;
      });

      return {
        key,
        total: list.length,
        employees: list,
        fullLabel: date.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        }),
        label: date
          .toLocaleDateString("pt-BR", { month: "short" })
          .replace(".", ""),
      };
    });
  }, [employees]);

  const maxAdmissions = Math.max(
    ...monthlyAdmissions.map((item) => item.total),
    1,
  );

  const selectedAdmissionData = useMemo(
    () =>
      monthlyAdmissions.find((item) => item.key === selectedAdmissionMonth) ??
      null,
    [monthlyAdmissions, selectedAdmissionMonth],
  );

  /*
   * ANIVERSÁRIOS (PRÓXIMOS OU FILTRADOS POR MÊS)
   */
  const filteredBirthdays = useMemo(() => {
    const activeList = employees.filter(
      (employee) => employee.status !== "DESLIGADO",
    );

    if (birthdayMonthFilter === "PROXIMOS") {
      return activeList
        .map(getNextBirthday)
        .filter((event): event is BirthdayEvent => event !== null)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 6);
    }

    const targetMonth = Number(birthdayMonthFilter);

    return activeList
      .filter((employee) => {
        if (!employee.dataNascimento) return false;
        const [, month] = employee.dataNascimento.split("-").map(Number);
        return month === targetMonth;
      })
      .map(getNextBirthday)
      .filter((event): event is BirthdayEvent => event !== null)
      .sort((a, b) => a.date.getDate() - b.date.getDate());
  }, [employees, birthdayMonthFilter]);

  if (!hasDashboardAccess) {
    return <Navigate to="/ferias" replace />;
  }

  const rawFirstName = user?.nome?.trim().split(/\s+/)[0] ?? "Usuário";
  const firstName =
    rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1);

  function birthdayBadge(days: number) {
    if (days === 0) return "Hoje";
    if (days === 1) return "Amanhã";
    return `${days} dias`;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Header onMenuClick={() => setSidebarOpen(true)} />

      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px]">
        <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {/* BOAS-VINDAS */}
          <section className="mb-6 md:mb-8">
            <p className="mb-1 text-xs font-medium text-blue-600">
              Visão geral
            </p>
            <h1 className="text-[24px] font-bold tracking-tight text-foreground md:text-[28px]">
              {getGreeting()}, {firstName}!
            </h1>
            <p className="mt-1 text-xs text-muted md:text-sm">
              Acompanhe os indicadores da equipe, pendências e estrutura organizacional.
            </p>
          </section>

          {/* ERRO */}
          {error && (
            <div className="mb-5 rounded-xl border border-app-border bg-surface p-4">
              <p className="text-sm text-muted">{error}</p>
            </div>
          )}

          {/* CARDS PRINCIPAIS */}
          {canViewEmployees && (
            <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              <StatCard
                title="Funcionários ativos"
                value={loading ? "..." : totalAtivos.toString()}
                description="Colaboradores ativos atualmente"
                icon="♙"
                onClick={() => navigate("/funcionarios?status=ATIVO")}
              />

              <StatCard
                title="Férias em andamento"
                value={loading ? "..." : ferias.toString()}
                description="Colaboradores atualmente de férias"
                icon="☼"
                onClick={() => navigate("/funcionarios?status=FERIAS")}
              />

              <StatCard
                title="Novas admissões"
                value={loading ? "..." : novasAdmissoes.toString()}
                description="Admitidos neste mês"
                icon="＋"
                onClick={() => navigate("/funcionarios?period=THIS_MONTH")}
              />

              <StatCard
                title="Afastados"
                value={loading ? "..." : afastados.toString()}
                description="Colaboradores atualmente afastados"
                icon="!"
                onClick={() => navigate("/funcionarios?status=AFASTADO")}
              />
            </section>
          )}

          {/* PENDÊNCIAS OPERACIONAIS */}
          {(canViewVacations || canViewDocuments) && (
            <section className="mb-6">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Pendências operacionais
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Solicitações aguardando análise ou atendimento pelo RH.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {canViewVacations && (
                  <StatCard
                    title="Férias pendentes"
                    value={pendingVacations.toString()}
                    description={
                      pendingVacations === 1
                        ? "Solicitação aguardando aprovação"
                        : "Solicitações aguardando aprovação"
                    }
                    icon="✈"
                    onClick={() => navigate("/ferias")}
                  />
                )}

                {canViewDocuments && (
                  <StatCard
                    title="Documentos pendentes"
                    value={pendingDocuments.toString()}
                    description={
                      pendingDocuments === 1
                        ? "Solicitação aguardando emissão"
                        : "Solicitações aguardando emissão"
                    }
                    icon="▤"
                    onClick={() => navigate("/documentos")}
                  />
                )}
              </div>
            </section>
          )}

          {/* ESTRUTURA ORGANIZACIONAL */}
          {(canViewCompanies || canViewDepartments || canViewPositions) && (
            <section className="mb-6">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Estrutura organizacional
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Visão geral da estrutura cadastrada no RHFlow.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {canViewCompanies && (
                  <StatCard
                    title="Empresas"
                    value={totalCompanies.toString()}
                    description="Empresas cadastradas"
                    icon="▦"
                    onClick={() => navigate("/empresas")}
                  />
                )}

                {canViewDepartments && (
                  <StatCard
                    title="Departamentos"
                    value={totalDepartments.toString()}
                    description="Departamentos cadastrados"
                    icon="⌘"
                    onClick={() => navigate("/departamentos")}
                  />
                )}

                {canViewPositions && (
                  <StatCard
                    title="Cargos"
                    value={totalPositions.toString()}
                    description="Cargos cadastrados"
                    icon="♢"
                    onClick={() => navigate("/cargos")}
                  />
                )}
              </div>
            </section>
          )}

          {/* DETALHAMENTO */}
          {canViewEmployees && (
            <section className="overflow-hidden rounded-2xl border border-app-border bg-surface">
              <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                <h2 className="text-base font-bold text-foreground md:text-lg">
                  Detalhamento
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Explore as informações da sua equipe por diferentes
                  perspectivas.
                </p>
              </div>

              <div className="mt-5 overflow-x-auto border-b border-app-border px-5 sm:px-6">
                <div className="flex min-w-max gap-1">
                  <DetailTabButton
                    active={detailTab === "departments"}
                    icon={<Building2 size={16} />}
                    label="Departamentos"
                    onClick={() => setDetailTab("departments")}
                  />
                  <DetailTabButton
                    active={detailTab === "status"}
                    icon={<CircleDot size={16} />}
                    label="Status"
                    onClick={() => setDetailTab("status")}
                  />
                  <DetailTabButton
                    active={detailTab === "admissions"}
                    icon={<BarChart3 size={16} />}
                    label="Admissões"
                    onClick={() => setDetailTab("admissions")}
                  />
                  <DetailTabButton
                    active={detailTab === "birthdays"}
                    icon={<Cake size={16} />}
                    label="Aniversários"
                    onClick={() => setDetailTab("birthdays")}
                  />
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <p className="text-xs text-muted">
                      Carregando informações...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* DEPARTAMENTOS */}
                    {detailTab === "departments" && (
                      <div>
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-foreground">
                            Distribuição por departamento
                          </h3>
                          <p className="mt-1 text-xs text-muted">
                            Quantidade de funcionários ativos em cada
                            departamento.
                          </p>
                        </div>

                        {departmentDistribution.length === 0 ? (
                          <EmptyDetail
                            icon={<Building2 size={22} />}
                            text="Nenhum funcionário ativo disponível para análise."
                          />
                        ) : (
                          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
                            <div className="space-y-3">
                              {departmentDistribution.map((department) => (
                                <button
                                  key={department.id}
                                  type="button"
                                  onClick={() => {
                                    if (department.id === "SEM_DEPARTAMENTO") {
                                      navigate("/funcionarios?status=ATIVO");
                                      return;
                                    }
                                    navigate(
                                      `/funcionarios?status=ATIVO&department=${department.id}`,
                                    );
                                  }}
                                  className="group block w-full rounded-xl p-3 text-left transition-colors hover:bg-surface-hover"
                                >
                                  <div className="mb-2 flex items-center justify-between gap-4">
                                    <span className="truncate text-xs font-semibold text-foreground">
                                      {department.name}
                                    </span>

                                    <div className="flex shrink-0 items-center gap-4">
                                      <span className="text-[10px] text-muted">
                                        {department.total}{" "}
                                        {department.total === 1
                                          ? "funcionário"
                                          : "funcionários"}
                                      </span>
                                      <span className="w-9 text-right text-[10px] font-semibold text-muted">
                                        {department.percentage}%
                                      </span>
                                    </div>
                                  </div>

                                  <div className="h-2 overflow-hidden rounded-full bg-dashboard-surface">
                                    <div
                                      className="h-full rounded-full bg-blue-600 transition-all duration-500 group-hover:bg-blue-500"
                                      style={{
                                        width: `${department.percentage}%`,
                                      }}
                                    />
                                  </div>
                                </button>
                              ))}
                            </div>

                            <div className="flex flex-col justify-between rounded-2xl border border-app-border bg-background/40 p-5">
                              <div>
                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-icon-surface text-blue-600">
                                  <Users size={20} />
                                </div>

                                <p className="text-xs text-muted">
                                  Funcionários ativos
                                </p>
                                <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                                  {totalAtivos}
                                </p>

                                <p className="mt-5 text-xs leading-5 text-muted">
                                  Distribuídos entre{" "}
                                  <strong className="font-semibold text-foreground">
                                    {departmentDistribution.length}
                                  </strong>{" "}
                                  {departmentDistribution.length === 1
                                    ? "departamento"
                                    : "departamentos"}
                                  .
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  navigate("/funcionarios?status=ATIVO")
                                }
                                className="mt-8 flex items-center justify-between rounded-xl border border-app-border px-4 py-3 text-xs font-semibold text-blue-600 transition-colors hover:bg-surface-hover"
                              >
                                Ver funcionários
                                <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STATUS */}
                    {detailTab === "status" && (
                      <div>
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">
                              Composição da equipe
                            </h3>
                            <p className="mt-1 text-xs text-muted">
                              Distribuição dos funcionários de acordo com a
                              situação atual.
                            </p>
                          </div>

                          <select
                            aria-label="Filtrar status por departamento"
                            value={statusDeptFilter}
                            onChange={(e) =>
                              setStatusDeptFilter(e.target.value)
                            }
                            className="h-10 rounded-xl border border-app-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-primary sm:w-56"
                          >
                            <option value="TODOS">Todos os departamentos</option>
                            {departmentOptions.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          {statusDistribution.map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                const params = new URLSearchParams({
                                  status: item.key,
                                });
                                if (statusDeptFilter !== "TODOS") {
                                  params.set("department", statusDeptFilter);
                                }
                                navigate(
                                  `/funcionarios?${params.toString()}`,
                                );
                              }}
                              className="rounded-2xl border border-app-border bg-background/40 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-hover"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold text-foreground">
                                    {item.label}
                                  </p>
                                  <p className="mt-1 text-[10px] text-muted">
                                    {item.description}
                                  </p>
                                </div>
                                <span className="shrink-0 text-xs font-semibold text-blue-600">
                                  {item.percentage}%
                                </span>
                              </div>

                              <p className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                                {item.total}
                              </p>

                              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-dashboard-surface">
                                <div
                                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ADMISSÕES */}
                    {detailTab === "admissions" && (
                      <div>
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">
                              Admissões nos últimos 12 meses
                            </h3>
                            <p className="mt-1 text-xs text-muted">
                              Clique em um mês no gráfico para visualizar os
                              colaboradores admitidos.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              navigate("/funcionarios?period=THIS_MONTH")
                            }
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-opacity hover:opacity-75"
                          >
                            Ver admissões deste mês
                            <ArrowRight size={13} />
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <div className="flex h-[260px] min-w-[650px] items-end justify-between gap-3 pb-2">
                            {monthlyAdmissions.map((item) => {
                              const isSelected =
                                selectedAdmissionMonth === item.key;
                              const percentage =
                                item.total === 0
                                  ? 3
                                  : Math.max(
                                      (item.total / maxAdmissions) * 100,
                                      8,
                                    );

                              return (
                                <button
                                  key={item.key}
                                  type="button"
                                  onClick={() =>
                                    setSelectedAdmissionMonth((prev) =>
                                      prev === item.key ? null : item.key,
                                    )
                                  }
                                  className="group flex h-full flex-1 flex-col justify-end text-center focus:outline-none"
                                >
                                  <div className="flex flex-1 items-end">
                                    <div
                                      title={`${item.fullLabel}: ${item.total} ${
                                        item.total === 1
                                          ? "admissão"
                                          : "admissões"
                                      }`}
                                      className={`relative w-full rounded-t-lg transition-all duration-200 ${
                                        isSelected
                                          ? "bg-blue-600 ring-2 ring-blue-500/40"
                                          : "bg-dashboard-surface group-hover:bg-blue-600"
                                      }`}
                                      style={{ height: `${percentage}%` }}
                                    >
                                      <span
                                        className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-foreground transition-opacity ${
                                          isSelected || item.total > 0
                                            ? "opacity-100"
                                            : "opacity-0 group-hover:opacity-100"
                                        }`}
                                      >
                                        {item.total}
                                      </span>
                                    </div>
                                  </div>

                                  <span
                                    className={`mt-2 text-center text-[10px] capitalize ${
                                      isSelected
                                        ? "font-bold text-blue-600"
                                        : "text-muted-light"
                                    }`}
                                  >
                                    {item.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* DETALHE DO MÊS SELECIONADO */}
                        {selectedAdmissionData && (
                          <div className="mt-6 rounded-2xl border border-app-border bg-background/40 p-4 sm:p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <div>
                                <h4 className="text-xs font-semibold capitalize text-foreground">
                                  Admitidos em {selectedAdmissionData.fullLabel}
                                </h4>
                                <p className="mt-0.5 text-[11px] text-muted">
                                  {selectedAdmissionData.total}{" "}
                                  {selectedAdmissionData.total === 1
                                    ? "colaborador admitido"
                                    : "colaboradores admitidos"}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedAdmissionMonth(null)}
                                className="text-[11px] font-medium text-muted hover:text-foreground"
                              >
                                Fechar
                              </button>
                            </div>

                            {selectedAdmissionData.employees.length === 0 ? (
                              <p className="text-xs text-muted">
                                Nenhuma admissão registrada neste mês.
                              </p>
                            ) : (
                              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                {selectedAdmissionData.employees.map((emp) => {
                                  const [y, m, d] = emp.dataAdmissao.split("-");
                                  return (
                                    <button
                                      key={emp.id}
                                      type="button"
                                      onClick={() =>
                                        navigate(`/funcionarios/${emp.id}`)
                                      }
                                      className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-surface p-3 text-left transition hover:border-blue-500/30 hover:bg-surface-hover"
                                    >
                                      <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold text-foreground">
                                          {emp.nome}
                                        </p>
                                        <p className="mt-0.5 truncate text-[10px] text-muted">
                                          {emp.cargoNome} ·{" "}
                                          {formatDepartmentLabel(
                                            emp.departamentoNome ?? "",
                                          )}
                                        </p>
                                      </div>

                                      <span className="shrink-0 rounded-lg bg-icon-surface px-2 py-1 text-[10px] font-semibold text-blue-600">
                                        {`${d}/${m}/${y}`}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ANIVERSÁRIOS */}
                    {detailTab === "birthdays" && (
                      <div>
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">
                              {birthdayMonthFilter === "PROXIMOS"
                                ? "Próximos aniversários"
                                : `Aniversariantes de ${
                                    MONTHS.find(
                                      (m) => m.value === birthdayMonthFilter,
                                    )?.label ?? ""
                                  }`}
                            </h3>
                            <p className="mt-1 text-xs text-muted">
                              {birthdayMonthFilter === "PROXIMOS"
                                ? "Colaboradores com aniversários mais próximos."
                                : "Colaboradores ativos que fazem aniversário no mês selecionado."}
                            </p>
                          </div>

                          <select
                            aria-label="Filtrar aniversários por mês"
                            value={birthdayMonthFilter}
                            onChange={(e) =>
                              setBirthdayMonthFilter(e.target.value)
                            }
                            className="h-10 rounded-xl border border-app-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-primary sm:w-52"
                          >
                            <option value="PROXIMOS">
                              Próximos aniversários
                            </option>
                            {MONTHS.map((month) => (
                              <option key={month.value} value={month.value}>
                                {month.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {filteredBirthdays.length > 0 ? (
                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {filteredBirthdays.map((event) => (
                              <button
                                key={event.id}
                                type="button"
                                onClick={() =>
                                  navigate(`/funcionarios/${event.id}`)
                                }
                                className="flex items-center gap-4 rounded-2xl border border-app-border bg-background/40 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-hover"
                              >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-icon-surface text-blue-600">
                                  <Cake size={18} />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-semibold text-foreground">
                                    {event.name}
                                  </p>
                                  <p className="mt-1 text-[10px] text-muted">
                                    {event.date.toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "long",
                                    })}{" "}
                                    · {event.department}
                                  </p>
                                </div>

                                <span className="shrink-0 rounded-full bg-icon-surface px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                                  {birthdayBadge(event.daysUntil)}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <EmptyDetail
                            icon={<Cake size={22} />}
                            text="Nenhum aniversariante encontrado para este filtro."
                          />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function DetailTabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
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
        pb-4
        pt-1
        text-xs
        font-semibold
        transition-colors
        duration-200
        ${
          active
            ? "text-blue-600"
            : "text-muted hover:text-foreground"
        }
      `}
    >
      {icon}
      {label}
      <span
        className={`
          absolute
          bottom-0
          left-0
          h-0.5
          w-full
          rounded-full
          bg-blue-600
          transition-all
          duration-200
          ${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}
        `}
      />
    </button>
  );
}

function EmptyDetail({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-icon-surface text-muted">
        {icon}
      </div>
      <p className="text-xs text-muted">{text}</p>
    </div>
  );
}