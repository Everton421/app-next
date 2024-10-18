'use client'

import { api } from "@/app/services/api";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react"

export default function ListaClientes({ selecionarCliente }:any){

    const [ pesquisa, setPesquisa ] = useState('');
    const [ dadosClientes, setDadosClientes ] = useState([]);
    const [ loading, setLoading  ] = useState(false);
    const [ selecionado, setSelecionado ] = useState({});


useEffect(
    ()=>{
        async function buscaClientes(){
            if(pesquisa !== ''){
             try{
                    setLoading(true)
                    let result = await api.get(`/clientes/${pesquisa}`)
                    console.log(result)
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

        buscaClientes();
    }, [ pesquisa ]
)

    function seleciona(c){
        setSelecionado(c)
        selecionarCliente(c)
        setPesquisa('')
        }

    return(
        <div className="relative p-4 w-full  ">
                 <input 
                                    className="  border-2 bg-white rounded-xl  shadow-sm p-2"
                                    onChange={(e) => setPesquisa(e.target.value)}
                                    placeholder="pesquisar cliente"
                                />
          

           {loading ? (
                <p className="sm:ml-14 p-4 absolute">carregando...</p>
            ) : (
                dadosClientes.length > 0 && (
                    <div className="absolute z-10    ">
                        { dadosClientes.slice(0, 2).map((i: any) => (
                            <div key={i.codigo} onClick={() => seleciona(i)} className=" flex sm:ml-14 m-1 shadow-lg bg-white border-current rounded-md   p-1">
                                
                                <span className=" text-gray-500 font-bold">Código: {i.codigo}  {i.nome}  cnpj: {i.cnpj}</span>
                                 
                            </div>
                        ))}
                    </div>
                )
            )}

         
               
            



        </div>
    )
}