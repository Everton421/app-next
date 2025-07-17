'use client'

import Image from "next/image";
import { ServerContextJSONValue, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/app/services/api";
import { ThreeDot }  from 'react-loading-indicators';  

export default function LoginForm() {

    const router = useRouter();
    const { setUser }:any = useAuth();  

    const [ email, setEmail] = useState<string>('');  
    const [ senha, setSenha ] = useState<string>('');  
    const [ isSubmitting, setIsSubmitting] = useState(false);  

    const [ erro, setErro ] = useState(false);
    const [ msgErro , setMsgErro] = useState<string | undefined>();  

    const api = configApi();


   const login = async (email:string, senha:string) => {

        if (!email || !senha) {
            setErro(true);
            setMsgErro("Por favor, preencha o email e a senha.");
            throw new Error("Campos obrigatórios não preenchidos.");  
        }

        const data =  { email:email, senha:senha };

        try{
            const response = await api.post(`/login`, data );
console.log(response.data)
            if( response.status === 200  ){
                setErro(false);  
                setMsgErro(undefined);

               // const userData = { 
               //     cnpj: response.data.data.empresa,
               //     vendedor:response.data.data.codigo,
               //     nome: response.data.data.nome
               // };

                 const userData = { 
                    token: response.data.token,
                    codigo:response.data.codigo,
                    nome: response.data.usuario
                }

                setUser(userData); 
                localStorage.setItem('authUser', JSON.stringify(userData));  
                router.push('/home');  
            } else {
                 setErro(true);
                 setMsgErro(response.data.msg || "Ocorreu um erro inesperado.");
                 setUser(null);
                 localStorage.removeItem('authUser');
                 throw new Error(response.data.msg || "Erro na resposta da API");
            }
        } catch(e: any) { 
            console.error('Ocorreu um erro ao tentar fazer o login', e);
            setErro(true);
            setMsgErro(e?.response?.data?.msg || e?.message || "Erro de conexão ou servidor.");
            setUser(null);
            localStorage.removeItem('authUser');
            throw e; 
                }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{ // Tipar o evento
        e.preventDefault();
        // setError(null); // Removido se não usado
        setErro(false); // Limpa erros anteriores específicos da API
        setMsgErro(undefined);
        setIsSubmitting(true); // <<< INICIA O LOADING AQUI

        try{
            await login(email, senha);
            // Se chegar aqui sem erro, o redirect já foi chamado dentro de login()
        } catch(e){
             // O erro já foi tratado e o estado de erro (erro, msgErro) já foi definido dentro da função login
             // O console.error também já foi chamado lá.
             // Apenas certifica que o fluxo de erro foi pego.
             console.log('Falha no processo de login capturada em handleSubmit.');
        } finally {
            setIsSubmitting(false); // <<< TERMINA O LOADING AQUI (SEMPRE)
        }
    }

    async function delay(ms:number ){
        return new Promise( (resolve) => resolve( setTimeout(()=>{},ms) ))
    }

    async function navegateNovaConta(){
         router.push('/novaConta')
        setIsSubmitting(false) 
        
        }

    return (
        <div className="flex items-center w-full justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
                <div className="w-full items-center flex justify-center mb-4"> {/* Adicionado mb-4 */}
                    <Image
                        className="rounded-3xl" // Removido ml-1 se não necessário
                        src="/images/vercel.png" // Verifique se este caminho está correto na pasta public
                        alt="Logo da Empresa" // Alt text mais descritivo
                        width={150}
                        height={150}
                        priority // Adicionar priority se for LCP (Largest Contentful Paint)
                    />
                </div>

                {/* --- INDICADOR DE LOADING --- */}
                {isSubmitting && (
                    <div className="flex justify-center my-4"> {/* Container para centralizar */}
                        <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
                    </div>
                )}

                {/* --- MENSAGEM DE ERRO (só mostra se não estiver carregando) --- */}
                { erro && !isSubmitting && (
                    <p className="text-red-500 text-sm text-center mb-4 font-bold">{msgErro}</p>  
                )}

                {/* Ocultar o formulário durante o loading é uma opção, mas desabilitar campos é mais comum */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 ">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email" // Adicionar id para o label htmlFor
                                type="email" // Usar type="email" para validação básica do navegador
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${erro && !email ? 'border-red-500' : ''} ${isSubmitting ? 'bg-gray-200 cursor-not-allowed' : ''}`} // Estilo opcional para erro e desabilitado
                                value={email} // Controlar o valor do input
                                onChange={(e)=>{ setEmail(e.target.value)}}
                                placeholder="seuemail@exemplo.com"
                                disabled={isSubmitting} // <<< DESABILITA ENQUANTO CARREGA
                                required // Adicionar validação HTML básica
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Senha
                            </label>
                            <input
                                id="password" // Adicionar id
                                type="password" // Usar type="password" para ocultar a senha
                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${erro && !senha ? 'border-red-500' : ''} ${isSubmitting ? 'bg-gray-200 cursor-not-allowed' : ''}`} // Estilo opcional para erro e desabilitado
                                value={senha} // Controlar o valor do input
                                onChange={(e)=>{ setSenha(e.target.value)}}
                                placeholder="********"
                                disabled={isSubmitting} // <<< DESABILITA ENQUANTO CARREGA
                                required // Adicionar validação HTML básica
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} // Estilo para desabilitado
                                type="submit"
                                disabled={isSubmitting} // <<< DESABILITA ENQUANTO CARREGA
                            >
                                {isSubmitting ? 'Entrando...' : 'Entrar'} {/* Opcional: Mudar texto do botão */}
                            </button>
                            <a className={`inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`} href="#">
                                Esqueceu a senha?
                            </a>
                        </div>

                    </form>

                    <div className="m-3 items-center justify-end flex w-full ">
                          <button
                                 className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} // Estilo para desabilitado
                                  disabled={isSubmitting} // <<< DESABILITA ENQUANTO CARREGA
                                onClick={()=> navegateNovaConta() }
                              >
                                 { 'Teste Grátis' }  
                            </button>
                         </div>
                {/* )} */}
                <p className="text-center text-gray-500 text-xs mt-4">
                    © {new Date().getFullYear()} Minha Empresa. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}