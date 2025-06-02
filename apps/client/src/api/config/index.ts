export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  timeout: 30000,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
};

export { API_ROUTES } from "./routes";
