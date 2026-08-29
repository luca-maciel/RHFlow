import { useState } from "react";
import "../styles/auth.css";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    console.log("Cadastro enviado");
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
          <h1>Criar sua conta</h1>

          <p>
            Preencha os dados abaixo para criar sua conta
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="auth-form">

          {/* Nome */}
          <div className="form-group">
            <label htmlFor="name">
              Nome completo
            </label>

            <input
              id="name"
              type="text"
              placeholder="Seu nome"
              autoComplete="name"
              required
            />
          </div>

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
            <label htmlFor="password">
              Senha
            </label>

            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirmar senha
            </label>

            <div className="password-input">
              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Requisitos */}
          <div className="password-requirements">

            <div className="requirement">
              <span>✓</span>
              Mínimo de 8 caracteres
            </div>

            <div className="requirement">
              <span>✓</span>
              Uma letra maiúscula
            </div>

            <div className="requirement">
              <span>✓</span>
              Uma letra minúscula
            </div>

            <div className="requirement">
              <span>✓</span>
              Um número
            </div>

          </div>

          {/* Botão */}
          <button
            type="submit"
            className="primary-button"
          >
            Criar conta
          </button>
        </form>

        {/* Login */}
        <p className="auth-footer">
          Já possui uma conta?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => console.log("Ir para login")}
          >
            Entrar
          </button>
        </p>

      </section>
    </main>
  );
}