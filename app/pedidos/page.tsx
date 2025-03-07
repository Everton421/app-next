


'use client'

import { useContext, useEffect, useState } from "react";
import { configApi } from "../services/api";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { Check, CheckCheck, ClipboardCheck, ClipboardPenLine, Printer, X } from "lucide-react";
import AuthContex from "@/contexts/AuthContext";


export default function Pedidos(){
     const [dados, setDados] = useState([]);
     const [ pesquisa , setPesquisa ] = useState('1');
     const [ codigoPedido, setCodigoPedido ] = useState();
 
   const router = useRouter() 
   const api = configApi();
   const { nomeVendedor, setNomeVendedor, setCodigoVendedor, codigoVendedor } = useContext(AuthContex);


    useEffect( ()=>{
        async function busca(){
          try{
          let aux = await api.get(`/next/pedidoSimples`,{
            params:{
                data: '2025-01-01 00:00:00',
                vendedor:codigoVendedor
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
                    <TableHead className=" text-lg text-center " > </TableHead>
                      <TableHead className=" text-lg text-center " >Codigo</TableHead>
                      <TableHead  className="text-lg text-center "> Cliente</TableHead>
                      <TableHead className="text-lg text-center "  > Vendedor</TableHead>
                      <TableHead className="text-center text-lg">Total</TableHead>
                          <TableHead className="text-center text-lg">
                             <Printer size={20} color="#000" /> 
                         </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>

                 { dados.length > 0 &&
                    dados.map((i:any)=>(

                          <TableRow key={ i.codigo } onClick={ ( )=>handleOrder(i.codigo) }   className="cursor-pointer" > 
                            
                            <TableCell className="   text-center font-bold text-gray-600">
                                  {i.situacao  === 'RE' &&  <div className="bg-red-600    p-1  w-7 rounded-sm"> <X size={20} color="#FFF"/>  </div>}
                                  {i.situacao  === 'EA' &&  <div className="bg-green-700  p-1  w-7 rounded-sm">   <Check size={20} color="#FFF" /> </div>}
                                  {i.situacao  === 'AI' &&  <div className="bg-blue-400   p-1  w-7 rounded-sm"> <CheckCheck size={20} color="#FFF" /> </div>}
                                  {i.situacao  === 'FI' &&  <div className="bg-orange-500 p-1  w-7 rounded-sm"> <ClipboardCheck size={20} color="#FFF" /> </div>}
                                  {i.situacao  === 'FP' &&  <div className="bg-blue-700   p-1  w-7 rounded-sm">    <ClipboardPenLine size={20} color="#FFF" /></div>}
                                 
                                </TableCell>

                            <TableCell className="   text-center font-bold text-gray-600">    {i.codigo}  </TableCell>
                            <TableCell className=" w-100    text-center font-bold text-gray-600 ">{i.nome}</TableCell>
                            <TableCell className=" w-80    text-center font-bold text-gray-600" >{ i.vendedor } </TableCell>
                            <TableCell className=" w-40    text-center font-bold text-gray-600 ">  R$  {i?.total_geral.toFixed(2)}</TableCell>
                             
                            <TableCell className="      text-center font-bold text-gray-600 "
                            // onClick={()=>{console.log('print')}}
                              >  
                              <div className="bg-black  p-1  w-7 rounded-sm">
                                <Printer size={20} color="#FFF" />
                              </div>
                            </TableCell>

                          </TableRow>

                      ) )
                    }
                  </TableBody>
                  </Table>
                ) : (
                 <p > nenhum orcamento encontrado!</p>
              )
          }
      
      <div className="bg-gray-100 p-2  sm:ml-14  fixed bottom-0 left-0 right-0 rounded-xl shadow-md  ">
          <div className="">
          <TableRow   > 

                                 <TableCell className=" w-40    text-center font-bold text-gray-600 ">
                                   { 
                                     <div className="items-center justify-center flex gap-1" >
                                       <div className="bg-green-700   p-1 rounded-sm">
                                       <Check size={20} color="#FFF" /> 
                                      </div>
                                      <span className="text-center  ">orçamento</span>
                                     </div>
                                      
                                     }
                                    </TableCell>
                                 <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                      <  div className="items-center justify-center flex gap-1" >
                                          <div className="bg-red-600     p-1   rounded-sm" >  
                                          <X size={20} color="#FFF"/>  </div>
                                        <span className="text-center  ">reprovado</span>
                                        </div> 
                                   </TableCell>

                                   <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                   <  div className="items-center justify-center flex gap-1" >
                                    {  <div className="bg-blue-400    p-1  rounded-sm" > <CheckCheck size={20} color="#FFF" /> </div>  }
                                    <span className="text-center  ">pedido</span>
                                          </div> 
                                   </TableCell>

                                   <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                   < div className="items-center justify-center flex gap-1" >
                                      <div className="bg-orange-500  p-1   rounded-sm" >
                                       <ClipboardCheck size={20} color="#FFF" /> </div>  
                                       <span className="text-center  ">faturado</span>
                                   </div> 
                                   </TableCell>
                                 
                                   <TableCell className="     text-center font-bold text-gray-600 "> 
                                   < div className="items-center justify-center flex gap-1" >
                                     <div className="bg-blue-700    p-1  rounded-sm">
                                        <ClipboardPenLine size={20} color="#FFF" />
                                     </div>    
                                      <span className="text-center  ">faturado parcialmente</span>
                                    </div> 
                                   </TableCell>
                                 
          </TableRow>

          </div>
      </div>
          
          </div>
        </div>
)
}