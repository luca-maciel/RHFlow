import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import StatCard from "../components/dashboard/StatCard";
import DashboardCard from "../components/dashboard/DashboardCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <Header />

      <main
        className="
          items-center
          min-h-screen
          pt-[82px]
          md:ml-[250px]
          flex
          justify-center
        "
      >
        <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
          {/* ==================================================
              BOAS-VINDAS
          ================================================== */}

          <section className="mb-8">
            <p className="mb-1 text-xs font-medium text-blue-600">
              Visão geral
            </p>

            <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
              Bom dia, Lucas 👋
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Aqui está um resumo do RH hoje.
            </p>
          </section>

              {/* ESTATÍSTICAS */}

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
            <StatCard
              title="Funcionários ativos"
              value="248"
              description="↑ 4 novos este mês"
              icon="♙"
            />

            <StatCard
              title="Férias em andamento"
              value="12"
              description="3 retornam esta semana"
              icon="☼"
            />

            <StatCard
              title="Novas admissões"
              value="8"
              description="Este mês"
              icon="＋"
            />

            <StatCard
              title="Pendências"
              value="5"
              description="Precisam da sua atenção"
              icon="!"
            />
          </section>

          {/* ==================================================
              CONTEÚDO
          ================================================== */}

          <section
            className="
              grid
              grid-cols-1
              gap-6

              xl:grid-cols-[1.5fr_1fr]
            "
          >
            {/* Funcionários */}

            <DashboardCard title="Visão geral dos funcionários">
              <div className="flex h-[260px] items-end justify-between gap-3 px-2 pb-2">
                {[42, 58, 48, 68, 55, 72, 82, 65, 88, 76, 94, 86].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex h-full flex-1 items-end"
                    >
                      <div
                        className="
                          w-full
                          rounded-t-lg
                          bg-blue-100

                          transition-all
                          duration-300

                          hover:bg-blue-600
                        "
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>
                  )
                )}
              </div>

              <div className="mt-4 flex justify-between text-[9px] text-slate-400">
                <span>Jan</span>
                <span>Fev</span>
                <span>Mar</span>
                <span>Abr</span>
                <span>Mai</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Ago</span>
                <span>Set</span>
                <span>Out</span>
                <span>Nov</span>
                <span>Dez</span>
              </div>
            </DashboardCard>

            {/* Próximos eventos */}

            <DashboardCard title="Próximos eventos">
              <div className="space-y-4">
                {/* Evento */}

                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-sm
                    "
                  >
                    🎂
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      Aniversário de João
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Hoje
                    </p>
                  </div>

                  <span className="text-[10px] font-medium text-blue-600">
                    Hoje
                  </span>
                </div>

                {/* Evento */}

                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-50
                      text-sm
                    "
                  >
                    🏖
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      Férias de Maria
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      02 de setembro
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    4 dias
                  </span>
                </div>

                {/* Evento */}

                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-violet-50
                      text-sm
                    "
                  >
                    👤
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      Nova admissão
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      05 de setembro
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    7 dias
                  </span>
                </div>

                {/* Evento */}

                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-amber-50
                      text-sm
                    "
                  >
                    📄
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      Documento pendente
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Carlos Henrique
                    </p>
                  </div>

                  <span className="text-[10px] font-medium text-amber-500">
                    Pendente
                  </span>
                </div>
              </div>
            </DashboardCard>
          </section>

          {/* ==================================================
              ATALHOS
          ================================================== */}

          <section className="mt-6">
            <DashboardCard title="Acesso rápido">
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3

                  sm:grid-cols-4
                "
              >
                {[
                  {
                    icon: "＋",
                    title: "Novo funcionário",
                  },
                  {
                    icon: "♙",
                    title: "Funcionários",
                  },
                  {
                    icon: "☼",
                    title: "Solicitações de férias",
                  },
                  {
                    icon: "▥",
                    title: "Relatórios",
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="
                      flex
                      min-h-[90px]
                      flex-col
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-100
                      bg-slate-50
                      text-center

                      transition-all
                      duration-200

                      hover:-translate-y-0.5
                      hover:border-blue-100
                      hover:bg-blue-50
                    "
                  >
                    <span className="text-lg text-blue-600">
                      {item.icon}
                    </span>

                    <span className="text-[10px] font-medium text-slate-600">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </DashboardCard>
          </section>
        </div>
      </main>
    </div>
  );
}