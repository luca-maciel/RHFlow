import { useState, type FormEvent } from "react";
import "./AuthPage.css";

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

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
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

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
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
  // ALTERAR MODO
  // ==========================================================

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
  };

  return (
    <main className="auth-page">
      <div
        className={`auth-container ${
          mode === "register" ? "register-mode" : ""
        }`}
      >
        {/* ====================================================
            PAINEL AZUL — LOGIN
        ===================================================== */}

        <section className="auth-panel auth-panel-login">
          <div className="panel-content">
            <div className="panel-brand">
              <div className="brand-mark">R</div>

              <span>RHFlow</span>
            </div>

            <div className="panel-center">
              <h2>Olá, bem-vindo! 👋</h2>

              <p>
                Já possui uma conta?
                <br />
                Entre para continuar.
              </p>

              <button
                type="button"
                className="panel-button"
                onClick={() => switchMode("login")}
              >
                Entrar
              </button>
            </div>

            <div className="panel-decoration decoration-one" />
            <div className="panel-decoration decoration-two" />
          </div>
        </section>

        {/* ====================================================
            PAINEL AZUL — REGISTRO
        ===================================================== */}

        <section className="auth-panel auth-panel-register">
          <div className="panel-content">
            <div className="panel-brand">
              <div className="brand-mark">R</div>

              <span>RHFlow</span>
            </div>

            <div className="panel-center">
              <h2>Olá, bem-vindo! 👋</h2>

              <p>
                Ainda não possui uma conta?
                <br />
                Crie sua conta gratuitamente.
              </p>

              <button
                type="button"
                className="panel-button"
                onClick={() => switchMode("register")}
              >
                Criar conta
              </button>
            </div>

            <div className="panel-decoration decoration-one" />
            <div className="panel-decoration decoration-two" />
          </div>
        </section>

        {/* ====================================================
            FORMULÁRIO — LOGIN
        ===================================================== */}

        <section className="auth-form-container login-form-container">
          <div className="auth-form-content">
            {/* Marca */}

            <div className="form-brand">
              <div className="form-brand-mark">R</div>

              <span>RHFlow</span>
            </div>

            {/* Título */}

            <div className="form-heading">
              <h1>Login</h1>

              <p>
                Entre na sua conta para continuar.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={handleLogin}
            >
              {/* E-mail */}

              <div className="input-group">
                <label htmlFor="login-email">
                  E-mail
                </label>

                <div className="input-wrapper">
                  <span className="input-symbol">
                    @
                  </span>

                  <input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(event) =>
                      setLoginEmail(event.target.value)
                    }
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Senha */}

              <div className="input-group">
                <div className="input-label-row">
                  <label htmlFor="login-password">
                    Senha
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() =>
                      console.log("Recuperar senha")
                    }
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <div className="input-wrapper">
                  <span className="input-symbol">
                    •
                  </span>

                  <input
                    id="login-password"
                    type={
                      showLoginPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(event) =>
                      setLoginPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="input-action"
                    onClick={() =>
                      setShowLoginPassword(
                        (previous) => !previous
                      )
                    }
                  >
                    {showLoginPassword
                      ? "Ocultar"
                      : "Mostrar"}
                  </button>
                </div>
              </div>

              {/* Botão */}

              <button
                type="submit"
                className="submit-button"
              >
                Entrar
              </button>
            </form>

            {/* Separador */}

            <div className="divider">
              <span />
              <p>ou continue com</p>
              <span />
            </div>

            {/* Redes sociais */}

            <div className="social-buttons">
              <button
                type="button"
                className="social-button"
              >
                G
              </button>

              <button
                type="button"
                className="social-button"
              >
                GH
              </button>

              <button
                type="button"
                className="social-button"
              >
                in
              </button>
            </div>

            {/* Footer */}

            <p className="form-footer">
              Não tem uma conta?

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  switchMode("register")
                }
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </section>

        {/* ====================================================
            FORMULÁRIO — REGISTRO
        ===================================================== */}

        <section className="auth-form-container register-form-container">
          <div className="auth-form-content">
            {/* Marca */}

            <div className="form-brand">
              <div className="form-brand-mark">R</div>

              <span>RHFlow</span>
            </div>

            {/* Título */}

            <div className="form-heading">
              <h1>Crie sua conta</h1>

              <p>
                Preencha seus dados para começar.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={handleRegister}
            >
              {/* Nome */}

              <div className="input-group">
                <label htmlFor="register-name">
                  Nome completo
                </label>

                <div className="input-wrapper">
                  <span className="input-symbol">
                    R
                  </span>

                  <input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* E-mail */}

              <div className="input-group">
                <label htmlFor="register-email">
                  E-mail
                </label>

                <div className="input-wrapper">
                  <span className="input-symbol">
                    @
                  </span>

                  <input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(event) =>
                      setRegisterEmail(
                        event.target.value
                      )
                    }
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Senha */}

              <div className="input-group">
                <label htmlFor="register-password">
                  Senha
                </label>

                <div className="input-wrapper">
                  <span className="input-symbol">
                    •
                  </span>

                  <input
                    id="register-password"
                    type={
                      showRegisterPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(event) =>
                      setRegisterPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="input-action"
                    onClick={() =>
                      setShowRegisterPassword(
                        (previous) => !previous
                      )
                    }
                  >
                    {showRegisterPassword
                      ? "Ocultar"
                      : "Mostrar"}
                  </button>
                </div>
              </div>

              {/* Confirmar senha */}

              <div className="input-group">
                <label htmlFor="confirm-password">
                  Confirmar senha
                </label>

                <div className="input-wrapper">
                  <span className="input-symbol">
                    •
                  </span>

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="input-action"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "Ocultar"
                      : "Mostrar"}
                  </button>
                </div>
              </div>

              {/* Requisitos */}

              <div className="password-requirements">
                <p>Requisitos da senha</p>

                <div className="requirements-grid">
                  <span
                    className={
                      registerPassword.length >= 8
                        ? "valid"
                        : ""
                    }
                  >
                    <b>✓</b>
                    8 caracteres
                  </span>

                  <span
                    className={
                      /[A-Z]/.test(
                        registerPassword
                      )
                        ? "valid"
                        : ""
                    }
                  >
                    <b>✓</b>
                    Letra maiúscula
                  </span>

                  <span
                    className={
                      /[a-z]/.test(
                        registerPassword
                      )
                        ? "valid"
                        : ""
                    }
                  >
                    <b>✓</b>
                    Letra minúscula
                  </span>

                  <span
                    className={
                      /\d/.test(
                        registerPassword
                      )
                        ? "valid"
                        : ""
                    }
                  >
                    <b>✓</b>
                    Um número
                  </span>
                </div>
              </div>

              {/* Botão */}

              <button
                type="submit"
                className="submit-button"
              >
                Criar conta
              </button>
            </form>

            {/* Footer */}

            <p className="form-footer">
              Já possui uma conta?

              <button
                type="button"
                className="text-button"
                onClick={() =>
                  switchMode("login")
                }
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