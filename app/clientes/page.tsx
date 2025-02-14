
'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {   Edit} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { configApi } from "../services/api";

 

export default function Clientes(){
    type client  ={
        codigo: number;
        id: string;
        celular: string;
        nome: string;
        cep: string;
        endereco: string;
        ie: string;
        numero: string;
        cnpj: string;
        ativo: string;
        cidade: string;
        data_cadastro: string;
        data_recadastro: string;
        vendedor: number;
        bairro: string;
        estado: string;
    }
 const [clientes, setClientes] = useState([])
  const api = configApi()
      //  const [ clientes, setClientes] = useState();
      const [ pesquisa , setPesquisa ] = useState();
   
   ///const api = configApi();

         useEffect( ()=>{
 
         async function busca(){
             try{
             const aux = await api.get(`/next/clientes/${pesquisa}`);
             setClientes(aux.data)
         }catch(e){ console.log(e)}
         }
     busca()
     } , [ pesquisa  ])

 const router = useRouter();

function handleClick( item:client ){
    router.push(`/clientes/${item}`)
}
    return(
        <div className=" min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full  justify-itens-center items-center   bg-gray-100">


            <div className="w-4/5 p-8 min-h-screen  rounded-lg bg-white shadow-md " >
            <div className="m-5  ">
            <h1 className="text-4xl  font-sans font-bold  ">
               Clientes
            </h1>
         </div>
                 <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                    onChange={(e)=> setPesquisa(e.target.value) }
                    placeholder="pesquisar"
                    className="shadow-md"
                    />
                    <Button type="submit" 
                    className="shadow-md"  
                    > Pesquisar</Button>
             </div>


         <div className="w-full mt-4  shadow-lg rounded-lg">
            <Table  className="w-full bg-white rounded-xl ">
            <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px] text-lg text-center"><Checkbox/> </TableHead>
                        <TableHead className="  text-lg">Codigo</TableHead>
                        <TableHead className=" text-lg " >Nome</TableHead>
                        <TableHead className=" text-lg " > cnpj</TableHead>
                        <TableHead className=" text-lg " > </TableHead>

                        </TableRow>
            </TableHeader>
            <TableBody>

                {
                    clientes.length > 0 &&
                    clientes.map((i)=>(
                        <TableRow  
                        className="h-14 justify-center items-center"
                        key={i.codigo}
                        > 
                        <TableCell className=" text-center font-bold text-gray-600">  <Checkbox/> </TableCell>
                        <TableCell className=" text-left   font-bold text-gray-600"> {i.codigo} </TableCell>
                        <TableCell className=" text-left   font-bold text-gray-600">   {i.nome}      </TableCell>
                        <TableCell className=" text-left   font-bold text-gray-600">   {i.cnpj}   </TableCell>
                        <TableCell className=" text-left   font-bold text-gray-600">  
                        <Button type="submit" className="rounded-2xl">
                            <Edit className="h-5 w-5 transition-all" 
                                onClick={()=>handleClick(i)}
                                />
                        </Button>
                        </TableCell>
                        </TableRow>

                    ))   
                }
            </TableBody>

            </Table>
            </div>
        </div>

        </div>
    )
}