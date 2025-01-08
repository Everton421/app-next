


'use client'

import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";


export default function Pedidos(){
     const [dados, setDados] = useState([]);
     const [ pesquisa , setPesquisa ] = useState('1');
     const [ codigoPedido, setCodigoPedido ] = useState();
 
     const router = useRouter() 

    useEffect( ()=>{
        async function busca(){
          try{
          let aux = await api.get(`/pedidos`,{
            params:{
                data: '2024-10-04 00:00:00',
                vendedor:110
            }
          });
        //  console.log(aux.data)
          setDados(aux.data)
        }catch(e){ console.log(e)}
        }
  busca()
  
      } , [  ])


        function handleOrder(codigo:number){  
         // setCodigoPedido(codigo);
             router.push(`/pedidos/${codigo}`)
        }

        function new_order(){
          router.push(`/pedidos/novo`)
        }

    return (
        <div className=" min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full  justify-itens-center items-center   bg-gray-100"  >
        <div  className=" w-9/12  mt-22 ">

        <div className="m-5  ">
            <h1 className="text-4xl  font-sans font-bold  ">
               Pedidos
            </h1>
         </div>


            <div className="w-full justify-around flex ">
               <div  className=" my-2.5 w-full  ">
                <Input placeholder="pesquisar" className="bg-white rounded-3xl shadow-neutral-400 w-2/4  " 
                onChange={(v)=>setPesquisa(v.target.value) }
                  />
              </div>  
              
              <div>
          <Button onClick={()=>new_order() }>
            novo
          </Button>
              </div>
            
            </div>
        
            
            {

            dados.length > 0 ?
              (
                  <Table  className="w-full bg-white rounded-xl ">
                  <TableHeader>
                    <TableRow>
                      <TableHead className=" text-lg" >Codigo</TableHead>
                      <TableHead  className="text-lg"> Cliente</TableHead>
                      <TableHead className="text-lg text-center "  > Contato</TableHead>
                      <TableHead className="text-lg text-center "  > Vendedor</TableHead>
                      <TableHead className="text-center text-lg">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>

                 { dados.length > 0 &&
                    dados.map((i:any)=>(

                          <TableRow key={ i.codigo } onClick={ ( )=>handleOrder(i.codigo) }> 
                            <TableCell className="font-medium text-center font-bold text-gray-600">    {i.codigo}          </TableCell>
                            <TableCell className=" w-100 font-medium  font-bold text-gray-600 ">{i.cliente.nome}</TableCell>
                            <TableCell className=" w-80 font-medium text-center font-bold text-gray-600" >{ i.contato } </TableCell>
                            <TableCell className=" w-80 font-medium text-center font-bold text-gray-600" >{ i.vendedor } </TableCell>
                            <TableCell className=" w-40 font-medium text-center font-bold text-gray-600 ">  R$  {i?.total_geral.toFixed(2)}</TableCell>
                          </TableRow>

                      ) )
                    }
                  </TableBody>
                  </Table>
                ) : (
                 <p > nenhum orcamento encontrado!</p>
              )
          }
      
          
          </div>
        </div>
)
}