import "../../index.css";
import { useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, KeyRound, Mail, Moon, ShieldCheck, Sun } from "lucide-react";
import { api } from "../../services/api";

type AuthStep = "login" | "forgot" | "reset";

export default function AuthPage() {
  const { login, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState<AuthStep>("login");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Recuperação / Redefinição
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const goToStep = (next: AuthStep) => {
    setStep(next);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await login({
        email: loginEmail,
        senha: loginPassword,
      });

      navigate("/home", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setErrorMsg("E-mail ou senha inválidos.");
        } else if (!error.response) {
          setErrorMsg("Não foi possível conectar ao servidor.");
        } else {
          setErrorMsg("Não foi possível realizar o login.");
        }
      } else {
        setErrorMsg("Ocorreu um erro inesperado.");
      }
    }
  };

  const handleForgotPassword = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      setSubmitting(true);
      const { data } = await api.post<{ message?: string }>(
        "/auth/forgot-password",
        { email: recoveryEmail.trim() },
      );
      setStep("reset");
      setSuccessMsg(
        data?.message ??
          "Se o e-mail estiver cadastrado e ativo, enviamos um código de 6 dígitos.",
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMsg(
          error.response?.data?.message ??
            "Não foi possível processar a solicitação.",
        );
      } else {
        setErrorMsg("Ocorreu um erro inesperado.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword !== confirmNewPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("A nova senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/auth/reset-password", {
        email: recoveryEmail.trim(),
        codigo: resetCode.trim(),
        novaSenha: newPassword,
      });

      setLoginEmail(recoveryEmail.trim());
      setLoginPassword("");
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
      setStep("login");
      setSuccessMsg("Senha redefinida com sucesso! Entre com sua nova senha.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMsg(
          error.response?.data?.message ??
            "Código de verificação inválido ou expirado.",
        );
      } else {
        setErrorMsg("Ocorreu um erro inesperado.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-background md:flex md:items-center md:justify-center md:p-10">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
        title={theme === "dark" ? "Tema claro" : "Tema escuro"}
        className="
          fixed
          right-4
          top-4
          z-50
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-app-border
          bg-surface/90
          text-foreground
          shadow-sm
          backdrop-blur
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:border-blue-500/50
          hover:text-blue-600
          hover:shadow-md
          focus:outline-none
          focus:ring-2
          focus:ring-blue-600/20
          md:right-6
          md:top-6
        "
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* CONTAINER PRINCIPAL */}
      <div
        className="
          relative
          min-h-screen
          w-full
          overflow-hidden
          bg-surface
          md:grid
          md:h-[680px]
          md:min-h-0
          md:max-w-[1040px]
          md:grid-cols-2
          md:rounded-[24px]
          md:shadow-[0_25px_70px_rgba(15,23,42,0.12),0_5px_20px_rgba(15,23,42,0.05)]
        "
      >
        {/* HEADER MOBILE */}
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
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-surface/5" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-slate-900/10" />

          <div className="relative z-10 flex items-center gap-2.5 text-xl font-bold text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-surface/15 backdrop-blur">
              R
            </div>
            <span>RHFlow</span>
          </div>
        </div>

        {/* PAINEL INSTITUCIONAL — DESKTOP */}
        <section
          className="
            relative
            hidden
            h-full
            overflow-hidden
            rounded-[24px_90px_90px_24px]
            bg-gradient-to-br
            from-blue-600
            via-blue-700
            to-blue-800
            text-white
            md:flex
          "
        >
          <div className="pointer-events-none absolute -right-28 top-20 h-56 w-56 rounded-full bg-surface/5" />
          <div className="pointer-events-none absolute -bottom-44 -left-48 h-80 w-80 rounded-full bg-slate-900/10" />

          <div className="relative z-10 flex h-full w-full flex-col p-[42px_52px]">
            <div className="flex items-center gap-2.5 text-xl font-bold">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-surface/15 backdrop-blur">
                R
              </div>
              <span>RHFlow</span>
            </div>

            <div className="my-auto px-4">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur">
                <ShieldCheck size={14} />
                Acesso Corporativo Restrito
              </div>

              <h2 className="mb-3.5 text-[32px] font-bold leading-tight tracking-tight">
                Gestão de Pessoas centralizada.
              </h2>

              <p className="text-sm leading-[1.7] text-white/85">
                Utilize as credenciais fornecidas pelo departamento de Recursos Humanos ou Administração para acessar o sistema.
              </p>
            </div>

            <p className="text-[11px] text-white/60">
              RHFlow · Sistema de Gestão de Recursos Humanos
            </p>
          </div>
        </section>

        {/* COLUNA DIREITA — FORMULÁRIOS */}
        <section className="flex min-h-screen w-full items-center justify-center overflow-y-auto bg-surface md:h-full md:min-h-0">
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
              md:py-[36px]
            "
          >
            {/* Desktop brand */}
            <div className="mb-6 hidden items-center gap-2.5 text-lg font-bold text-foreground md:flex">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-blue-50 text-base font-bold text-blue-600">
                R
              </div>
              <span>RHFlow</span>
            </div>

            {/* ================================================
                ETAPA 1: LOGIN
            ================================================= */}
            {step === "login" && (
              <>
                <div className="mb-7">
                  <h1 className="mb-2 text-[30px] font-bold tracking-tight text-foreground md:text-[31px]">
                    Entrar
                  </h1>
                  <p className="text-[13px] leading-[1.5] text-muted">
                    Informe seu e-mail corporativo e senha para continuar.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-[18px]">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="login-email"
                      className="text-xs font-semibold text-foreground"
                    >
                      E-mail
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted-light">
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
                          border-app-border
                          bg-surface
                          pl-[38px]
                          pr-4
                          text-[13px]
                          text-foreground
                          outline-none
                          placeholder:text-muted-light
                          focus:border-blue-600
                          focus:ring-[3px]
                          focus:ring-blue-600/10
                        "
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="text-xs font-semibold text-foreground"
                      >
                        Senha
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryEmail(loginEmail);
                          goToStep("forgot");
                        }}
                        className="
                          border-0
                          bg-transparent
                          text-[11px]
                          font-semibold
                          text-blue-600
                          hover:text-blue-700
                        "
                      >
                        Esqueceu a senha?
                      </button>
                    </div>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-muted-light">
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
                          border-app-border
                          bg-surface
                          pl-[38px]
                          pr-[85px]
                          text-[13px]
                          text-foreground
                          outline-none
                          placeholder:text-muted-light
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
                          text-muted-light
                          hover:text-blue-600
                        "
                      >
                        {showLoginPassword ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                  </div>

                  {successMsg && (
                    <div
                      role="status"
                      className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-3 text-[11px] font-medium text-emerald-500"
                    >
                      {successMsg}
                    </div>
                  )}

                  {errorMsg && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-[11px] font-medium text-red-500"
                    >
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
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
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      disabled:hover:translate-y-0
                    "
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </button>
                </form>

                <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
                  Não possui acesso? Solicite a criação do seu usuário ao setor de{" "}
                  <span className="font-semibold text-foreground">
                    Recursos Humanos
                  </span>
                  .
                </p>
              </>
            )}

            {/* ================================================
                ETAPA 2: SOLICITAR CÓDIGO POR E-MAIL
            ================================================= */}
            {step === "forgot" && (
              <>
                <button
                  type="button"
                  onClick={() => goToStep("login")}
                  className="mb-4 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-muted hover:text-blue-600"
                >
                  <ArrowLeft size={14} />
                  Voltar ao login
                </button>

                <div className="mb-7">
                  <h1 className="mb-2 text-[26px] font-bold tracking-tight text-foreground md:text-[28px]">
                    Recuperar senha
                  </h1>
                  <p className="text-[13px] leading-[1.5] text-muted">
                    Informe seu e-mail cadastrado. Enviaremos um código de 6 dígitos para redefinir sua senha.
                  </p>
                </div>

                <form
                  onSubmit={handleForgotPassword}
                  className="flex flex-col gap-[18px]"
                >
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="recovery-email"
                      className="text-xs font-semibold text-foreground"
                    >
                      E-mail corporativo
                    </label>

                    <div className="relative">
                      <Mail
                        size={15}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light"
                      />
                      <input
                        id="recovery-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        required
                        className="
                          h-[48px]
                          w-full
                          rounded-xl
                          border
                          border-app-border
                          bg-surface
                          pl-[40px]
                          pr-4
                          text-[13px]
                          text-foreground
                          outline-none
                          placeholder:text-muted-light
                          focus:border-blue-600
                          focus:ring-[3px]
                          focus:ring-blue-600/10
                        "
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-[11px] font-medium text-red-500"
                    >
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
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
                      hover:bg-blue-700
                      disabled:opacity-60
                    "
                  >
                    {submitting ? "Enviando código..." : "Enviar código por e-mail"}
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep("reset")}
                    className="text-center text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    Já recebi um código
                  </button>
                </form>
              </>
            )}

            {/* ================================================
                ETAPA 3: VALIDAR CÓDIGO E DEFINIR NOVA SENHA
            ================================================= */}
            {step === "reset" && (
              <>
                <button
                  type="button"
                  onClick={() => goToStep("forgot")}
                  className="mb-4 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-muted hover:text-blue-600"
                >
                  <ArrowLeft size={14} />
                  Solicitar novo código
                </button>

                <div className="mb-6">
                  <h1 className="mb-2 text-[26px] font-bold tracking-tight text-foreground md:text-[28px]">
                    Redefinir senha
                  </h1>
                  <p className="text-[13px] leading-[1.5] text-muted">
                    Digite o código enviado para o seu e-mail e escolha uma nova senha.
                  </p>
                </div>

                <form
                  onSubmit={handleResetPassword}
                  className="flex flex-col gap-[15px]"
                >
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="reset-email"
                      className="text-xs font-semibold text-foreground"
                    >
                      E-mail
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      required
                      className="h-[44px] w-full rounded-xl border border-app-border bg-surface px-3.5 text-[13px] text-foreground outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="reset-code"
                      className="text-xs font-semibold text-foreground"
                    >
                      Código de 6 dígitos
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={15}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light"
                      />
                      <input
                        id="reset-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={resetCode}
                        onChange={(e) =>
                          setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        required
                        className="h-[44px] w-full rounded-xl border border-app-border bg-surface pl-[38px] pr-4 text-[13px] font-semibold tracking-widest text-foreground outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="new-password"
                      className="text-xs font-semibold text-foreground"
                    >
                      Nova senha
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="h-[44px] w-full rounded-xl border border-app-border bg-surface pl-3.5 pr-[75px] text-[13px] text-foreground outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-light hover:text-blue-600"
                      >
                        {showNewPassword ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="confirm-new-password"
                      className="text-xs font-semibold text-foreground"
                    >
                      Confirmar nova senha
                    </label>
                    <input
                      id="confirm-new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Repita a nova senha"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      className="h-[44px] w-full rounded-xl border border-app-border bg-surface px-3.5 text-[13px] text-foreground outline-none focus:border-blue-600"
                    />
                  </div>

                  {successMsg && (
                    <div
                      role="status"
                      className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-[11px] font-medium text-emerald-500"
                    >
                      {successMsg}
                    </div>
                  )}

                  {errorMsg && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-[11px] font-medium text-red-500"
                    >
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 h-[46px] w-full rounded-xl bg-blue-600 text-[13px] font-semibold text-white shadow-[0_7px_18px_rgba(37,99,235,0.20)] transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {submitting ? "Salvando..." : "Salvar nova senha"}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}