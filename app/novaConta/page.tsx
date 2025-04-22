'use client'
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { configApi } from "../services/api";
import { ThreeDot } from "react-loading-indicators";


export default function NovaConta(){
    const router =  useRouter();
    const api = configApi();

        const [ cnpj, setCnpj ] = useState();
        const [ emailEmpresa, setEmailEmpresa ] = useState();
        const [ nomeEmpresa , setNomeEmpresa] = useState()
        const [ telefoneEmpresa, setTelefoneEmpresa ] = useState();

        const [ nomeUsuario, setNomeUsuario ] = useState();
        const [ senhaUsuario, setSenhaUsuario ] = useState();
        const [ telefoneUsuario, setTelefoneUsuario ] = useState();
        const [ emailUsuario, setEmailUsuario ] = useState();

            const [ loading ,setLoading ] = useState(false); 


        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{ // Tipar o evento
            e.preventDefault();
            let objEmpresa  =
            {
                "cnpj" : cnpj,
                "email_empresa" :emailEmpresa,
                "nome_empresa" :nomeEmpresa,
                "telefone_empresa" : telefoneEmpresa,
            } 
            let objUser = {
                "nome": nomeUsuario,
                "senha": senhaUsuario,
                "email": emailUsuario,
                "telefone": telefoneUsuario
            }

            let data = { "empresa": objEmpresa, "usuario": objUser}
            console.log(data)

            try{
                let result = await api.post('/empresa', data );
                    if( result.status === 200 && result.data.status.ok === true  ){
                        setLoading(true)
                        router.push('/')
                    }
            }catch(e){
                
                if(e.status === 400) console.log(e.response.data.msg);
            }

        }




    return(
         
   <div className=" min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full justify-itens-center items-center   bg-slate-100 overflow-auto "  >
                 { loading && (
                    <div className="flex justify-center my-4"> {/* Container para centralizar */}
                        <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
                    </div>
                )}


      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">

        <div className="items-center flex justify-end">
            <Button variant="outline" onClick={() => router.push('/')}>
                             <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
         </div>
        
        {/* Container Flex para os dois formulários */}
        <div className="  gap-8 md:gap-12">

        <form className="space-y-4" onSubmit={handleSubmit }>
          {/* Formulário 1: Dados da Empresa */}
          <div className="w-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              Dados da Empresa
            </h2>
              {/* CNPJ */}
              <div>
                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  id="cnpj"
                  onChange={(e)=>setCnpj(e.target.value) }
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {/* Email da Empresa */}
              <div>
                <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email da Empresa
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  name="companyEmail"
                  onChange={ (e)=> setEmailEmpresa(e.target.value) }
                  placeholder="contato@suaempresa.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {/* Nome da Empresa */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  id="companyName"
                  onChange={(e)=>setNomeEmpresa(e.target.value) }
                  name="companyName"
                  placeholder="Nome Fantasia ou Razão Social"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {/* Telefone da Empresa */}
              <div>
                <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone da Empresa
                </label>
                <input
                  type="tel"
                  id="companyPhone"
                  name="companyPhone"
                  onChange={ (e)=> setTelefoneEmpresa(e.target.value)}
                  placeholder="(XX) XXXX-XXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              {/* Botão (opcional, apenas para visualização) */}
              {/*
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                >
                  Salvar Dados da Empresa (Layout)
                </button>
              </div>
               */}
          </div>

          {/* Formulário 2: Dados do Responsável */}
          <div className="w-full mt-3">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              Dados do Responsável
            </h2>
              {/* Nome */}
              <div>
                <label htmlFor="responsibleName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome  
                </label>
                <input
                  type="text"
                  id="responsibleName"
                  name="responsibleName"
                  onChange={(e)=> setNomeUsuario(e.target.value)}
                  placeholder="Seu Nome"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="responsibleEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email  
                </label>
                <input
                  type="email"
                  id="responsibleEmail"
                  onChange={(e)=> setEmailUsuario(e.target.value)}
                  name="responsibleEmail"
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  onChange={(e)=> setSenhaUsuario(e.target.value)}
                  placeholder="********"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="responsiblePhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="responsiblePhone"
                  name="responsiblePhone"
                  onChange={(e)=> setTelefoneUsuario(e.target.value)}
                  placeholder="(XX) 9XXXX-XXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
               {/* Botão (opcional, apenas para visualização) */}
               {/* Botão de Submissão Geral (se fizer sentido para seu fluxo) */}
               <div className="mt-10 text-center">
            <button
                type="submit" // Idealmente, este botão estaria dentro de um <form> que englobe tudo, ou você usaria JS para coletar dados dos dois.
                className="bg-blue-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out text-lg"
            >
                Registrar 
            </button>
            </div>  

          </div>
           </form>

        </div>

     
      </div>
    </div>
  );
}