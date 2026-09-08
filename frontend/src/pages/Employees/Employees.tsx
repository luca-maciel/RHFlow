import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

type EmployeeStatus = "ATIVO" | "FÉRIAS" | "AFASTADO" | "INATIVO";

type Employee = {
  id: string;
  matricula: string;
  nome: string;
  email: string;
  empresa: string;
  departamento: string;
  cargo: string;
  admissao: string;
  status: EmployeeStatus;
};

const employeesMock: Employee[] = [
  {
    id: "1",
    matricula: "RH001",
    nome: "João da Silva",
    email: "joao@rhflow.com",
    empresa: "RHFlow Tecnologia",
    departamento: "Tecnologia da Informação",
    cargo: "Desenvolvedor Backend",
    admissao: "10/01/2025",
    status: "ATIVO",
  },
  {
    id: "2",
    matricula: "RH002",
    nome: "Mariana Souza",
    email: "mariana@rhflow.com",
    empresa: "RHFlow Tecnologia",
    departamento: "Recursos Humanos",
    cargo: "Analista de RH",
    admissao: "22/03/2025",
    status: "ATIVO",
  },
  {
    id: "3",
    matricula: "RH003",
    nome: "Carlos Henrique",
    email: "carlos@rhflow.com",
    empresa: "Inova Sistemas",
    departamento: "Financeiro",
    cargo: "Gerente Financeiro",
    admissao: "15/08/2024",
    status: "FÉRIAS",
  },
  {
    id: "4",
    matricula: "RH004",
    nome: "Ana Beatriz",
    email: "ana@rhflow.com",
    empresa: "RHFlow Tecnologia",
    departamento: "Tecnologia da Informação",
    cargo: "Desenvolvedor Frontend",
    admissao: "05/11/2025",
    status: "AFASTADO",
  },
  {
    id: "5",
    matricula: "RH005",
    nome: "Ricardo Lima",
    email: "ricardo@rhflow.com",
    empresa: "Tech Solutions",
    departamento: "Marketing",
    cargo: "Analista de Marketing",
    admissao: "17/07/2024",
    status: "INATIVO",
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
  const styles: Record<EmployeeStatus, string> = {
    ATIVO: "bg-emerald-50 text-emerald-600",
    FÉRIAS: "bg-blue-50 text-blue-600",
    AFASTADO: "bg-amber-50 text-amber-600",
    INATIVO: "bg-slate-100 text-slate-500",
  };

  const dotStyles: Record<EmployeeStatus, string> = {
    ATIVO: "bg-emerald-500",
    FÉRIAS: "bg-blue-500",
    AFASTADO: "bg-amber-500",
    INATIVO: "bg-slate-400",
  };

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
        ${styles[status]}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${dotStyles[status]}
        `}
      />

      {status}
    </span>
  );
}

export default function Employees() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("TODAS");
  const [department, setDepartment] = useState("TODOS");
  const [position, setPosition] = useState("TODOS");
  const [status, setStatus] = useState("TODOS");

  const companies = useMemo(
    () => [...new Set(employeesMock.map((item) => item.empresa))],
    [],
  );

  const departments = useMemo(
    () => [...new Set(employeesMock.map((item) => item.departamento))],
    [],
  );

  const positions = useMemo(
    () => [...new Set(employeesMock.map((item) => item.cargo))],
    [],
  );

  const filteredEmployees = employeesMock.filter((employee) => {
    const term = search.toLowerCase();

    const matchesSearch =
      employee.nome.toLowerCase().includes(term) ||
      employee.email.toLowerCase().includes(term) ||
      employee.matricula.toLowerCase().includes(term) ||
      employee.cargo.toLowerCase().includes(term);

    const matchesCompany = company === "TODAS" || employee.empresa === company;

    const matchesDepartment =
      department === "TODOS" || employee.departamento === department;

    const matchesPosition = position === "TODOS" || employee.cargo === position;

    const matchesStatus = status === "TODOS" || employee.status === status;

    return (
      matchesSearch &&
      matchesCompany &&
      matchesDepartment &&
      matchesPosition &&
      matchesStatus
    );
  });

  function clearFilters() {
    setSearch("");
    setCompany("TODAS");
    setDepartment("TODOS");
    setPosition("TODOS");
    setStatus("TODOS");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Header onMenuClick={() => setSidebarOpen(true)} />

      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px] flex flex-col items-center">
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {/* CABEÇALHO */}

          <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-blue-600">
                Gestão de pessoas
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
                Funcionários
              </h1>

              <p className="mt-1 text-xs text-slate-500 md:text-sm">
                Gerencie os colaboradores cadastrados no RHFlow.
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
              <span className="text-lg leading-none">+</span>
              Novo funcionário
            </button>
          </section>

          {/* CARD PRINCIPAL */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* TOOLBAR */}

            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                {/* Busca */}

                <div className="relative w-full lg:max-w-[380px]">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ⌕
                  </span>

                  <input
                    type="text"
                    placeholder="Pesquisar funcionário..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
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

                {/* Filtros */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <select
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-600"
                  >
                    <option value="TODAS">Todas as empresas</option>

                    {companies.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <select
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-600"
                  >
                    <option value="TODOS">Todos os departamentos</option>

                    {departments.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <select
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-600"
                  >
                    <option value="TODOS">Todos os cargos</option>

                    {positions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-600"
                  >
                    <option value="TODOS">Todos os status</option>

                    <option value="ATIVO">Ativo</option>

                    <option value="FÉRIAS">Férias</option>

                    <option value="AFASTADO">Afastado</option>

                    <option value="INATIVO">Inativo</option>
                  </select>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      h-10
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      text-xs
                      font-semibold
                      text-slate-500
                      transition
                      hover:bg-slate-50
                      hover:text-slate-900
                    "
                  >
                    Limpar filtros
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    {filteredEmployees.length} funcionários encontrados
                  </p>
                </div>
              </div>
            </div>

            {/* DESKTOP */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Funcionário
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Matrícula
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Cargo
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Departamento
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Admissão
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
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600">
                            {getInitials(employee.nome)}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900">
                              {employee.nome}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-slate-500">
                        {employee.matricula}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {employee.cargo}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {employee.departamento}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {employee.admissao}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={employee.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigate(`/funcionarios/${employee.id}`);
                            }}
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
                            Visualizar
                          </button>

                          <button
                            type="button"
                            className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-100"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            ⋮
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}

            <div className="space-y-3 p-4 md:hidden flex flex-col gap-5">
              {filteredEmployees.map((employee) => (
                <article
                  key={employee.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  {/* Header */}

                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600">
                        {getInitials(employee.nome)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {employee.nome}
                        </h3>

                        <p className="truncate text-[10px] text-slate-400">
                          {employee.email}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={employee.status} />
                  </div>

                  {/* Dados */}

                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Matrícula
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {employee.matricula}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Admissão
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {employee.admissao}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Cargo
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {employee.cargo}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Departamento
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {employee.departamento}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Empresa
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {employee.empresa}
                      </p>
                    </div>
                  </div>

                  {/* Botões */}

                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/funcionarios/${employee.id}`);
                      }}
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
              ))}

              {/* EMPTY */}

              {filteredEmployees.length === 0 && (
                <div className="py-14 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    ⌕
                  </div>

                  <p className="text-xs font-semibold text-slate-900">
                    Nenhum funcionário encontrado
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    Tente alterar os filtros utilizados.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-3 text-[10px] font-semibold text-blue-600"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
