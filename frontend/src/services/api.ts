import axios from "axios";

const api = axios.create({

  baseURL: "http://192.168.137.37:8080",
//   baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;