import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import EmployeeModal from "../../components/employees/EmployeeModal";
import employeeService from "../../services/employeeService";
import companyService from "../../services/companyService";
import departmentService from "../../services/departmentService";
import positionService from "../../services/positionService";
import contractService from "../../services/contractService";
import addressService from "../../services/addressService";
import type { Employee, EmployeeRequest } from "../../types/employee";
import type { Company } from "../../types/company";
import type { Department } from "../../types/department";
import type { Position } from "../../types/position";
import type { Contract, ContractType } from "../../types/contract";
import type { Address } from "../../types/address";

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  CLT: "CLT",
  PJ: "Pessoa Jurídica (PJ)",
  ESTAGIO: "Estágio",
  TEMPORARIO: "Temporário",
};

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
      : s === "FERIAS"
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
    [positions, setPositions] = useState<Position[]>([]),
    [contracts, setContracts] = useState<Contract[]>([]),
    [address, setAddress] = useState<Address | null>(null);

  const [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [modal, setModal] = useState(false),
    [term, setTerm] = useState(false),
    [termDate, setTermDate] = useState("");

  // Modal de Endereço
  const [addressModal, setAddressModal] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  // Modal de Novo Contrato
  const [contractModal, setContractModal] = useState(false);
  const [contractForm, setContractForm] = useState<{
    tipo: ContractType;
    dataInicio: string;
    descricao: string;
  }>({
    tipo: "CLT",
    dataInicio: "",
    descricao: "",
  });

  // Modal de Encerrar Contrato
  const [terminateContractTarget, setTerminateContractTarget] =
    useState<Contract | null>(null);
  const [contractEndDate, setContractEndDate] = useState("");

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      setError("");

      const [e, c, d, p, ct, addr] = await Promise.all([
        employeeService.findById(id),
        companyService.findAll().catch(() => []),
        departmentService.findAll().catch(() => []),
        positionService.findAll().catch(() => []),
        contractService.findByEmployee(id).catch(() => []),
        addressService.findByEmployee(id).catch(() => null),
      ]);

      setEmployee(e);
      setCompanies(c);
      setDepartments(d);
      setPositions(p);
      setContracts(ct);
      setAddress(addr);
    } catch (e) {
      console.error(e);
      setError(msg(e, "Não foi possível carregar o funcionário."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
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

  async function reactivate() {
    if (!id) return;
    try {
      setSaving(true);
      setError("");
      setEmployee(await employeeService.reactivate(id));
    } catch (e) {
      setError(msg(e, "Não foi possível reativar o funcionário."));
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
      setContracts(await contractService.findByEmployee(id));
      setTerm(false);
      setTermDate("");
    } catch (e) {
      setError(msg(e, "Não foi possível desligar o funcionário."));
    } finally {
      setSaving(false);
    }
  }

  function openAddressModal() {
    setError("");
    if (address) {
      setAddressForm({
        cep: address.cep,
        logradouro: address.logradouro,
        numero: address.numero,
        complemento: address.complemento ?? "",
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado,
      });
    } else {
      setAddressForm({
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      });
    }
    setAddressModal(true);
  }

  async function handleCepBlur() {
    const cleanCep = addressForm.cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    try {
      setCepLoading(true);
      const { data } = await axios.get<{
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      }>(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!data.erro) {
        setAddressForm((prev) => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
      }
    } catch {
      // Falha silenciosa na consulta externa de CEP
    } finally {
      setCepLoading(false);
    }
  }

  async function saveAddress(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      setSaving(true);
      setError("");
      const payload = {
        funcionarioId: id,
        cep: addressForm.cep.replace(/\D/g, ""),
        logradouro: addressForm.logradouro.trim(),
        numero: addressForm.numero.trim(),
        complemento: addressForm.complemento.trim() || null,
        bairro: addressForm.bairro.trim(),
        cidade: addressForm.cidade.trim(),
        estado: addressForm.estado.trim().toUpperCase(),
      };
      const saved = address
        ? await addressService.update(address.id, payload)
        : await addressService.create(payload);
      setAddress(saved);
      setAddressModal(false);
    } catch (err) {
      setError(msg(err, "Não foi possível salvar o endereço."));
    } finally {
      setSaving(false);
    }
  }

  function openNewContractModal() {
    if (!employee) return;
    setError("");
    setContractForm({
      tipo: "CLT",
      dataInicio: employee.dataAdmissao || "",
      descricao: "",
    });
    setContractModal(true);
  }

  async function saveContract(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      setSaving(true);
      setError("");
      await contractService.create({
        funcionarioId: id,
        tipo: contractForm.tipo,
        dataInicio: contractForm.dataInicio,
        descricao: contractForm.descricao.trim() || null,
      });
      setContracts(await contractService.findByEmployee(id));
      setContractModal(false);
    } catch (err) {
      setError(msg(err, "Não foi possível cadastrar o contrato."));
    } finally {
      setSaving(false);
    }
  }

  async function confirmTerminateContract(e: FormEvent) {
    e.preventDefault();
    if (!id || !terminateContractTarget || !contractEndDate) return;
    try {
      setSaving(true);
      setError("");
      await contractService.terminate(terminateContractTarget.id, {
        dataFim: contractEndDate,
      });
      setContracts(await contractService.findByEmployee(id));
      setTerminateContractTarget(null);
      setContractEndDate("");
    } catch (err) {
      setError(msg(err, "Não foi possível encerrar o contrato."));
    } finally {
      setSaving(false);
    }
  }

  const activeContract = contracts.find((c) => c.status === "ATIVO") ?? null;

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

              {/* CABEÇALHO DO COLABORADOR */}
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
                  <div className="flex flex-wrap gap-2">
                    {employee.status === "DESLIGADO" && (
                      <button
                        onClick={reactivate}
                        disabled={saving}
                        className="rounded-xl border border-app-border px-4 py-2.5 text-xs font-semibold text-primary disabled:opacity-60"
                      >
                        {saving ? "Reativando..." : "Reativar"}
                      </button>
                    )}
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

              {/* RESUMO RÁPIDO */}
              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Summary l="Empresa" v={employee.empresaNome} />
                <Summary l="Departamento" v={employee.departamentoNome} />
                <Summary l="Cargo" v={employee.cargoNome} />
                <Summary
                  l="Contrato vigente"
                  v={
                    activeContract
                      ? `${CONTRACT_TYPE_LABELS[activeContract.tipo] ?? activeContract.tipo} · Desde ${date(activeContract.dataInicio)}`
                      : "Sem contrato ativo"
                  }
                />
              </section>

              {/* DADOS PESSOAIS & PROFISSIONAIS */}
              <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
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

              {/* ENDEREÇO & CONTRATOS */}
              <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* CARD DE ENDEREÇO */}
                <div className="rounded-2xl border border-app-border bg-surface p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      Endereço residencial
                    </h2>
                    <button
                      type="button"
                      onClick={openAddressModal}
                      className="rounded-xl border border-app-border px-3.5 py-2 text-xs font-semibold text-primary transition hover:bg-icon-surface"
                    >
                      {address ? "Editar endereço" : "+ Cadastrar endereço"}
                    </button>
                  </div>

                  {!address ? (
                    <p className="mt-6 text-xs text-muted">
                      Nenhum endereço cadastrado para este colaborador.
                    </p>
                  ) : (
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Info l="CEP" v={address.cep} />
                      <Info
                        l="Cidade / UF"
                        v={`${address.cidade} / ${address.estado}`}
                      />
                      <Info
                        l="Logradouro"
                        v={`${address.logradouro}, ${address.numero}`}
                      />
                      <Info l="Bairro" v={address.bairro} />
                      <Info l="Complemento" v={address.complemento || "—"} />
                    </div>
                  )}
                </div>

                {/* CARD DE CONTRATOS */}
                <div className="rounded-2xl border border-app-border bg-surface p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      Contratos de trabalho
                    </h2>
                    {employee.ativo &&
                      employee.status !== "DESLIGADO" &&
                      !activeContract && (
                        <button
                          type="button"
                          onClick={openNewContractModal}
                          className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        >
                          + Novo contrato
                        </button>
                      )}
                  </div>

                  {contracts.length === 0 ? (
                    <p className="mt-6 text-xs text-muted">
                      Nenhum contrato registrado para este colaborador.
                    </p>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {contracts.map((contract) => (
                        <div
                          key={contract.id}
                          className="flex flex-col justify-between gap-3 rounded-xl border border-app-border bg-background/60 p-4 sm:flex-row sm:items-center"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold text-foreground">
                                {CONTRACT_TYPE_LABELS[contract.tipo] ??
                                  contract.tipo}
                              </span>
                              <Badge s={contract.status} />
                            </div>
                            <p className="mt-1 text-[11px] text-muted">
                              Início: {date(contract.dataInicio)}
                              {contract.dataFim
                                ? ` · Encerrado em: ${date(contract.dataFim)}`
                                : " · Vigente"}
                            </p>
                            {contract.descricao && (
                              <p className="mt-1 text-[11px] text-muted-light">
                                {contract.descricao}
                              </p>
                            )}
                          </div>

                          {contract.status === "ATIVO" && (
                            <button
                              type="button"
                              onClick={() => {
                                setTerminateContractTarget(contract);
                                setContractEndDate("");
                              }}
                              className="self-start rounded-xl border border-app-border px-3 py-2 text-[11px] font-semibold text-danger transition hover:bg-danger/10 sm:self-center"
                            >
                              Encerrar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* MODAL EDITAR FUNCIONÁRIO */}
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

      {/* MODAL DESLIGAR FUNCIONÁRIO */}
      {term && employee && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 sm:items-center sm:p-6">
          <div className="w-full rounded-t-3xl border border-app-border bg-surface p-6 sm:max-w-[460px] sm:rounded-2xl">
            <h2 className="text-base font-bold text-foreground">
              Desligar funcionário
            </h2>
            <p className="mt-1 text-xs text-muted">
              Informe a data de desligamento de {employee.nome}. O contrato
              ativo será encerrado automaticamente nesta data.
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

      {/* MODAL ENDEREÇO */}
      {addressModal && employee && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 sm:items-center sm:p-6">
          <form
            onSubmit={saveAddress}
            className="w-full rounded-t-3xl border border-app-border bg-surface p-6 sm:max-w-[540px] sm:rounded-2xl"
          >
            <h2 className="text-base font-bold text-foreground">
              {address ? "Editar endereço" : "Cadastrar endereço"}
            </h2>
            <p className="mt-1 text-xs text-muted">
              Endereço residencial de {employee.nome}.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-medium text-muted">
                  CEP {cepLoading && "(buscando...)"}
                </label>
                <input
                  required
                  maxLength={9}
                  placeholder="00000-000"
                  value={addressForm.cep}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, cep: e.target.value })
                  }
                  onBlur={() => void handleCepBlur()}
                  className="mt-1 h-10 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs text-foreground"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-muted">
                  Logradouro
                </label>
                <input
                  required
                  value={addressForm.logradouro}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      logradouro: e.target.value,
                    })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted">
                  Número
                </label>
                <input
                  required
                  value={addressForm.numero}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, numero: e.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs text-foreground"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-muted">
                  Complemento (opcional)
                </label>
                <input
                  value={addressForm.complemento}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      complemento: e.target.value,
                    })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted">
                  Bairro
                </label>
                <input
                  required
                  value={addressForm.bairro}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, bairro: e.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted">
                  Cidade
                </label>
                <input
                  required
                  value={addressForm.cidade}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, cidade: e.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted">UF</label>
                <input
                  required
                  maxLength={2}
                  placeholder="PE"
                  value={addressForm.estado}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, estado: e.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs uppercase text-foreground"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddressModal(false)}
                className="h-10 rounded-xl border border-app-border px-5 text-xs text-muted"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-xl bg-primary px-5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar endereço"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL NOVO CONTRATO */}
      {contractModal && employee && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 sm:items-center sm:p-6">
          <form
            onSubmit={saveContract}
            className="w-full rounded-t-3xl border border-app-border bg-surface p-6 sm:max-w-[460px] sm:rounded-2xl"
          >
            <h2 className="text-base font-bold text-foreground">
              Novo contrato de trabalho
            </h2>
            <p className="mt-1 text-xs text-muted">
              Vincular contrato ativo para {employee.nome}.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-[11px] font-medium text-muted">
                  Regime / Tipo
                </label>
                <select
                  value={contractForm.tipo}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      tipo: e.target.value as ContractType,
                    })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs text-foreground"
                >
                  <option value="CLT">CLT</option>
                  <option value="PJ">Pessoa Jurídica (PJ)</option>
                  <option value="ESTAGIO">Estágio</option>
                  <option value="TEMPORARIO">Temporário</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted">
                  Data de início
                </label>
                <input
                  type="date"
                  required
                  value={contractForm.dataInicio}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      dataInicio: e.target.value,
                    })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted">
                  Observações / Cláusulas (opcional)
                </label>
                <textarea
                  rows={3}
                  value={contractForm.descricao}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      descricao: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-app-border bg-surface-secondary p-3 text-xs text-foreground"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setContractModal(false)}
                className="h-10 rounded-xl border border-app-border px-5 text-xs text-muted"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-xl bg-primary px-5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Criar contrato"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL ENCERRAR CONTRATO */}
      {terminateContractTarget && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 sm:items-center sm:p-6">
          <form
            onSubmit={confirmTerminateContract}
            className="w-full rounded-t-3xl border border-app-border bg-surface p-6 sm:max-w-[440px] sm:rounded-2xl"
          >
            <h2 className="text-base font-bold text-foreground">
              Encerrar contrato
            </h2>
            <p className="mt-1 text-xs text-muted">
              Informe a data de término do contrato (
              {CONTRACT_TYPE_LABELS[terminateContractTarget.tipo] ??
                terminateContractTarget.tipo}
              ).
            </p>
            <input
              type="date"
              required
              min={terminateContractTarget.dataInicio}
              value={contractEndDate}
              onChange={(e) => setContractEndDate(e.target.value)}
              className="mt-5 h-11 w-full rounded-xl border border-app-border bg-surface-secondary px-3 text-xs text-foreground"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTerminateContractTarget(null)}
                className="h-10 rounded-xl border border-app-border px-5 text-xs text-muted"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!contractEndDate || saving}
                className="h-10 rounded-xl bg-danger px-5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Encerrando..." : "Confirmar encerramento"}
              </button>
            </div>
          </form>
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