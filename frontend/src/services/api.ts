import axios from "axios";

const TOKEN_KEY = "rhflow_access_token";
const EXPIRATION_KEY = "rhflow_token_expiration";

export const api = axios.create({
  baseURL:
    // import.meta.env.VITE_API_URL ??
    "http://192.168.0.21:8080",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiration = Number(
    sessionStorage.getItem(EXPIRATION_KEY)
  );

  if (token && expiration && Date.now() < expiration) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRATION_KEY);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(EXPIRATION_KEY);

      window.dispatchEvent(new Event("rhflow:logout"));
    }

    return Promise.reject(error);
  }
);