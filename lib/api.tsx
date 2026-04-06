import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:3000/v1/";

export function configApi(token?: string) {
  const api = axios.create({
    baseURL,
    timeout: 30000,
  });

  api.interceptors.request.use(
    async (config) => {
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      config.headers["Content-Type"] = "application/json";
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("authUser");
          window.location.href = "/";
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}

export const api = configApi();
