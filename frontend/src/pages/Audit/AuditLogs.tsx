import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import auditService, { type AuditEvent } from "../../services/auditService";

function formatDateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AuditLogs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("TODAS");

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");
      const data = await auditService.findRecent();
      setEvents(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(String(err.response.data.message));
      } else {
        setError("Não foi possível carregar os registros de auditoria.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  const entities = useMemo(() => {
    const unique = new Set(events.map((e) => e.entidade));
    return ["TODAS", ...Array.from(unique)];
  }, [events]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesEntity =
        entityFilter === "TODAS" || event.entidade === entityFilter;
      const matchesQuery =
        !q ||
        [
          event.acao,
          event.entidade,
          event.usuarioNome,
          event.descricao,
          event.entidadeId,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesEntity && matchesQuery;
    });
  }, [events, search, entityFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px]">
        <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
          <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-primary">
                Administração e conformidade
              </p>
              <h1 className="text-2xl font-bold text-foreground md:text-[28px]">
                Auditoria
              </h1>
              <p className="mt-1 text-xs text-muted">
                Histórico de operações relevantes registradas no MongoDB.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadEvents()}
              disabled={loading}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-app-border bg-surface px-4 text-xs font-semibold text-foreground transition hover:bg-surface-hover disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Atualizar logs
            </button>
          </section>

          {error && (
            <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-app-border bg-surface p-4">
              <p className="text-xs text-danger">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-app-border bg-surface">
            <div className="flex flex-col gap-3 border-b border-app-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="relative w-full max-w-[420px]">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar por ação, usuário ou descrição..."
                  className="h-10 w-full rounded-xl border border-app-border bg-background pl-10 pr-4 text-xs text-foreground outline-none transition-colors placeholder:text-muted-light focus:border-primary"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {entities.map((ent) => (
                  <button
                    key={ent}
                    type="button"
                    onClick={() => setEntityFilter(ent)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                      entityFilter === ent
                        ? "bg-icon-surface text-primary"
                        : "text-muted hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {ent === "TODAS" ? "Todas entidades" : ent}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-muted">
                Carregando eventos de auditoria...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-icon-surface text-muted">
                  <ShieldCheck size={19} />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  Nenhum evento registrado
                </p>
                <p className="mt-1 text-[10px] text-muted">
                  As operações auditáveis realizadas no sistema aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-app-border bg-background/70">
                      <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                        Data / Hora
                      </th>
                      <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                        Ação
                      </th>
                      <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                        Entidade
                      </th>
                      <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                        Responsável
                      </th>
                      <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                        Descrição
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b border-app-border transition-colors last:border-0 hover:bg-background/70"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-muted">
                          {formatDateTime(event.dataHora)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-icon-surface px-2.5 py-1 text-[10px] font-semibold text-primary">
                            {event.acao}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-foreground">
                          {event.entidade}
                        </td>
                        <td className="px-5 py-4 text-xs text-foreground">
                          {event.usuarioNome}
                        </td>
                        <td className="px-5 py-4 text-xs text-muted">
                          {event.descricao}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}