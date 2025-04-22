
'use client'


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlignLeft, ArrowLeft, Check, Edit, Plus, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { configApi } from "../services/api";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";

type marca = {
    codigo:number
    descricao:string
}

export default function Marcas (){

    const [ pesquisa, setPesquisa ] = useState(1);
    const [ dados , setDados ] = useState<marca[]>([]);

      const api = configApi();
      const { user, loading } :any = useAuth();
    const router = useRouter();

    async function busca(){
        try{
        let dados = await api.get(`/next/marcas`,{
            headers: {
                 cnpj:  user.cnpj 
            },
            params:{ descricao: pesquisa}

        })
    
        if( dados.data.length > 0 && dados.status === 200  ){
            console.log(dados.data)
            setDados(dados.data)
        }
    }catch(e){
        console.log(e)
    }
    }

    useEffect(()=>{
         busca();
    },[pesquisa] )



    function handleClick( item:any ){
        router.push(`/marcas/${item.codigo}`)
    }
    

 return(
    <div className= " min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full  justify-itens-center items-center    bg-slate-100"  >
           
         <div className="w-4/5 p-8 min-h-screen  rounded-lg bg-white shadow-md " >
             <div className="m-5 flex justify-between"> 
                 <h1 className="text-4xl  font-sans font-bold  ">
                     Marcas
                 </h1>
                 <Button variant="outline" onClick={() => router.push('/produtos')} className="mb-5 shadow-md">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
             </div>
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6  ">
                 <div className="w-full flex  ">
                     <div className="flex w-full max-w-sm items-center space-x-2  ">
                         <Input
                             onChange={(e:any) => setPesquisa(e.target.value)}
                             placeholder="pesquisar"
                             className="shadow-md"
                         />
                     </div>
                 </div>
                 <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 md:mt-0">
                     <Button type="button" className="shadow-sm w-full sm:w-auto"
                        onClick={()=> router.push('/marcas/novo')}
                     >
                         <Plus className="h-4 w-4 mr-2" /> Novo
                     </Button>
                     <div className="flex items-center justify-center sm:justify-start gap-4">
                         <div className="flex items-center gap-1" title="Ativo">
                             <div className="bg-green-600 p-1 w-6 h-6 rounded-sm flex items-center justify-center">
                                 <Check size={16} color="#FFF" strokeWidth={3} />
                             </div>
                             <span className="text-sm text-gray-600 hidden xs:inline">Ativo</span>
                         </div>
                         <div className="flex items-center gap-1" title="Inativo">
                             <div className="bg-red-600 p-1 w-6 h-6 rounded-sm flex items-center justify-center">
                                 <X size={16} color="#FFF" strokeWidth={3} />
                             </div>
                             <span className="text-sm text-gray-600 hidden xs:inline">Inativo</span>
                         </div>
                     </div>
                 </div>
             </div>



        <div className="w-full mt-4  min-h-screen shadow-lg ">
              <Table  className="w-full  bg-gray-100 rounded-sm">

                  <TableHead className= " w-[10%]   text-base">Codigo</TableHead>
                  <TableHead className= " w-[80%]  text-base   " >Descrição</TableHead>
              </Table >

        <ScrollArea className="w-full mt-4  h-4/6 overflow-auto  shadow-lg rounded-lg  ">
                <Table  className="w-full bg-white rounded-xl ">
                <TableBody>
                    {
                        dados &&
                        dados.map((i)=>(
                            <TableRow  
                            className="h-14 justify-center items-center"
                            key={i?.codigo}
                            > 
                            <TableCell className="p-3 text-left font-medium text-gray-700 whitespace-nowrap "> {i?.codigo } </TableCell>
                            <TableCell className="p-3 text-left font-medium text-gray-700 whitespace-nowrap ">   {i?.descricao}      </TableCell>
                            <TableCell className=" text-left   font-bold text-gray-600">  
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                 onClick={() => handleClick(i)}
                                title="Editar Produto"
                                >
                                <Edit className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>     

                        ))   
                    }
                </TableBody>

                </Table>
            </ScrollArea>
            </div>
          </div>
     </div>

 )
}