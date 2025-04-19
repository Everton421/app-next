'use client'
import { configApi } from "@/app/services/api"
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react"

export default function ListaServicos( { selecionarServico}:any){

        const [pesquisa, setPesquisa] = useState('');
        const [dados, setDados] = useState([]);
        const [loading, setLoading] = useState(false);
        const [ selecionado , setSelecionado ] = useState({});
        const  [  valueInput, setValueInput  ] = useState('');
        
        const api = configApi()
         const { user }:any = useAuth();

        function seleciona( i:any ){
            setSelecionado(i);
            setPesquisa('');
            if( selecionarServico ){
                selecionarServico(i)
            }
        }

        function pesquisarServico(e:any){
            setPesquisa(e)
        }

    useEffect(
        ()=>{
            async function buscaServicos() {
                if( pesquisa !== ''){
                    setLoading(true);

                    let params;
                    if( isNaN(pesquisa)){
                        params = {aplicacao: pesquisa,ativo:'S'  } 
                    }
    
                    if( !isNaN(pesquisa)){
                        params = {codigo: pesquisa ,ativo:'S' } 
    
                    }

                try{
                    const response = await api.get(`/servicos`,
                        { 
                            headers:{
                                 cnpj: Number(user.cnpj)
                                 },
                            params: params     
                            
                        }
                    )
                        if(response.status === 200 ){
                            setDados(response.data)
                        }
                    }catch(e){ console.log(e) 
                    }finally{
                        setLoading(false)
                      }
                }
                    if(pesquisa === ''){
                        setDados([])
                    } 
            }

            buscaServicos();

        },[pesquisa ]
    )
    //////////////////

    //////////////////


    return (
        <div className="relative p-4 w-full  ">
             <span className="text-2xl m-3  font-sans font-bold  ">
               Serviços
            </span>
                <input 
                    className="  border-2 bg-white rounded-lg w-6/12 shadow-md  p-2"
                    onChange={(e) => pesquisarServico(e.target.value)}
                    placeholder="pesquisar"
                />
            {loading ? (
                <p className="sm:ml-14 p-4 absolute">carregando...</p>
            ) : (
                dados.length > 0 && (
                    <div className="absolute z-10    ">
                        {dados.slice(0, 2).map((i: any) => (
                            <div key={i.codigo} onClick={() => seleciona(i)} className="sm:ml-14 m-1   bg-gray-500 shadow-lg border-current cursor-pointer  rounded-md   p-1">
                                    <span className=" text-white font-bold">
                                     Cód: {i.codigo}  {i.aplicacao} 
                                    </span>
                                        <br/> 
                                    <span className=" text-white font-bold">
                                        R$: {i.valor}
                                    </span>
                                 
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );

}