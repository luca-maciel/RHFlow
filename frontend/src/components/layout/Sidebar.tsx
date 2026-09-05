import { useState } from "react";

type MenuItem = {
  label: string;
  icon: string;
};

const menuItems: MenuItem[] = [
  {
    label: "Início",
    icon: "⌂",
  },
  {
    label: "Pessoas",
    icon: "♙",
  },
  {
    label: "Recrutamento",
    icon: "▣",
  },
  {
    label: "Férias",
    icon: "☼",
  },
  {
    label: "Relatórios",
    icon: "▥",
  },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("Início");

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        z-40
        flex
        h-screen
        w-[250px]
        flex-col
        border-r
        border-slate-200
        bg-white
      "
    >
      {/* Logo */}

      <div className="flex h-[82px] items-center px-7">
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
      </div>

      {/* Menu */}

      <nav className="flex-1 px-4 pt-5">
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
            const isActive = activeItem === item.label;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveItem(item.label)}
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

                    ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400"
                    }
                  `}
                >
                  {item.icon}
                </span>

                {item.label}
              </button>
            );
          })}
        </div>

        {/* Sistema */}

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
            duration-200

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

      {/* Usuário */}

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
  );
}