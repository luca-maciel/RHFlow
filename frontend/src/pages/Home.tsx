import { useEffect, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import StatCard from "../components/dashboard/StatCard";
import DashboardCard from "../components/dashboard/DashboardCard";
import employeeService from "../services/employeeService";


export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalAtivos, setTotalAtivos] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const total = await employeeService.countByStatus("ATIVO");

        setTotalAtivos(total);
      } catch (error) {
        console.error(
          "Erro ao carregar funcionários ativos:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Header
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main
        className="
          min-h-screen
          pt-[72px]
          md:ml-[250px]
          md:pt-[82px]
          flex
          justify-center
        "
      >
        <div
          className="
            mx-auto
            max-w-[1400px]

            p-4

            sm:p-6
            lg:p-8
          "
        >
          {/* BOAS-VINDAS */}

          <section className="mb-6 md:mb-8">
            <p className="mb-1 text-xs font-medium text-blue-600">
              Visão geral
            </p>

            <h1
              className="
                text-[24px]
                font-bold
                tracking-tight
                text-foreground

                md:text-[28px]
              "
            >
              Bom dia, Lucas 👋
            </h1>

            <p className="mt-1 text-xs text-muted md:text-sm">
              Aqui está um resumo do RH hoje.
            </p>
          </section>

          {/* CARDS */}

          <section
            className="
              mb-6

              grid
              grid-cols-1
              gap-3

              sm:grid-cols-2
              sm:gap-4

              xl:grid-cols-4
            "
          >
            <StatCard
              title="Funcionários ativos"
              value={totalAtivos.toString()}
              description="Descrição adicional sobre os funcionários ativos."
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

          {/* CONTEÚDO */}

          <section
            className="
              grid
              grid-cols-1
              gap-4

              md:gap-6

              xl:grid-cols-[1.5fr_1fr]
            "
          >
            <DashboardCard title="Visão geral dos funcionários">
              <div className="overflow-x-auto">
                <div className="flex h-[220px] min-w-[500px] items-end justify-between gap-3 px-2 pb-2 md:h-[260px]">
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
                            bg-dashboard-surface

                            transition-all

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
              </div>
            </DashboardCard>

            <DashboardCard title="Próximos eventos">
              <div className="space-y-4">
                {[
                  {
                    icon: "🎂",
                    title: "Aniversário de João",
                    subtitle: "Hoje",
                    badge: "Hoje",
                  },
                  {
                    icon: "🏖",
                    title: "Férias de Maria",
                    subtitle: "02 de setembro",
                    badge: "4 dias",
                  },
                  {
                    icon: "👤",
                    title: "Nova admissão",
                    subtitle: "05 de setembro",
                    badge: "7 dias",
                  },
                ].map((event) => (
                  <div
                    key={event.title}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-icon-surface
                        text-sm
                      "
                    >
                      {event.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {event.title}
                      </p>

                      <p className="mt-0.5 text-[10px] text-muted-light">
                        {event.subtitle}
                      </p>
                    </div>

                    <span className="text-[10px] text-muted-light">
                      {event.badge}
                    </span>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </section>
        </div>
      </main>
    </div>
  );
}