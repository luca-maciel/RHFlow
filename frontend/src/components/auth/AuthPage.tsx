import "../../index.css";
import { useState } from "react";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  // ==========================================================
  // LOGIN
  // ==========================================================

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // ==========================================================
  // REGISTRO
  // ==========================================================

  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleLogin = (event: any) => {
    event.preventDefault();

    console.log("Login:", {
      email: loginEmail,
      password: loginPassword,
    });

    // Futuramente:
    // POST /auth/login
  };

  // ==========================================================
  // REGISTRO
  // ==========================================================

  const handleRegister = (event: any) => {
    event.preventDefault();

    if (registerPassword !== confirmPassword) {
      console.log("As senhas não coincidem.");
      return;
    }

    console.log("Registro:", {
      name,
      email: registerEmail,
      password: registerPassword,
    });

    // Futuramente:
    // POST /auth/register
  };

  // ==========================================================
  // TROCAR MODO
  // ==========================================================

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
  };

  return (
    <main className="min-h-screen bg-slate-50 md:flex md:items-center md:justify-center md:p-10">
      {/* ======================================================
          CONTAINER PRINCIPAL
      ======================================================= */}

      <div
        className="
          relative
          min-h-screen
          w-full
          overflow-hidden
          bg-white

          md:h-[720px]
          md:min-h-0
          md:max-w-[1080px]
          md:rounded-[24px]

          md:shadow-[0_25px_70px_rgba(15,23,42,0.12),0_5px_20px_rgba(15,23,42,0.05)]
        "
      >
        {/* ====================================================
            HEADER MOBILE
        ===================================================== */}

        <div
          className="
            absolute
            left-0
            top-0
            z-30
            flex
            h-[155px]
            w-full
            items-center
            justify-center
            overflow-hidden
            rounded-b-[48px]

            bg-gradient-to-br
            from-blue-600
            via-blue-700
            to-blue-800

            md:hidden
          "
        >
          {/* Decoração */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-52
              w-52
              rounded-full
              bg-white/5
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              -left-32
              h-64
              w-64
              rounded-full
              bg-slate-900/10
            "
          />

          {/* Marca */}

          <div className="relative z-10 flex items-center gap-2.5 text-xl font-bold text-white">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                border
                border-white/15
                bg-white/15
                backdrop-blur
              "
            >
              R
            </div>

            <span>RHFlow</span>
          </div>
        </div>

        {/* ====================================================
            PAINEL AZUL — LOGIN DESKTOP
        ===================================================== */}

        <section
          className={`
            absolute
            left-0
            top-0
            z-20
            hidden
            h-full
            w-1/2
            overflow-hidden

            bg-gradient-to-br
            from-blue-600
            via-blue-700
            to-blue-800

            text-white

            transition-all
            duration-700
            ease-[cubic-bezier(0.77,0,0.175,1)]

            md:flex

            ${
              mode === "register"
                ? "-translate-x-full rounded-[90px_24px_24px_90px]"
                : "translate-x-0 rounded-[24px_90px_90px_24px]"
            }
          `}
        >
          {/* Decoração */}

          <div
            className="
              pointer-events-none
              absolute
              -right-28
              top-20
              h-56
              w-56
              rounded-full
              bg-white/5
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-44
              -left-48
              h-80
              w-80
              rounded-full
              bg-slate-900/10
            "
          />

          <div className="relative z-10 flex h-full w-full flex-col p-[42px_52px] gap-50">
            {/* Brand */}

            <div className="flex items-center gap-2.5 text-xl font-bold">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/15
                  bg-white/15
                  backdrop-blur
                "
              >
                R
              </div>

              <span>RHFlow</span>
            </div>

            {/* Conteúdo */}

            <div className="m-auto px-7 text-center">
              <h2 className="mb-3.5 text-[34px] font-bold tracking-tight">
                Olá, bem-vindo! 👋
              </h2>

              <p className="mb-7 text-sm leading-[1.7] text-white/85">
                Já possui uma conta?
                <br />
                Entre para continuar.
              </p>

              <button
                type="button"
                onClick={() => switchMode("login")}
                className="
                  h-12
                  min-w-40
                  rounded-xl
                  border
                  border-white/80
                  bg-transparent
                  px-[26px]
                  text-sm
                  font-semibold
                  text-white

                  transition-all
                  duration-200

                  hover:-translate-y-0.5
                  hover:bg-white
                  hover:text-blue-600
                "
              >
                Entrar
              </button>
            </div>
          </div>
        </section>

        {/* ====================================================
            PAINEL AZUL — REGISTRO DESKTOP
        ===================================================== */}

        <section
          className={`
            absolute
            right-0
            top-0
            z-20
            hidden
            h-full
            w-1/2
            overflow-hidden

            bg-gradient-to-br
            from-blue-600
            via-blue-700
            to-blue-800

            text-white

            transition-all
            duration-700
            ease-[cubic-bezier(0.77,0,0.175,1)]

            md:flex

            ${
              mode === "register"
                ? "translate-x-0 rounded-[24px_90px_90px_24px]"
                : "translate-x-full rounded-[90px_24px_24px_90px]"
            }
          `}
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-28
              top-20
              h-56
              w-56
              rounded-full
              bg-white/5
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-44
              -left-48
              h-80
              w-80
              rounded-full
              bg-slate-900/10
            "
          />

          <div className="relative z-10 flex h-full w-full flex-col p-[42px_52px] gap-50">
            {/* Brand */}

            <div className="flex items-center gap-2.5 text-xl font-bold">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/15
                  bg-white/15
                  backdrop-blur
                "
              >
                R
              </div>

              <span>RHFlow</span>
            </div>

            {/* Conteúdo */}

            <div className="m-auto px-7 text-center">
              <h2 className="mb-3.5 text-[34px] font-bold tracking-tight">
                Olá, bem-vindo! 👋
              </h2>

              <p className="mb-7 text-sm leading-[1.7] text-white/85">
                Ainda não possui uma conta?
                <br />
                Crie sua conta gratuitamente.
              </p>

              <button
                type="button"
                onClick={() => switchMode("register")}
                className="
                  h-12
                  min-w-40
                  rounded-xl
                  border
                  border-white/80
                  bg-transparent
                  px-[26px]
                  text-sm
                  font-semibold
                  text-white

                  transition-all
                  duration-200

                  hover:-translate-y-0.5
                  hover:bg-white
                  hover:text-blue-600
                "
              >
                Criar conta
              </button>
            </div>
          </div>
        </section>

        {/* ====================================================
            FORM LOGIN
        ===================================================== */}

        <section
          className={`
    absolute
    left-0
    top-0
    flex
    min-h-screen
    w-full
    justify-center
    items-center
    bg-white
    md:h-full
    md:min-h-0
    md:w-1/2
    md:z-10
    md:transition-all
    md:duration-700
    md:ease-[cubic-bezier(0.77,0,0.175,1)]
    ${
      mode === "register"
        ? `
          hidden
          md:flex
          md:translate-x-full
          md:opacity-0
        `
        : `
          flex
          translate-x-0
          opacity-100
          md:translate-x-full
        `
    }
  `}>
          <div
            className="
              flex
              w-full
              max-w-[430px]
              flex-col
              justify-center
              px-6
              pb-10
              pt-[185px]
              md:max-w-[390px]
              md:px-5
              md:py-[42px]
              md:pt-[42px]
            "
          >
            {/* Desktop brand */}

            <div className="mb-6 hidden items-center gap-2.5 text-lg font-bold text-slate-900 md:flex">
              <div
                className="
                  flex
                  h-[38px]
                  w-[38px]
                  items-center
                  justify-center
                  rounded-[11px]
                  bg-blue-50
                  text-base
                  font-bold
                  text-blue-600
                ">
                R
              </div>
              <span>RHFlow</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="mb-2 text-[30px] font-bold tracking-tight text-slate-900 md:text-[31px]">
                Login
              </h1>
              <p className="text-[13px] leading-[1.5] text-slate-500">
                Entre na sua conta para continuar.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-[18px]">
              {/* E-mail */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="login-email"
                  className="text-xs font-semibold text-slate-900">
                  E-mail
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400">
                    @
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    autoComplete="email"
                    required
                    className="
                      h-[48px]
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-[38px]
                      pr-4
                      text-[13px]
                      text-slate-900
                      outline-none
                      placeholder:text-slate-400
                      focus:border-blue-600
                      focus:ring-[3px]
                      focus:ring-blue-600/10
                    "/>
                </div>
              </div>

              {/* Senha */}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-semibold text-slate-900">
                    Senha
                  </label>

                  <button
                    type="button"
                    onClick={() => console.log("Recuperar senha")}
                    className="
                      border-0
                      bg-transparent
                      text-[10px]
                      font-semibold
                      text-blue-600
                      hover:text-blue-700
                    ">
                    Esqueceu a senha?
                  </button>
                </div>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400">
                    •
                  </span>

                  <input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    className="
                      h-[48px]
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-[38px]
                      pr-[85px]
                      text-[13px]
                      text-slate-900
                      outline-none
                      placeholder:text-slate-400
                      focus:border-blue-600
                      focus:ring-[3px]
                      focus:ring-blue-600/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowLoginPassword((previous) => !previous)
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      border-0
                      bg-transparent
                      px-1
                      text-[10px]
                      font-semibold
                      text-slate-400
                      hover:text-blue-600
                    "
                  >
                    {showLoginPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {/* Botão */}

              <button
                type="submit"
                className="
                  mt-1
                  h-[48px]
                  w-full
                  rounded-xl
                  border-0
                  bg-blue-600
                  text-[13px]
                  font-semibold
                  text-white
                  shadow-[0_7px_18px_rgba(37,99,235,0.20)]
                  transition-all
                  duration-200
                  hover:-translate-y-px
                  hover:bg-blue-700
                  hover:shadow-[0_9px_20px_rgba(37,99,235,0.25)]
                ">
                Entrar
              </button>
            </form>

            {/* Divider */}

            <div className="my-6 flex items-center gap-2.5">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="whitespace-nowrap text-[10px] text-slate-400">
                ou continue com
              </span>

              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Social */}

            <div className="flex justify-center gap-2.5">
              {["G", "GH", "in"].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-xs
                    font-bold
                    text-slate-900
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-slate-300
                    hover:bg-slate-50
                  "
                >
                  {provider}
                </button>
              ))}
            </div>

            {/* Footer */}
            <p className="mt-5 text-center text-[11px] text-slate-500">
              Não tem uma conta?
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="
                  ml-1
                  border-0
                  bg-transparent
                  p-1
                  text-[11px]
                  font-semibold
                  text-blue-600
                  hover:text-blue-700
                ">
                Cadastre-se
              </button>
            </p>
          </div>
        </section>

        {/* ====================================================
            FORM REGISTRO
        ===================================================== */}

        <section
          className={`
            absolute
            left-0
            top-0
            flex
            min-h-screen
            w-full
            justify-center
            overflow-y-auto
            bg-white

            md:h-full
            md:min-h-0
            md:w-1/2

            md:transition-all
            md:duration-700
            md:ease-[cubic-bezier(0.77,0,0.175,1)]

            ${
              mode === "register"
                ? `
                  flex
                  translate-x-0
                  opacity-100
                `
                : `
                  hidden

                  md:flex
                  md:-translate-x-full
                  md:opacity-0
                `
            }
          `}
        >
          <div
            className="
              flex
              w-full
              max-w-[430px]
              flex-col

              px-6
              pb-10
              pt-[185px]

              md:max-w-[390px]
              md:px-5
              md:py-[35px]
              md:pt-[35px]
            "
          >
            {/* Desktop brand */}

            <div className="mb-6 hidden items-center gap-2.5 text-lg font-bold text-slate-900 md:flex">
              <div
                className="
                  flex
                  h-[38px]
                  w-[38px]
                  items-center
                  justify-center
                  rounded-[11px]
                  bg-blue-50
                  text-base
                  font-bold
                  text-blue-600
                "
              >
                R
              </div>

              <span>RHFlow</span>
            </div>

            {/* Heading */}

            <div className="mb-6">
              <h1 className="mb-2 text-[28px] font-bold tracking-tight text-slate-900 md:text-[31px]">
                Crie sua conta
              </h1>

              <p className="text-[13px] leading-[1.5] text-slate-500">
                Preencha seus dados para começar.
              </p>
            </div>

            {/* Form */}

            <form
              onSubmit={handleRegister}
              className="flex flex-col gap-[16px]"
            >
              {/* Nome */}

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="register-name"
                  className="text-xs font-semibold text-slate-900"
                >
                  Nome completo
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-slate-400">
                    R
                  </span>

                  <input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                    className="
                      h-[48px]
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-[38px]
                      pr-4
                      text-[13px]
                      text-slate-900
                      outline-none

                      placeholder:text-slate-400

                      focus:border-blue-600
                      focus:ring-[3px]
                      focus:ring-blue-600/10
                    "
                  />
                </div>
              </div>

              {/* E-mail */}

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="register-email"
                  className="text-xs font-semibold text-slate-900"
                >
                  E-mail
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400">
                    @
                  </span>

                  <input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    autoComplete="email"
                    required
                    className="
                      h-[48px]
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-[38px]
                      pr-4
                      text-[13px]
                      text-slate-900
                      outline-none

                      placeholder:text-slate-400

                      focus:border-blue-600
                      focus:ring-[3px]
                      focus:ring-blue-600/10
                    "
                  />
                </div>
              </div>

              {/* Senha */}

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="register-password"
                  className="text-xs font-semibold text-slate-900"
                >
                  Senha
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400">
                    •
                  </span>

                  <input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(event) =>
                      setRegisterPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    required
                    className="
                      h-[48px]
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-[38px]
                      pr-[85px]
                      text-[13px]
                      text-slate-900
                      outline-none

                      placeholder:text-slate-400

                      focus:border-blue-600
                      focus:ring-[3px]
                      focus:ring-blue-600/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterPassword((previous) => !previous)
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      border-0
                      bg-transparent
                      px-1
                      text-[10px]
                      font-semibold
                      text-slate-400

                      hover:text-blue-600
                    "
                  >
                    {showRegisterPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {/* Confirmar senha */}

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirm-password"
                  className="text-xs font-semibold text-slate-900"
                >
                  Confirmar senha
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400">
                    •
                  </span>

                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    className="
                      h-[48px]
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-[38px]
                      pr-[85px]
                      text-[13px]
                      text-slate-900
                      outline-none

                      placeholder:text-slate-400

                      focus:border-blue-600
                      focus:ring-[3px]
                      focus:ring-blue-600/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      border-0
                      bg-transparent
                      px-1
                      text-[10px]
                      font-semibold
                      text-slate-400

                      hover:text-blue-600
                    "
                  >
                    {showConfirmPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {/* Requisitos */}

              <div>
                <p className="mb-2 text-[10px] font-semibold text-slate-500">
                  Requisitos da senha
                </p>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  <span
                    className={`
                      flex
                      items-center
                      gap-1
                      text-[9px]

                      ${
                        registerPassword.length >= 8
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    `}
                  >
                    <b>✓</b>8 caracteres
                  </span>

                  <span
                    className={`
                      flex
                      items-center
                      gap-1
                      text-[9px]

                      ${
                        /[A-Z]/.test(registerPassword)
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    `}
                  >
                    <b>✓</b>
                    Letra maiúscula
                  </span>

                  <span
                    className={`
                      flex
                      items-center
                      gap-1
                      text-[9px]

                      ${
                        /[a-z]/.test(registerPassword)
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    `}
                  >
                    <b>✓</b>
                    Letra minúscula
                  </span>

                  <span
                    className={`
                      flex
                      items-center
                      gap-1
                      text-[9px]

                      ${
                        /\d/.test(registerPassword)
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    `}
                  >
                    <b>✓</b>
                    Um número
                  </span>
                </div>
              </div>

              {/* Botão */}

              <button
                type="submit"
                className="
                  mt-1
                  h-[48px]
                  w-full
                  rounded-xl
                  border-0
                  bg-blue-600

                  text-[13px]
                  font-semibold
                  text-white

                  shadow-[0_7px_18px_rgba(37,99,235,0.20)]

                  transition-all
                  duration-200

                  hover:-translate-y-px
                  hover:bg-blue-700
                  hover:shadow-[0_9px_20px_rgba(37,99,235,0.25)]
                "
              >
                Criar conta
              </button>
            </form>

            {/* Footer */}

            <p className="mt-5 text-center text-[11px] text-slate-500">
              Já possui uma conta?
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="
                  ml-1
                  border-0
                  bg-transparent
                  p-1
                  text-[11px]
                  font-semibold
                  text-blue-600

                  hover:text-blue-700
                "
              >
                Entrar
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
