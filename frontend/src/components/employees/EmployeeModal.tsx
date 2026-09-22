import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Company } from "../../types/company";
import type { Department } from "../../types/department";
import type { Position } from "../../types/position";
import type { Employee, EmployeeRequest } from "../../types/employee";

type Props = {
  isOpen: boolean;
  employee?: Employee | null;
  companies: Company[];
  departments: Department[];
  positions: Position[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeRequest) => Promise<void> | void;
};
type Form = {
  empresaId: string;
  departamentoId: string;
  cargoId: string;
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  dataAdmissao: string;
  status: string;
};
const empty: Form = {
  empresaId: "",
  departamentoId: "",
  cargoId: "",
  nome: "",
  cpf: "",
  rg: "",
  dataNascimento: "",
  email: "",
  telefone: "",
  dataAdmissao: "",
  status: "ATIVO",
};

export default function EmployeeModal({
  isOpen,
  employee,
  companies,
  departments,
  positions,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<Form>(empty);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isOpen) return;
    setForm(
      employee
        ? {
            empresaId: employee.empresaId,
            departamentoId: employee.departamentoId,
            cargoId: employee.cargoId,
            nome: employee.nome,
            cpf: employee.cpf,
            rg: employee.rg ?? "",
            dataNascimento: employee.dataNascimento ?? "",
            email: employee.email ?? "",
            telefone: employee.telefone ?? "",
            dataAdmissao: employee.dataAdmissao,
            status: employee.status ?? "ATIVO",
          }
        : empty,
    );
    setError("");
  }, [isOpen, employee]);
  const comps = useMemo(
    () => companies.filter((x) => x.ativo || x.id === employee?.empresaId),
    [companies, employee],
  );
  const deps = useMemo(
    () =>
      departments.filter(
        (x) =>
          x.empresaId === form.empresaId &&
          (x.ativo || x.id === employee?.departamentoId),
      ),
    [departments, form.empresaId, employee],
  );
  const jobs = useMemo(
    () =>
      positions.filter(
        (x) =>
          x.departamentoId === form.departamentoId &&
          (x.ativo || x.id === employee?.cargoId),
      ),
    [positions, form.departamentoId, employee],
  );
  const set = (k: keyof Form, v: string) => setForm((x) => ({ ...x, [k]: v }));
  async function submit(e: any) {
    e.preventDefault();
    const cpf = form.cpf.replace(/\D/g, "");
    if (!form.empresaId || !form.departamentoId || !form.cargoId)
      return setError("Selecione empresa, departamento e cargo.");
    if (!form.nome.trim()) return setError("Informe o nome.");
    if (cpf.length !== 11)
      return setError("O CPF deve conter exatamente 11 dígitos.");
    if (!form.dataAdmissao) return setError("Informe a data de admissão.");
    setError("");
    await onSubmit({
      cargoId: form.cargoId,
      nome: form.nome.trim(),
      cpf,
      rg: form.rg.trim(),
      dataNascimento: form.dataNascimento || null,
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      dataAdmissao: form.dataAdmissao,
      status: form.status || null,
    });
  }
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[92dvh] w-full flex-col rounded-t-3xl border border-app-border bg-surface shadow-2xl sm:max-w-[820px] sm:rounded-2xl">
        <div className="flex justify-between border-b border-app-border px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold text-primary">
              Gestão de pessoas
            </p>
            <h2 className="text-lg font-bold text-foreground">
              {employee ? "Editar funcionário" : "Novo funcionário"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl text-muted hover:bg-surface-hover"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto p-5 sm:p-6">
            <h3 className="mb-4 text-xs font-semibold text-foreground">
              Vínculo profissional
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Select
                label="Empresa"
                value={form.empresaId}
                disabled={loading}
                options={comps.map((x) => [x.id, x.nome])}
                onChange={(v) =>
                  setForm((x) => ({
                    ...x,
                    empresaId: v,
                    departamentoId: "",
                    cargoId: "",
                  }))
                }
              />
              <Select
                label="Departamento"
                value={form.departamentoId}
                disabled={loading || !form.empresaId}
                options={deps.map((x) => [x.id, x.nome])}
                onChange={(v) =>
                  setForm((x) => ({ ...x, departamentoId: v, cargoId: "" }))
                }
              />
              <Select
                label="Cargo"
                value={form.cargoId}
                disabled={loading || !form.departamentoId}
                options={jobs.map((x) => [x.id, x.nome])}
                onChange={(v) => set("cargoId", v)}
              />
              <Input
                label="Data de admissão"
                type="date"
                value={form.dataAdmissao}
                onChange={(v) => set("dataAdmissao", v)}
              />
              <Select
                label="Status"
                value={form.status}
                disabled={loading}
                options={[
                  ["ATIVO", "Ativo"],
                  ["FÉRIAS", "Férias"],
                  ["AFASTADO", "Afastado"],
                  ["INATIVO", "Inativo"],
                ]}
                onChange={(v) => set("status", v)}
              />
            </div>
            <div className="my-6 border-t border-app-border" />
            <h3 className="mb-4 text-xs font-semibold text-foreground">
              Dados pessoais
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Nome completo"
                  value={form.nome}
                  onChange={(v) => set("nome", v)}
                />
              </div>
              <Input
                label="CPF"
                value={form.cpf}
                onChange={(v) => set("cpf", v.replace(/\D/g, "").slice(0, 11))}
              />
              <Input
                label="RG"
                value={form.rg}
                onChange={(v) => set("rg", v)}
              />
              <Input
                label="Data de nascimento"
                type="date"
                value={form.dataNascimento}
                onChange={(v) => set("dataNascimento", v)}
              />
              <Input
                label="Telefone"
                value={form.telefone}
                onChange={(v) => set("telefone", v)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="E-mail"
                  type="email"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                />
              </div>
            </div>
            {error && (
              <div className="mt-5 rounded-xl bg-red-500/10 px-4 py-3 text-xs text-danger">
                {error}
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-app-border p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-app-border px-5 text-xs font-semibold text-muted"
            >
              Cancelar
            </button>
            <button
              disabled={loading}
              className="h-11 rounded-xl bg-primary px-5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {loading
                ? "Salvando..."
                : employee
                  ? "Salvar alterações"
                  : "Cadastrar funcionário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
const cls =
  "h-11 w-full rounded-xl border border-app-border bg-surface-secondary px-3.5 text-xs text-foreground outline-none focus:border-primary disabled:opacity-60";
function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cls}
      />
    </div>
  );
}
function Select({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[][];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-foreground">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cls}
      >
        <option value="">Selecione</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
