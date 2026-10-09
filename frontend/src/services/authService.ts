import { api } from "./api";

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfis: string[];
  permissoes: string[];
}

const TOKEN_KEY = "rhflow_access_token";
const EXPIRATION_KEY = "rhflow_token_expiration";

export const authService = {
  // ==========================================================
  // LOGIN
  // ==========================================================

  async login(
    credentials: LoginCredentials
  ): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(
      "/auth/login",
      credentials
    );

    const expiration =
      Date.now() + data.expiresIn * 1000;

    sessionStorage.setItem(
      TOKEN_KEY,
      data.accessToken
    );

    sessionStorage.setItem(
      EXPIRATION_KEY,
      String(expiration)
    );

    return data;
  },

  // ==========================================================
  // USUÁRIO AUTENTICADO
  // ==========================================================

  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>(
      "/auth/me"
    );

    return data;
  },

  // ==========================================================
  // TOKEN
  // ==========================================================

  getToken(): string | null {
    const token =
      sessionStorage.getItem(TOKEN_KEY);

    const expiration = Number(
      sessionStorage.getItem(EXPIRATION_KEY)
    );

    if (
      !token ||
      !expiration ||
      Date.now() >= expiration
    ) {
      this.logout();
      return null;
    }

    return token;
  },

  // ==========================================================
  // AUTENTICADO
  // ==========================================================

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  // ==========================================================
  // LOGOUT
  // ==========================================================

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRATION_KEY);
  },
};