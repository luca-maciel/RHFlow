import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
export default function EmployeeDetails() {
  const nav = useNavigate(),
    { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null),
    [companies, setCompanies] = useState<Company[]>([]),
    [departments, setDepartments] = useState<Department[]>([]),
    [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [modal, setModal] = useState(false),
    [term, setTerm] = useState(false),
    [termDate, setTermDate] = useState("");
  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [e, c, d, p] = await Promise.all([
        employeeService.findById(id),
        companyService.findAll(),
        departmentService.findAll(),
        positionService.findAll(),
      ]);
      setEmployee(e);
      setCompanies(c);
      setDepartments(d);
      setPositions(p);
    } catch (e) {
      console.error(e);
      setError("Não foi possível carregar o funcionário.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [id]);
  const msg = (e: unknown, f: string) => {
    if (!axios.isAxiosError(e)) return f;
    return e.response?.data?.message ?? e.response?.data?.error ?? f;
  };
  async function save(data: EmployeeRequest) {
    if (!id) return;
    try {
      setSaving(true);
      setError("");
      setEmployee(await employeeService.update(id, data));
      setModal(false);
    } catch (e) {
      setError(msg(e, "Não foi possível atualizar o funcionário."));
    } finally {
      setSaving(false);
    }
  }
  async function terminate() {
    if (!id || !termDate) return;
    try {
      setSaving(true);
      setError("");
      setEmployee(
        await employeeService.terminate(id, { dataDemissao: termDate }),
      );
      setTerm(false);
      setTermDate("");
    } catch (e) {
      setError(msg(e, "Não foi possível desligar o funcionário."));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px]">
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => nav("/funcionarios")}
            className="mb-5 text-xs font-semibold text-muted hover:text-primary"
          >
            ← Voltar para funcionários
          </button>
          {loading ? (
            <div className="rounded-2xl border border-app-border bg-surface p-12 text-center text-xs text-muted">
              Carregando...
            </div>
          ) : !employee ? (
            <div className="text-xs text-danger">
              {error || "Funcionário não encontrado."}
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 rounded-xl bg-red-500/10 p-4 text-xs text-danger">
                  {error}
                </div>
              )}
              <section className="mb-6 rounded-2xl border border-app-border bg-surface p-5 sm:p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-icon-surface text-xl font-bold text-primary">
                      {initials(employee.nome)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">
                          {employee.nome}
                        </h1>
                        <Badge s={employee.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {employee.cargoNome}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-light">
                        CPF {employee.cpf}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {employee.ativo && employee.status !== "DESLIGADO" && (
                      <button
                        onClick={() => setTerm(true)}
                        className="rounded-xl border border-app-border px-4 py-2.5 text-xs font-semibold text-muted"
                      >
                        Desligar
                      </button>
                    )}
                    <button
                      onClick={() => setModal(true)}
                      className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white"
                    >
                      Editar funcionário
                    </button>
                  </div>
                </div>
              </section>
              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Summary l="Empresa" v={employee.empresaNome} />
                <Summary l="Departamento" v={employee.departamentoNome} />
                <Summary l="Cargo" v={employee.cargoNome} />
                <Summary l="Admissão" v={date(employee.dataAdmissao)} />
              </section>
              <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <Card title="Dados pessoais">
                  <Info l="Nome completo" v={employee.nome} />
                  <Info l="CPF" v={employee.cpf} />
                  <Info l="RG" v={employee.rg || "—"} />
                  <Info l="E-mail" v={employee.email || "—"} />
                  <Info l="Telefone" v={employee.telefone || "—"} />
                  <Info l="Nascimento" v={date(employee.dataNascimento)} />
                </Card>
                <Card title="Dados profissionais">
                  <Info l="Empresa" v={employee.empresaNome} />
                  <Info l="Departamento" v={employee.departamentoNome} />
                  <Info l="Cargo" v={employee.cargoNome} />
                  <Info l="Admissão" v={date(employee.dataAdmissao)} />
                  <Info l="Desligamento" v={date(employee.dataDemissao)} />
                  <div>
                    <p className="text-[10px] uppercase text-muted-light">
                      Status
                    </p>
                    <div className="mt-2">
                      <Badge s={employee.status} />
                    </div>
                  </div>
                </Card>
              </section>
            </>
          )}
        </div>
      </main>
      {employee && (
        <EmployeeModal
          isOpen={modal}
          employee={employee}
          companies={companies}
          departments={departments}
          positions={positions}
          loading={saving}
          onClose={() => !saving && setModal(false)}
          onSubmit={save}
        />
      )}
      {term && employee && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 sm:items-center sm:p-6">
          <div className="w-full rounded-t-3xl border border-app-border bg-surface p-6 sm:max-w-[460px] sm:rounded-2xl">
            <h2 className="text-base font-bold text-foreground">
              Desligar funcionário
            </h2>
            <p className="mt-1 text-xs text-muted">
              Informe a data de desligamento de {employee.nome}.
            </p>
            <input
              type="date"
              min={employee.dataAdmissao}
              value={termDate}
              onChange={(e) => setTermDate(e.target.value)}
              className="mt-5 h-11 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs text-foreground"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setTerm(false)}
                className="h-11 rounded-xl border border-app-border px-5 text-xs text-muted"
              >
                Cancelar
              </button>
              <button
                onClick={terminate}
                disabled={!termDate || saving}
                className="h-11 rounded-xl bg-danger px-5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Desligando..." : "Confirmar desligamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Summary({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-2xl border border-app-border bg-surface p-5">
      <p className="text-[10px] uppercase text-muted-light">{l}</p>
      <p className="mt-2 text-xs font-semibold text-foreground">{v}</p>
    </div>
  );
}
function Info({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-light">{l}</p>
      <p className="mt-1 break-words text-xs font-medium text-foreground">
        {v}
      </p>
    </div>
  );
}
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-app-border bg-surface p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}
