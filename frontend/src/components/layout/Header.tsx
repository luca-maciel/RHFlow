import { useTheme } from "../../contexts/ThemeContext";

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

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
      {/* =====================================================
          MOBILE - MENU + BRAND
      ===================================================== */}

      <div className="flex min-w-0 items-center gap-3 md:hidden">
        {/* Menu */}
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

        {/* Brand */}
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

      {/* =====================================================
          DESKTOP - SEARCH
      ===================================================== */}

      <div
        className="
          hidden
          h-10
          w-[240px]
          items-center
          gap-2

          rounded-xl
          border
          border-app-border
          bg-surface-secondary

          px-3

          transition
          duration-200

          focus-within:border-primary
          focus-within:bg-surface
          focus-within:ring-[3px]
          focus-within:ring-primary/10

          lg:flex
          xl:w-[300px]
        "
      >
        <span className="shrink-0 text-sm text-muted-light">
          ⌕
        </span>

        <input
          type="text"
          placeholder="Pesquisar..."
          className="
            min-w-0
            w-full

            border-0
            bg-transparent

            text-xs
            text-foreground

            outline-none

            placeholder:text-muted-light
          "
        />
      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

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

        {/* NOTIFICATIONS */}
        <button
          type="button"
          aria-label="Notificações"
          className="
            relative
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
          ♧

          <span
            className="
              absolute
              right-[9px]
              top-[8px]

              h-2
              w-2

              rounded-full
              bg-primary

              ring-2
              ring-surface
            "
          />
        </button>

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
        <button
          type="button"
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
          {/* Avatar */}
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
            LF
          </div>

          {/* User info */}
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
              Lucas
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
              Administrador
            </p>
          </div>

          {/* Arrow */}
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
      </div>
    </header>
  );
}