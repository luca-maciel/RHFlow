import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

type Company = {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  funcionarios: number;
  status: "ATIVA" | "INATIVA";
};

const companiesMock: Company[] = [
  {
    id: "1",
    nome: "RHFlow Tecnologia",
    cnpj: "12.345.678/0001-90",
    cidade: "Recife",
    estado: "PE",
    funcionarios: 84,
    status: "ATIVA",
  },
  {
    id: "2",
    nome: "Inova Sistemas",
    cnpj: "98.765.432/0001-10",
    cidade: "Arcoverde",
    estado: "PE",
    funcionarios: 32,
    status: "ATIVA",
  },
  {
    id: "3",
    nome: "Tech Solutions",
    cnpj: "45.123.789/0001-01",
    cidade: "Caruaru",
    estado: "PE",
    funcionarios: 18,
    status: "INATIVA",
  },
];

function StatusBadge({ status }: { status: "ATIVA" | "INATIVA" }) {
  const active = status === "ATIVA";

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

          ${active ? "bg-emerald-500" : "bg-slate-400"}
        `}
      />

      {active ? "Ativa" : "Inativa"}
    </span>
  );
}

export default function Companies() {
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredCompanies = companiesMock.filter((company) =>
    company.nome.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Header onMenuClick={() => setSidebarOpen(true)} />

      <main className="min-h-screen pt-[82px] md:ml-[250px] flex justify-center">
        <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
          {/* Cabeçalho */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-blue-600">
                Organização
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">
                Empresas
              </h1>

              <p className="mt-1 text-xs text-slate-500 md:text-sm">
                Gerencie as empresas cadastradas no RHFlow.
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
              Nova empresa
            </button>
          </div>
          <br />

          {/* Card principal */}

          <section className="rounded-2xl border border-slate-200 bg-white">
            {/* Barra de ferramentas */}

            <div
              className="
                flex
                flex-col
                gap-4
                border-b
                border-slate-100
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="relative w-full sm:max-w-[320px]">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Pesquisar empresa..."
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

              <p className="text-[11px] text-slate-400">
                {filteredCompanies.length} empresas encontradas
              </p>
            </div>

            {/* Tabela */}

            {/* DESKTOP / TABLET */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Empresa
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      CNPJ
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Localização
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
                  {filteredCompanies.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                            {company.nome.charAt(0)}
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              {company.nome}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              ID #{company.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {company.cnpj}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {company.cidade} - {company.estado}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {company.funcionarios}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={company.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="space-y-3 p-4 md:hidden flex flex-col gap-5">
              {filteredCompanies.map((company) => (
                <article
                  key={company.id}
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-sm
                "
                >
                  <div className="mb-4 flex items-start justify-between gap-5">
                    <div className="flex min-w-0 items-center gap-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                        {company.nome.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {company.nome}
                        </h3>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          ID #{company.id}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={company.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        CNPJ
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {company.cnpj}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Funcionários
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {company.funcionarios}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Localização
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {company.cidade} - {company.estado}
                      </p>
                    </div>
                  </div>

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
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
