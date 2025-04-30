
'use client'

import {    configApi } from "@/app/services/api";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react"

type props = {
    codigoCategoria:number | null
    setCodigoCategoria:any
}

export default function SelectCategorias({ codigoCategoria, setCodigoCategoria}:props ){

    const [ pesquisa, setPesquisa ] = useState('');
    const [ dadosClientes, setDadosClientes ] = useState([]);
    const [ loading, setLoading  ] = useState(false);
    const [ selecionado, setSelecionado ] = useState({});

    const[ defaultValue ,setDefaultValue ]= useState<number>();
    const api = configApi();
    
  const { user }:any = useAuth();


useEffect(
    ()=>{
        async function buscaCategorias(){
            if(pesquisa !== ''){
             try{
                    setLoading(true)
                    const result = await api.get(`/categorias`,{
                        headers:{ 
                            token:  user.token
                        },
                        params:{
                            codigo:pesquisa
                        }
                    })
                    console.log(result.data)
                    if( result.status === 200 ){
                        setDadosClientes(result.data) 
                    }
                }catch(e){ console.log(e)
                }finally{
                    setLoading(false)
                }
            }

              if(pesquisa === '' ){
                 setDadosClientes([])
             } 

        }

        buscaCategorias();
    }, [ pesquisa ]
)

useEffect(
    ()=>{
    if( codigoCategoria !== null ){
        setDefaultValue(codigoCategoria)
        }else{
            setDefaultValue(0)
        }
    },[]
)

    function seleciona(c:any){
        setCodigoCategoria(c)
        setPesquisa('')
        }

    return(
        <div className="relative  w-full  ">
                              <Input
                                        id="ncm"
                                        defaultValue={defaultValue}
                                        onChange={(e) => setPesquisa(e.target.value)}
                                        className="mt-1"
                                        maxLength={8}
                                        placeholder="codigo categoria:"

                                    />

           {loading ? (
                <p className="sm:ml-14 p-4 absolute">carregando...</p>
            ) : (
                dadosClientes.length > 0 && (
                    <div className="absolute z-10    ">
                        { dadosClientes.slice(0, 2).map((i: any) => (
                            <div key={i.codigo} onClick={() => seleciona(i)} className="   sm:ml-14 p-2 m-1 shadow-lg bg-gray-500 border-current rounded-md cursor-pointer  ">
                                
                                 <span className=" text-white font-bold">Código: {i.codigo}  {i.nome}  </span>
                                    <br/>
                                 <span className=" text-white font-bold">    {i.descricao}</span>
                            </div>
                        ))}
                    </div>
                )
            )}

        </div>
    )
}