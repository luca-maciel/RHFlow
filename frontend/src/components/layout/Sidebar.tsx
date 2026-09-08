import { useLocation, useNavigate } from "react-router-dom";
type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type MenuItem = {
  label: string;
  icon: string;
  path: string;
};

const menuItems: MenuItem[] = [
  {
    label: "Início",
    icon: "⌂",
    path: "/home",
  },
  {
    label: "Empresas",
    icon: "▣",
    path: "/empresas",
  },
  {
    label: "Departamentos",
    icon: "◇",
    path: "/departamentos",
  },
  {
    label: "Cargos",
    icon: "▤",
    path: "/cargos",
  },
  {
    label: "Funcionários",
    icon: "♙",
    path: "/funcionarios",
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      {/* OVERLAY MOBILE */}

      <div
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-40
          bg-slate-950/30
          backdrop-blur-[2px]

          transition-opacity
          duration-300

          md:hidden

          ${
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50

          flex
          h-dvh
          w-[280px]
          flex-col

          border-r
          border-slate-200
          bg-white

          shadow-2xl

          transition-transform
          duration-300
          ease-out

          md:z-40
          md:w-[250px]
          md:translate-x-0
          md:shadow-none

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* LOGO */}

        <div className="flex h-[78px] items-center justify-between px-5 md:h-[82px] md:px-7">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-xl

                bg-blue-600

                text-sm
                font-bold
                text-white

                shadow-[0_5px_15px_rgba(37,99,235,0.2)]
              "
            >
              R
            </div>

            <span className="text-lg font-bold tracking-tight text-slate-900">
              RHFlow
            </span>
          </div>

          {/* FECHAR MOBILE */}

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-lg

              text-lg
              text-slate-400

              transition

              hover:bg-slate-100
              hover:text-slate-900

              md:hidden
            "
          >
            ×
          </button>
        </div>

        {/* MENU */}

        <nav className="flex-1 overflow-y-auto px-4 pt-5">
          <p
            className="
              mb-3
              px-3

              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
            "
          >
            Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={`
        flex
        h-11
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        text-left
        text-[13px]
        font-medium
        transition-all
        duration-200

        ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }
      `}
                >
                  <span
                    className={`
          flex
          h-7
          w-7
          items-center
          justify-center
          text-base

          ${isActive ? "text-blue-600" : "text-slate-400"}
        `}
                  >
                    {item.icon}
                  </span>

                  {item.label}
                </button>
              );
            })}
          </div>

          {/* SISTEMA */}

          <p
            className="
              mb-3
              mt-8
              px-3

              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
            "
          >
            Sistema
          </p>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-11
              w-full
              items-center
              gap-3

              rounded-xl

              px-3

              text-left
              text-[13px]
              font-medium
              text-slate-500

              transition-all

              hover:bg-slate-50
              hover:text-slate-900
            "
          >
            <span
              className="
                flex
                h-7
                w-7
                items-center
                justify-center

                text-base
                text-slate-400
              "
            >
              ⚙
            </span>
            Configurações
          </button>
        </nav>

        {/* USUÁRIO */}

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-full

                bg-blue-100

                text-xs
                font-bold
                text-blue-600
              "
            >
              LF
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900">
                Lucas
              </p>

              <p className="truncate text-[10px] text-slate-400">
                Administrador
              </p>
            </div>

            <button
              type="button"
              className="ml-auto text-slate-400 hover:text-slate-700"
            >
              ⋮
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
