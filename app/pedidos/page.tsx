


'use client'

import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export default function Pedidos(){
    const [dados, setDados] = useState([]);
    const [ pesquisa , setPesquisa ] = useState('1');


    useEffect( ()=>{
        async function busca(){
          try{
          let aux = await api.get(`/pedidos`,{
            params:{
                data: '2024-10-04 00:00:00',
                vendedor:110
            }
          });
          console.log(aux.data)
          setDados(aux.data)
        }catch(e){ console.log(e)}
        }
  busca()
  
      } , [  ])


    return (
        <div className=" flex flex-col sm:ml-14 p-4 w-full h-full  justify-itens-center items-center   bg-gray-100"  >
        <div  className=" w-9/12  mt-22 ">
      
            <div className="w-full ">
               <div  className=" my-2.5 w-full  ">
                <Input placeholder="pesquisar" className="bg-white rounded-3xl shadow-md w-2/4 " 
                onChange={(v)=>setPesquisa(v.target.value) }
                  />
              </div>  
            </div>
          <Table  className="w-full bg-white rounded-xl ">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Codigo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            
            {

            dados.length > 0 ? 
            dados.map((i:any)=>(
                  <TableRow> 
                    <TableCell className="font-medium">    {i.codigo}   </TableCell>
                    <TableCell className=" w-100">{i.cliente.nome}</TableCell>
                    <TableCell className=" w-45" >{ i.contato } </TableCell>
                    <TableCell className="text-right  w-10 ">  R$  {i.total_geral}</TableCell>
                  </TableRow>
              )
              )
              : (
                <p > nenhum orcamento encontrado!</p>
              )
          }
      
            </TableBody>
          </Table>
          </div>
        </div>
)
}