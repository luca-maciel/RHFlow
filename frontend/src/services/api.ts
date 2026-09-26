import axios from "axios";

const api = axios.create({

  baseURL: "http://localhost:8080",
//   baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;