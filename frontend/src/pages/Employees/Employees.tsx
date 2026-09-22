import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import EmployeeModal from "../../components/employees/EmployeeModal";
import employeeService from "../../services/employeeService";
import companyService from "../../services/companyService";
import departmentService from "../../services/departmentService";
import positionService from "../../services/positionService";
import type { Employee, EmployeeRequest } from "../../types/employee";
import type { Company } from "../../types/company";
import type { Department } from "../../types/department";
import type { Position } from "../../types/position";

const date = (v: string | null) => {
  if (!v) return "—";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
};
const initials = (n: string) => {
  const a = n.trim().split(/\s+/);
  return a.length === 1
    ? a[0].slice(0, 2).toUpperCase()
    : (a[0][0] + a.at(-1)![0]).toUpperCase();
};
function Badge({ s }: { s: string }) {
  const c =
    s === "ATIVO"
      ? "text-emerald-600"
      : s === "FÉRIAS"
        ? "text-blue-600"
        : s === "AFASTADO"
          ? "text-amber-600"
          : "text-muted";
  return (
    <span
      className={`rounded-full bg-surface-secondary px-2.5 py-1 text-[10px] font-semibold ${c}`}
    >
      {s}
    </span>
  );
}

export default function Employees() {
  const nav = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]),
    [companies, setCompanies] = useState<Company[]>([]),
    [departments, setDepartments] = useState<Department[]>([]),
    [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const [modal, setModal] = useState(false),
    [selected, setSelected] = useState<Employee | null>(null);
  const [search, setSearch] = useState(""),
    [company, setCompany] = useState("TODAS"),
    [department, setDepartment] = useState("TODOS"),
    [position, setPosition] = useState("TODOS"),
    [status, setStatus] = useState("TODOS");
  async function load() {
    try {
      setLoading(true);
      setError("");
      const [e, c, d, p] = await Promise.all([
        employeeService.findAll(),
        companyService.findAll(),
        departmentService.findAll(),
        positionService.findAll(),
      ]);
      setEmployees(e);
      setCompanies(c);
      setDepartments(d);
      setPositions(p);
    } catch (e) {
      console.error(e);
      setError("Não foi possível carregar os funcionários.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(
    () =>
      employees.filter((e) => {
        const q = search.trim().toLowerCase();
        return (
          (e.nome.toLowerCase().includes(q) ||
            (e.email ?? "").toLowerCase().includes(q) ||
            e.cpf.includes(q.replace(/\D/g, "")) ||
            e.cargoNome.toLowerCase().includes(q)) &&
          (company === "TODAS" || e.empresaId === company) &&
          (department === "TODOS" || e.departamentoId === department) &&
          (position === "TODOS" || e.cargoId === position) &&
          (status === "TODOS" || e.status === status)
        );
      }),
    [employees, search, company, department, position, status],
  );
  const deps = departments.filter(
      (x) => company === "TODAS" || x.empresaId === company,
    ),
    jobs = positions.filter(
      (x) => department === "TODOS" || x.departamentoId === department,
    );
  const clear = () => {
    setSearch("");
    setCompany("TODAS");
    setDepartment("TODOS");
    setPosition("TODOS");
    setStatus("TODOS");
  };
  async function save(data: EmployeeRequest) {
    try {
      setSaving(true);
      setError("");
      selected
        ? await employeeService.update(selected.id, data)
        : await employeeService.create(data);
      setModal(false);
      setSelected(null);
      await load();
    } catch (e) {
      console.error(e);
      const d = axios.isAxiosError(e) ? e.response?.data : null;
      setError(
        d?.message ?? d?.error ?? "Não foi possível salvar o funcionário.",
      );
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
                Funcionários
              </h1>
              <p className="mt-1 text-xs text-muted">
                Gerencie os colaboradores cadastrados no RHFlow.
              </p>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setModal(true);
              }}
              className="h-11 rounded-xl bg-primary px-5 text-xs font-semibold text-white"
            >
              + Novo funcionário
            </button>
          </section>
          <section className="overflow-hidden rounded-2xl border border-app-border bg-surface">
            <div className="border-b border-app-border p-4 sm:p-5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar funcionário..."
                className="mb-4 h-10 w-full max-w-[380px] rounded-xl border border-app-border bg-background px-4 text-xs text-foreground outline-none focus:border-primary"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <Filter
                  value={company}
                  first="TODAS"
                  label="Todas as empresas"
                  options={companies.map((x) => [x.id, x.nome])}
                  change={(v) => {
                    setCompany(v);
                    setDepartment("TODOS");
                    setPosition("TODOS");
                  }}
                />
                <Filter
                  value={department}
                  first="TODOS"
                  label="Todos os departamentos"
                  options={deps.map((x) => [x.id, x.nome])}
                  change={(v) => {
                    setDepartment(v);
                    setPosition("TODOS");
                  }}
                />
                <Filter
                  value={position}
                  first="TODOS"
                  label="Todos os cargos"
                  options={jobs.map((x) => [x.id, x.nome])}
                  change={setPosition}
                />
                <Filter
                  value={status}
                  first="TODOS"
                  label="Todos os status"
                  options={[
                    ["ATIVO", "Ativo"],
                    ["FÉRIAS", "Férias"],
                    ["AFASTADO", "Afastado"],
                    ["INATIVO", "Inativo"],
                    ["DESLIGADO", "Desligado"],
                  ]}
                  change={setStatus}
                />
                <button
                  onClick={clear}
                  className="h-10 rounded-xl border border-app-border text-xs font-semibold text-muted"
                >
                  Limpar filtros
                </button>
              </div>
              <p className="mt-4 text-[11px] text-muted-light">
                {filtered.length} funcionários encontrados
              </p>
            </div>
            {loading ? (
              <div className="py-14 text-center text-xs text-muted">
                Carregando funcionários...
              </div>
            ) : error ? (
              <div className="p-5 text-xs text-danger">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="py-14 text-center text-xs text-muted">
                Nenhum funcionário encontrado
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-app-border bg-background/70">
                        {[
                          "Funcionário",
                          "Empresa",
                          "Cargo",
                          "Departamento",
                          "Admissão",
                          "Status",
                          "Ações",
                        ].map((x) => (
                          <th
                            key={x}
                            className={`px-5 py-3 text-[10px] uppercase text-muted-light ${x === "Ações" ? "text-right" : "text-left"}`}
                          >
                            {x}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((e) => (
                        <tr
                          key={e.id}
                          className="border-b border-app-border last:border-0 hover:bg-background/70"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-icon-surface text-[11px] font-bold text-primary">
                                {initials(e.nome)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground">
                                  {e.nome}
                                </p>
                                <p className="text-[10px] text-muted-light">
                                  {e.email || e.cpf}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-muted">
                            {e.empresaNome}
                          </td>
                          <td className="px-5 py-4 text-xs text-muted">
                            {e.cargoNome}
                          </td>
                          <td className="px-5 py-4 text-xs text-muted">
                            {e.departamentoNome}
                          </td>
                          <td className="px-5 py-4 text-xs text-muted">
                            {date(e.dataAdmissao)}
                          </td>
                          <td className="px-5 py-4">
                            <Badge s={e.status} />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => nav(`/funcionarios/${e.id}`)}
                              className="mr-2 text-[10px] font-semibold text-primary"
                            >
                              Visualizar
                            </button>
                            <button
                              onClick={() => {
                                setSelected(e);
                                setModal(true);
                              }}
                              className="text-[10px] font-semibold text-muted"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-4 p-4 md:hidden">
                  {filtered.map((e) => (
                    <article
                      key={e.id}
                      className="rounded-2xl border border-app-border p-4"
                    >
                      <div className="mb-4 flex justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            {e.nome}
                          </h3>
                          <p className="text-[10px] text-muted-light">
                            {e.email || e.cpf}
                          </p>
                        </div>
                        <Badge s={e.status} />
                      </div>
                      <p className="text-xs text-muted">
                        {e.empresaNome} · {e.departamentoNome}
                      </p>
                      <p className="mt-1 text-xs font-medium text-foreground">
                        {e.cargoNome}
                      </p>
                      <div className="mt-4 flex gap-2 border-t border-app-border pt-4">
                        <button
                          onClick={() => nav(`/funcionarios/${e.id}`)}
                          className="flex-1 rounded-xl border border-app-border py-2.5 text-xs text-muted"
                        >
                          Visualizar
                        </button>
                        <button
                          onClick={() => {
                            setSelected(e);
                            setModal(true);
                          }}
                          className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white"
                        >
                          Editar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      <EmployeeModal
        isOpen={modal}
        employee={selected}
        companies={companies}
        departments={departments}
        positions={positions}
        loading={saving}
        onClose={() => {
          if (!saving) {
            setModal(false);
            setSelected(null);
          }
        }}
        onSubmit={save}
      />
    </div>
  );
}
function Filter({
  value,
  first,
  label,
  options,
  change,
}: {
  value: string;
  first: string;
  label: string;
  options: string[][];
  change: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => change(e.target.value)}
      className="h-10 rounded-xl border border-app-border bg-surface px-3 text-xs text-muted"
    >
      <option value={first}>{label}</option>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
