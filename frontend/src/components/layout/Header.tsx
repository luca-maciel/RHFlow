import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, FileText, LogOut, Palmtree } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";

type HeaderProps = {
  onMenuClick: () => void;
};

type PendingSummary = {
  vacations: number;
  documents: number;
};

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pending, setPending] = useState<PendingSummary>({
    vacations: 0,
    documents: 0,
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const canCheckVacations =
    hasPermission("FERIAS_APROVAR") ||
    hasPermission("FERIAS_GERENCIAR") ||
    hasPermission("FERIAS_VISUALIZAR");

  const canCheckDocuments =
    hasPermission("DOCUMENTOS_GERENCIAR") ||
    hasPermission("DOCUMENTOS_VISUALIZAR");

  useEffect(() => {
    let active = true;

    async function loadPending() {
      let vacations = 0;
      let documents = 0;

      await Promise.allSettled([
        canCheckVacations
          ? api
              .get<Array<{ status?: string }>>("/ferias")
              .then(({ data }) => {
                vacations = data.filter(
                  (item) => item.status === "SOLICITADA",
                ).length;
              })
          : Promise.resolve(),
        canCheckDocuments
          ? api
              .get<Array<{ status?: string }>>("/solicitacoes-documento")
              .then(({ data }) => {
                documents = data.filter(
                  (item) => item.status === "PENDENTE",
                ).length;
              })
          : Promise.resolve(),
      ]);

      if (active) {
        setPending({ vacations, documents });
      }
    }

    void loadPending();

    return () => {
      active = false;
    };
  }, [canCheckVacations, canCheckDocuments]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/auth", { replace: true });
  };

  const totalPending = pending.vacations + pending.documents;

  const displayName = user?.nome?.trim() || "Usuário";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const roleLabel =
    user?.perfis && user.perfis.length > 0
      ? user.perfis
          .map(
            (role) =>
              role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
          )
          .join(", ")
      : "Colaborador";

  return (
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-30

        flex
        h-[72px]
        items-center
        justify-between

        border-b
        border-app-border
        bg-surface/90

        px-4
        backdrop-blur-xl

        transition-colors
        duration-200

        md:left-[250px]
        md:h-[82px]
        md:px-6

        lg:px-8
      "
    >
      {/* MOBILE - MENU + BRAND */}
      <div className="flex min-w-0 items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-xl
            border
            border-app-border
            bg-surface-secondary

            text-xl
            text-foreground

            transition
            duration-200

            hover:bg-surface-hover
            active:scale-95
          "
        >
          ☰
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center

              rounded-lg
              bg-primary

              text-[11px]
              font-bold
              text-white

              shadow-sm
              shadow-blue-500/20
            "
          >
            R
          </div>

          <span
            className="
              hidden
              truncate
              text-sm
              font-bold
              text-foreground

              min-[390px]:block
            "
          >
            RHFlow
          </span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
        {/* THEME */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark"
              ? "Ativar tema claro"
              : "Ativar tema escuro"
          }
          title={
            theme === "dark"
              ? "Tema claro"
              : "Tema escuro"
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-xl

            text-lg
            text-muted

            transition
            duration-200

            hover:bg-surface-hover
            hover:text-foreground

            active:scale-95
          "
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>

        {/* NOTIFICATIONS POPOVER */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            aria-label="Notificações e pendências"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((prev) => !prev)}
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center

              rounded-xl

              text-muted

              transition
              duration-200

              hover:bg-surface-hover
              hover:text-foreground

              active:scale-95
            "
          >
            <Bell size={18} strokeWidth={1.9} />

            {totalPending > 0 && (
              <span
                className="
                  absolute
                  right-[9px]
                  top-[9px]

                  h-2
                  w-2

                  rounded-full
                  bg-primary

                  ring-2
                  ring-surface
                "
              />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-app-border bg-surface p-3 shadow-2xl">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-semibold text-foreground">
                  Pendências do RH
                </p>
                <span className="rounded-full bg-icon-surface px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {totalPending}
                </span>
              </div>

              {totalPending === 0 ? (
                <p className="rounded-xl bg-surface-secondary px-3 py-4 text-center text-xs text-muted">
                  Nenhuma solicitação pendente no momento.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {pending.vacations > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate("/ferias");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl bg-surface-secondary p-2.5 text-left transition hover:bg-surface-hover"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-icon-surface text-blue-600">
                        <Palmtree size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground">
                          {pending.vacations}{" "}
                          {pending.vacations === 1
                            ? "solicitação de férias"
                            : "solicitações de férias"}
                        </p>
                        <p className="text-[10px] text-muted">
                          Aguardando análise
                        </p>
                      </div>
                    </button>
                  )}

                  {pending.documents > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate("/documentos");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl bg-surface-secondary p-2.5 text-left transition hover:bg-surface-hover"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-icon-surface text-blue-600">
                        <FileText size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground">
                          {pending.documents}{" "}
                          {pending.documents === 1
                            ? "documento solicitado"
                            : "documentos solicitados"}
                        </p>
                        <p className="text-[10px] text-muted">
                          Aguardando emissão
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div
          className="
            mx-1
            hidden
            h-7
            w-px
            bg-app-border

            sm:block
          "
        />

        {/* USER */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="
              flex
              min-w-0
              items-center
              gap-2

              rounded-xl

              p-1
              sm:pr-2

              transition
              duration-200

              hover:bg-surface-hover
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-full
                bg-primary

                text-xs
                font-bold
                text-white

                shadow-sm
                shadow-blue-500/20
              "
            >
              {initials}
            </div>

            <div className="hidden min-w-0 text-left lg:block">
              <p
                className="
                  max-w-[120px]
                  truncate

                  text-xs
                  font-semibold
                  text-foreground
                "
              >
                {displayName}
              </p>

              <p
                className="
                  mt-0.5
                  max-w-[120px]
                  truncate

                  text-[10px]
                  text-muted
                "
              >
                {roleLabel}
              </p>
            </div>

            <span
              className="
                hidden
                text-[10px]
                text-muted-light

                lg:block
              "
            >
              ▾
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-app-border bg-surface p-1.5 shadow-2xl">
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-xs font-medium text-red-500 transition hover:bg-red-500/10"
              >
                <LogOut size={15} />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}