import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function configApi() {
  const api = axios.create({
    baseURL,
   // timeout: 30000,
   // withCredentials: true,
  });

  api.interceptors.request.use(
    async (config) => {
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
          document.cookie = 'authUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = "/";
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}

export const api = configApi();