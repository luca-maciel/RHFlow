import { useState } from "react";
import "../styles/auth.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Login enviado");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">
            🔐
          </div>

          <span>AuthFlow</span>
        </div>

        {/* Cabeçalho */}
        <div className="auth-header">
          <h1>Bem-vindo de volta 👋</h1>

          <p>
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="auth-form">

          {/* E-mail */}
          <div className="form-group">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />
          </div>

          {/* Senha */}
          <div className="form-group">
            <div className="password-label">
              <label htmlFor="password">
                Senha
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() => console.log("Recuperar senha")}
              >
                Esqueceu sua senha?
              </button>
            </div>

            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="primary-button"
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

        {/* Google */}
        <button
          type="button"
          className="google-button"
          onClick={() => console.log("Login com Google")}
        >
          <span className="google-icon">G</span>

          Continuar com Google
        </button>

        {/* Cadastro */}
        <p className="auth-footer">
          Não tem uma conta?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => console.log("Ir para cadastro")}
          >
            Cadastre-se
          </button>
        </p>
      </section>
    </main>
  );
}