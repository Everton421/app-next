import axios from "axios";

//
//export const api = axios.create({
//    baseURL:"https://template-api-nu.vercel.app/v1",
//   headers:{
//      "Authorization": "token h43895jt9858094bun6098grubn48u59dsgfg234543tf",
//        "Accept":"*/*",
//         "cnpj":'43.353.507/0001-31'
// }
// })
//

 
export const useApi = () => {
  const api = axios.create({
          //url teste local
          // baseURL: "http://100.108.116.119:3000/v1/",
     
    //baseURL:"https://template-api-nu.vercel.app/v1",
    baseURL: "http://localhost:3000/v1/",
   
  });

  // Interceptor para adicionar headers dinâmicosz
  api.interceptors.request.use(
      async (config) => {
          // Adiciona o CNPJ se o usuário estiver definido
              config.headers["authorization"] = `token h43895jt9858094bun6098grubn48u59dsgfg234543tf `;
              
          return config;
      },

      (error) => {
          return Promise.reject(error);
      }
  );

  return api;
};