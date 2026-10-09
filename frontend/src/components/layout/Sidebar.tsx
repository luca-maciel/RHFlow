
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  House,
  Building2,
  Network,
  BriefcaseBusiness,
  ContactRound,
  Palmtree,
  Users,
  Shield,
  KeyRound,
  Settings,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";


import type { LucideIcon } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type MenuItem = {
  label: string;
  icon: LucideIcon;
  path: string;
  permissions?: string[];
};

const menuItems: MenuItem[] = [
  {
    label: "Início",
    icon: House,
    path: "/home",
  },
  {
    label: "Empresas",
    icon: Building2,
    path: "/empresas",
    permissions: [
      "EMPRESAS_VISUALIZAR",
      "EMPRESAS_GERENCIAR",
    ],
  },
  {
    label: "Departamentos",
    icon: Network,
    path: "/departamentos",
    permissions: [
      "DEPARTAMENTOS_VISUALIZAR",
      "DEPARTAMENTOS_GERENCIAR",
    ],
  },
  {
    label: "Cargos",
    icon: BriefcaseBusiness,
    path: "/cargos",
    permissions: [
      "CARGOS_VISUALIZAR",
      "CARGOS_GERENCIAR",
    ],
  },
  {
    label: "Funcionários",
    icon: ContactRound,
    path: "/funcionarios",
    permissions: [
      "FUNCIONARIOS_VISUALIZAR",
      "FUNCIONARIOS_GERENCIAR",
    ],
  },
  {
    label: "Férias",
    icon: Palmtree,
    path: "/ferias",
    permissions: [
      "FERIAS_VISUALIZAR",
      "FERIAS_SOLICITAR",
      "FERIAS_APROVAR",
      "FERIAS_GERENCIAR",
    ],
  },
];

const adminItems: MenuItem[] = [
  {
    label: "Usuários",
    icon: Users,
    path: "/usuarios",
    permissions: [
      "USUARIOS_VISUALIZAR",
      "USUARIOS_GERENCIAR",
    ],
  },
  {
    label: "Perfis",
    icon: Shield,
    path: "/perfis",
    permissions: [
      "PERFIS_VISUALIZAR",
      "PERFIS_GERENCIAR",
    ],
  },
  {
    label: "Permissões",
    icon: KeyRound,
    path: "/permissoes",
    permissions: [
      "PERMISSOES_VISUALIZAR",
      "PERMISSOES_GERENCIAR",
    ],
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    logout,
    hasPermission,
  } = useAuth();

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  // ==========================================================
  // PERMISSÕES
  // ==========================================================

  const canAccess = (item: MenuItem): boolean => {
    if (!item.permissions?.length) {
      return true;
    }

    return item.permissions.some(hasPermission);
  };

  const visibleMenuItems = menuItems.filter(canAccess);
  const visibleAdminItems = adminItems.filter(canAccess);

  // ==========================================================
  // NAVEGAÇÃO
  // ==========================================================

  const isActive = (path: string): boolean =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

  const goTo = (path: string) => {
    navigate(path);
    onClose();
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    onClose();
    setUserMenuOpen(false);

    navigate("/auth", {
      replace: true,
    });
  };

  // ==========================================================
  // USUÁRIO
  // ==========================================================

  const userName = user?.nome || "Usuário";

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const userRole =
    user?.perfis?.join(", ") || "Sem perfil";

  // ==========================================================
  // ESTILOS
  // ==========================================================

  const itemClass = (active: boolean) =>
    `flex h-11 w-full items-center gap-3 rounded-xl
     px-3 text-left text-[13px] font-medium
     transition-all duration-200
     ${
       active
         ? "bg-icon-surface text-blue-600"
         : "text-muted hover:bg-surface-hover hover:text-foreground"
     }`;

  const iconClass = (active: boolean) =>
    `flex h-7 w-7 shrink-0 items-center
     justify-center
     ${
       active
         ? "text-blue-600"
         : "text-muted-light"
     }`;

  // ==========================================================
  // RENDERIZAR ITEM
  // ==========================================================

  const renderItem = (item: MenuItem) => {
    const active = isActive(item.path);
    const Icon = item.icon;

    return (
      <button
        key={item.path}
        type="button"
        onClick={() => goTo(item.path)}
        aria-current={active ? "page" : undefined}
        className={itemClass(active)}
      >
        <span className={iconClass(active)}>
          <Icon
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>

        <span className="truncate">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* ================================================
          OVERLAY MOBILE
      ================================================= */}

      <div
        onClick={onClose}
        aria-hidden="true"
        className={`
          fixed inset-0 z-40 bg-black/30
          backdrop-blur-[2px]
          transition-opacity duration-300
          md:hidden
          ${
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* ================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-dvh w-[280px] flex-col
          border-r border-app-border
          bg-surface shadow-2xl
          transition-transform duration-300 ease-out
          md:z-40 md:w-[250px]
          md:translate-x-0 md:shadow-none
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ============================================
            LOGO
        ============================================= */}

        <div
          className="
            flex h-[78px] shrink-0
            items-center justify-between
            px-5 md:h-[82px] md:px-7
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-blue-600
                text-sm font-bold text-white
                shadow-[0_5px_15px_rgba(37,99,235,0.2)]
              "
            >
              R
            </div>

            <span
              className="
                text-lg font-bold
                tracking-tight text-foreground
              "
            >
              RHFlow
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg text-muted-light
              transition
              hover:bg-surface-hover
              hover:text-foreground
              md:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* ============================================
            NAVEGAÇÃO
        ============================================= */}

        <nav
          aria-label="Navegação principal"
          className="
            min-h-0 flex-1
            overflow-y-auto
            px-4 pb-5 pt-5
          "
        >
          {/* MENU */}

          <p
            className="
              mb-3 px-3
              text-[10px] font-semibold
              uppercase tracking-wider
              text-muted-light
            "
          >
            Menu
          </p>

          <div className="space-y-1">
            {visibleMenuItems.map(renderItem)}
          </div>

          {/* ADMINISTRAÇÃO */}

          {visibleAdminItems.length > 0 && (
            <>
              <p
                className="
                  mb-3 mt-8 px-3
                  text-[10px] font-semibold
                  uppercase tracking-wider
                  text-muted-light
                "
              >
                Administração
              </p>

              <div className="space-y-1">
                {visibleAdminItems.map(renderItem)}
              </div>
            </>
          )}

          {/* SISTEMA */}

          <p
            className="
              mb-3 mt-8 px-3
              text-[10px] font-semibold
              uppercase tracking-wider
              text-muted-light
            "
          >
            Sistema
          </p>

          {/*
            Ative a navegação quando a rota
            /configuracoes estiver implementada.
          */}

          <div
            className="
              flex h-11 w-full
              items-center gap-3
              rounded-xl px-3
              text-left text-[13px]
              font-medium text-muted-light
              opacity-60
            "
            title="Em desenvolvimento"
          >
            <span
              className="
                flex h-7 w-7
                shrink-0 items-center
                justify-center
              "
            >
              <Settings
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>

            Configurações
          </div>
        </nav>

        {/* ============================================
            USUÁRIO
        ============================================= */}

        <div
          className="
            shrink-0
            border-t border-app-border
            p-4
          "
        >
          {/* MENU DO USUÁRIO */}

          {userMenuOpen && (
            <div
              className="
                mb-2 rounded-xl
                border border-app-border
                bg-background p-1
                shadow-lg
              "
            >
              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex h-10 w-full
                  items-center gap-3
                  rounded-lg px-3
                  text-left text-xs
                  font-medium text-red-500
                  transition-colors
                  hover:bg-red-500/10
                "
              >
                <LogOut
                  size={17}
                  strokeWidth={1.8}
                />

                Sair da conta
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setUserMenuOpen((previous) => !previous)
            }
            aria-expanded={userMenuOpen}
            aria-label="Abrir opções da conta"
            className="
              flex w-full items-center
              gap-3 rounded-xl p-2
              text-left transition-colors
              hover:bg-surface-hover
            "
          >
            {/* AVATAR */}

            <div
              className="
                flex h-9 w-9
                shrink-0 items-center
                justify-center
                rounded-full bg-blue-100
                text-xs font-bold
                text-blue-600
              "
            >
              {initials}
            </div>

            {/* INFORMAÇÕES */}

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate text-xs
                  font-semibold text-foreground
                "
              >
                {userName}
              </p>

              <p
                className="
                  truncate text-[10px]
                  text-muted-light
                "
                title={userRole}
              >
                {userRole}
              </p>
            </div>

            {/* MENU */}

            <ChevronDown
              size={16}
              strokeWidth={1.8}
              className={`
                shrink-0 text-muted-light
                transition-transform duration-200
                ${
                  userMenuOpen
                    ? "rotate-180"
                    : ""
                }
              `}
              aria-hidden="true"
            />
          </button>
        </div>
      </aside>
    </>
  );
}