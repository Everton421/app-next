
'use client'
import AuthContex  from "@/contexts/AuthContext";
import Image from "next/image";
import { useContext, useState } from "react";
import { configApi } from "../services/api";


export default function Login( ) {

    const { logado, setLogado ,vendedor, setVendedor } = useContext(AuthContex)

     
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');
      
      const [ dadosLogin, setDadosLogin ] = useState();

        const api = configApi();

      const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Simulação de autenticação (substitua com sua lógica real)
   //     if (email === 'teste@exemplo.com' && password === 'senha123') {
   //       alert('Login bem-sucedido!'); // Substitua com redirecionamento ou outras ações
   //     } else {
   //       setError('Credenciais inválidas.');
   //     }

   try{
        const response = await api.post('/login',
            {email: email, senha:password})
            if( response.status === 200 ){
                setDadosLogin(response.data);
                if( response.data.codigo ){
                setVendedor({ codigo: response.data.codigo, nome:response.data.nome})
                    setLogado(true)
                }
                
            }
        console.log(response);
    }catch(e){
        console.log(e);
    }
};
    
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
              <div className="w-full items-center flex justify-center">
                <Image 
                        className="rounded-sm ml-1"
                            src="/images/next.jpg"
                            alt="img"
                            width={180}
                            height={180}
                        />
                     </div>
    
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Erro!</strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
    
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Senha
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  id="password"
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* <p className="text-red-500 text-xs italic">Please choose a password.</p> */}
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Entrar
                </button>
                <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                  Esqueceu a senha?
                </a>
              </div>
            </form>
            <p className="text-center text-gray-500 text-xs mt-4">
              © {new Date().getFullYear()} Minha Empresa. Todos os direitos reservados.
            </p>
          </div>
        </div>
      );
    }