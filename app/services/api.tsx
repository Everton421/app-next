import axios from "axios";

 
export function configApi   ()  {
  const api = axios.create({
    baseURL: "https://template-api-git-teste-everton421s-projects.vercel.app/v1/" ,
  });

  // Interceptor para adicionar headers dinâmicosz
  api.interceptors.request.use(
      async (config) => {
          // Adiciona o CNPJ se o usuário estiver definido
              config.headers["authorization"] = `token h43895jt9858094bun6098grubn48u59dsgfg234543tf `;
                config.headers["cnpj"] = 11122233344
          return config;
      },

      (error) => {
          return Promise.reject(error);
      }
  );

  return api;
};