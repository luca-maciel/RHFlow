export default function Header() {
  return (
    <header
      className="
        fixed
        right-0
        top-0
        z-30
        flex
        h-[82px]
        items-center
        justify-end
        gap-5
        border-b
        border-slate-200
        bg-white/90
        px-8
        backdrop-blur
        md:left-[250px]
      "
    >
      {/* Busca */}

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

      {/* Notificações */}

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

      {/* Usuário */}

      <div className="flex items-center gap-3">
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

        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-slate-900">
            Lucas
          </p>

          <p className="text-[10px] text-slate-400">
            Administrador
          </p>
        </div>

        <span className="text-xs text-slate-400">
          ▾
        </span>
      </div>
    </header>
  );
}