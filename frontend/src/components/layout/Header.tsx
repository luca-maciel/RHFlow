type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({
  onMenuClick,
}: HeaderProps) {
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
        border-slate-200

        bg-white/90

        px-4

        backdrop-blur

        md:left-[250px]
        md:h-[82px]
        md:justify-end
        md:px-8
      "
    >
      {/* MOBILE */}

      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-xl

            border
            border-slate-200

            bg-white

            text-xl
            text-slate-700

            transition

            hover:bg-slate-50
          "
        >
          ☰
        </button>

        <div className="flex items-center gap-2">
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center

              rounded-lg

              bg-blue-600

              text-[11px]
              font-bold
              text-white
            "
          >
            R
          </div>

          <span className="text-sm font-bold text-slate-900">
            RHFlow
          </span>
        </div>
      </div>

      {/* DESKTOP SEARCH */}

      <div
        className="
          hidden
          h-10
          w-[280px]
          items-center
          gap-2

          rounded-xl

          border
          border-slate-200

          bg-slate-50

          px-3

          lg:flex
        "
      >
        <span className="text-sm text-slate-400">
          ⌕
        </span>

        <input
          type="text"
          placeholder="Pesquisar..."
          className="
            w-full
            border-0
            bg-transparent
            text-xs
            text-slate-900
            outline-none
            placeholder:text-slate-400
          "
        />
      </div>

      {/* DIREITA */}

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="
            relative
            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-xl

            text-lg
            text-slate-500

            transition

            hover:bg-slate-50
            hover:text-slate-900
          "
        >
          ♧

          <span
            className="
              absolute
              right-2
              top-2
              h-2
              w-2
              rounded-full
              bg-blue-600
            "
          />
        </button>

        <div className="flex items-center gap-2">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              bg-blue-600

              text-xs
              font-bold
              text-white
            "
          >
            LF
          </div>

          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-900">
              Lucas
            </p>

            <p className="text-[10px] text-slate-400">
              Administrador
            </p>
          </div>

          <span className="hidden text-xs text-slate-400 sm:block">
            ▾
          </span>
        </div>
      </div>
    </header>
  );
}