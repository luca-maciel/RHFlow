import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

type EmployeeStatus = "ATIVO" | "FÉRIAS" | "AFASTADO" | "INATIVO";

type Employee = {
  id: string;
  matricula: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  nascimento: string;

  empresa: string;
  departamento: string;
  cargo: string;

  admissao: string;
  tipoContrato: string;
  salario: string;
  gestor: string;

  status: EmployeeStatus;
};

const employeesMock: Employee[] = [
  {
    id: "1",
    matricula: "RH001",
    nome: "João da Silva",
    email: "joao@rhflow.com",
    telefone: "(81) 99999-9999",
    cpf: "123.456.789-00",
    nascimento: "18/06/1998",

    empresa: "RHFlow Tecnologia",
    departamento: "Tecnologia da Informação",
    cargo: "Desenvolvedor Backend",

    admissao: "10/01/2025",
    tipoContrato: "CLT",
    salario: "R$ 5.800,00",
    gestor: "Carlos Henrique",

    status: "ATIVO",
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function StatusBadge({
  status,
}: {
  status: EmployeeStatus;
}) {
  const styles: Record<EmployeeStatus, string> = {
    ATIVO: "bg-surface-secondary text-emerald-600",
    FÉRIAS: "bg-surface-secondary text-blue-600",
    AFASTADO: "bg-surface-secondary text-amber-600",
    INATIVO: "bg-surface-secondary text-muted",
  };

  const dots: Record<EmployeeStatus, string> = {
    ATIVO: "bg-emerald-500",
    FÉRIAS: "bg-blue-500",
    AFASTADO: "bg-amber-500",
    INATIVO: "bg-slate-400",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${styles[status]}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${dots[status]}
        `}
      />

      {status}
    </span>
  );
}

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}

export default function EmployeeDetails() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const employee =
    employeesMock.find(
      (item) => item.id === id
    ) ?? employeesMock[0];

  return (
    <div className="min-h-screen bg-background">
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

      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px]">
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {/* VOLTAR */}

          <button
            type="button"
            onClick={() =>
              navigate("/funcionarios")
            }
            className="
              mb-5
              flex
              items-center
              gap-2
              text-xs
              font-semibold
              text-muted
              transition
              hover:text-blue-600
            "
          >
            ←
            Voltar para funcionários
          </button>

          {/* CABEÇALHO */}

          <section
            className="
              mb-6
              rounded-2xl
              border
              border-app-border
              bg-surface
              p-5

              sm:p-6
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5

                md:flex-row
                md:items-center
                md:justify-between
              "
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-16
                    w-16
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-icon-surface
                    text-base
                    font-bold
                    text-foreground

                    sm:h-20
                    sm:w-20
                    sm:text-xl
                  "
                >
                  {getInitials(employee.nome)}
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <h1
                      className="
                        text-xl
                        font-bold
                        tracking-tight
                        text-foreground

                        sm:text-2xl
                      "
                    >
                      {employee.nome}
                    </h1>

                    <StatusBadge
                      status={employee.status}
                    />
                  </div>

                  <p className="text-xs text-muted">
                    {employee.cargo}
                  </p>

                  <p className="mt-1 text-[10px] text-muted-light">
                    Matrícula {employee.matricula}
                  </p>
                </div>
              </div>

              {/* AÇÕES */}

              <div
                className="
                  flex
                  w-full
                  gap-2

                  md:w-auto
                "
              >
                <button
                  type="button"
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-app-border
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-muted
                    transition
                    hover:bg-background

                    md:flex-none
                  "
                >
                  Desativar
                </button>

                <button
                  type="button"
                  className="
                    flex-1
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    shadow-[0_6px_15px_rgba(37,99,235,0.18)]
                    transition
                    hover:bg-blue-700

                    md:flex-none
                  "
                >
                  Editar funcionário
                </button>
              </div>
            </div>
          </section>

          {/* RESUMO */}

          <section
            className="
              mb-6
              grid
              grid-cols-1
              gap-4

              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            <div className="rounded-2xl border border-app-border bg-surface p-5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                Empresa
              </p>

              <p className="mt-2 text-xs font-semibold text-foreground">
                {employee.empresa}
              </p>
            </div>

            <div className="rounded-2xl border border-app-border bg-surface p-5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                Departamento
              </p>

              <p className="mt-2 text-xs font-semibold text-foreground">
                {employee.departamento}
              </p>
            </div>

            <div className="rounded-2xl border border-app-border bg-surface p-5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                Cargo
              </p>

              <p className="mt-2 text-xs font-semibold text-foreground">
                {employee.cargo}
              </p>
            </div>

            <div className="rounded-2xl border border-app-border bg-surface p-5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                Admissão
              </p>

              <p className="mt-2 text-xs font-semibold text-foreground">
                {employee.admissao}
              </p>
            </div>
          </section>

          {/* CONTEÚDO */}

          <section
            className="
              grid
              grid-cols-1
              gap-6

              xl:grid-cols-[1.1fr_1fr]
            "
          >
            {/* DADOS PESSOAIS */}

            <div className="rounded-2xl border border-app-border bg-surface p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-foreground">
                  Dados pessoais
                </h2>

                <p className="mt-1 text-[10px] text-muted-light">
                  Informações pessoais e de contato.
                </p>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-x-8
                  gap-y-6

                  sm:grid-cols-2
                "
              >
                <InfoItem
                  label="Nome completo"
                  value={employee.nome}
                />

                <InfoItem
                  label="CPF"
                  value={employee.cpf}
                />

                <InfoItem
                  label="E-mail"
                  value={employee.email}
                />

                <InfoItem
                  label="Telefone"
                  value={employee.telefone}
                />

                <InfoItem
                  label="Data de nascimento"
                  value={employee.nascimento}
                />

                <InfoItem
                  label="Matrícula"
                  value={employee.matricula}
                />
              </div>
            </div>

            {/* DADOS PROFISSIONAIS */}

            <div className="rounded-2xl border border-app-border bg-surface p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-foreground">
                  Dados profissionais
                </h2>

                <p className="mt-1 text-[10px] text-muted-light">
                  Informações do vínculo com a empresa.
                </p>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-x-8
                  gap-y-6

                  sm:grid-cols-2
                "
              >
                <InfoItem
                  label="Empresa"
                  value={employee.empresa}
                />

                <InfoItem
                  label="Departamento"
                  value={employee.departamento}
                />

                <InfoItem
                  label="Cargo"
                  value={employee.cargo}
                />

                <InfoItem
                  label="Gestor"
                  value={employee.gestor}
                />

                <InfoItem
                  label="Data de admissão"
                  value={employee.admissao}
                />

                <InfoItem
                  label="Tipo de contrato"
                  value={employee.tipoContrato}
                />

                <InfoItem
                  label="Salário"
                  value={employee.salario}
                />

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-light">
                    Status
                  </p>

                  <div className="mt-1.5">
                    <StatusBadge
                      status={employee.status}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HISTÓRICO */}

          <section className="mt-6 rounded-2xl border border-app-border bg-surface p-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground">
                Histórico
              </h2>

              <p className="mt-1 text-[10px] text-muted-light">
                Últimas movimentações do funcionário.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />

                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Funcionário admitido
                  </p>

                  <p className="mt-1 text-[10px] text-muted-light">
                    Admitido como Desenvolvedor Backend em{" "}
                    {employee.admissao}.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Cadastro atualizado
                  </p>

                  <p className="mt-1 text-[10px] text-muted-light">
                    Informações profissionais atualizadas recentemente.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}