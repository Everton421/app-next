'use client'
import { api } from "@/app/services/api"
import { useEffect, useState } from "react"

export default function ListaProdutos( { selecionarProduto}:any){

        const [pesquisa, setPesquisa] = useState('');
        const [dados, setDados] = useState([]);
        const [loading, setLoading] = useState(false);
        const [ selecionado , setSelecionado ] = useState({});
        const  [  valueInput, setValueInput  ] = useState('');

        function seleciona( i:any ){
            setSelecionado(i);
            setPesquisa('');
            if( selecionarProduto ){
            selecionarProduto(i)
            }
        }

        function pesquisarProduto(e:any){
            setPesquisa(e)
        }

    useEffect(
        ()=>{
            async function buscaProdutos() {
                if( pesquisa !== ''){
                    setLoading(true);
                try{
                    const response = await api.get(`/produtos/${pesquisa}`)

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

                buscaProdutos();

        },[pesquisa ]
    )
    //////////////////

    //////////////////


    return (
        <div className="relative p-4 w-full  ">
             <span className="text-2xl m-3  font-sans font-bold  ">
               produtos
            </span>
                <input 
                    className="  border-2 bg-white rounded-lg w-6/12 shadow-md  p-2"
                    onChange={(e) => pesquisarProduto(e.target.value)}
                    placeholder="pesquisar"
                />
            {loading ? (
                <p className="sm:ml-14 p-4 absolute">carregando...</p>
            ) : (
                dados.length > 0 && (
                    <div className="absolute z-10    ">
                        {dados.slice(0, 2).map((i: any) => (
                            <div key={i.codigo} onClick={() => seleciona(i)} className="sm:ml-14 m-1   bg-white shadow-lg border-current rounded-md   p-1">
                                <span className=" text-gray-500 font-bold">Cód: {i.codigo}  {i.descricao} </span>
                                 
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );

}