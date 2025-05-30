
import { configApi } from "@/app/services/api"
import { DateService } from "@/app/services/dateService";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";  
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { SelectFormasPagamento } from "../selectFormasPagamento";

type props = 
{
  dadosOrcamento:any 
  setDadosOrcamento:any 
  total:number
}
export default function Parcelas ( {  dadosOrcamento   }:props ){
  
    const dateService = DateService();
 
    type parcela = 
    {
       pedido:number,
       parcela:number,
       vencimento:string
       valor:number
    }
  
 
    return(
        <div className="relative p-4 w-full  ">
          
          
   

            <div className="w-[90%]  ">                        
                <Table className="w-[70%] bg-white m-2">
                <ScrollArea className="h-72 w-full" >

                        <TableBody>

                            {   dadosOrcamento?.parcelas && dadosOrcamento?.parcelas.length   > 0   &&  
                                         
                                          dadosOrcamento?.parcelas.map((i:parcela)=>(

                                                <TableRow key={ i?.parcela } className="shadow-lg rounded-xl" >

                                                        <TableCell className=" m-1 flex justify-between " key={i.parcela}  >
                                                            <div className="justify-around items-center flex  w-full ">                                                          
                                                               <span className=" text-gray-500 font-bold text-xl "  >
                                                                 parcela: {i.parcela}
                                                                </span> 
                                                               <span className=" text-gray-500 font-bold text-xl "  key={i.parcela} >
                                                                 total R$ { i?.valor.toFixed(2) } 
                                                               </span> 
                                                             </div>
                                                            <div className="p-1">
                                                                    <label className="text-gray-500 font-bold text-[15px] "> vencimento:  </label>
                                                                    <input 
                                                                        type="date"
                                                                        className="font-bold text-gray-500 bg-slate-300 p-1 rounded-sm" 
                                                                    //  onChange={(v)=> setDataFinal(v.target.value)} 
                                                                        defaultValue={i?.vencimento} 
                                                                        />
                                                            </div>
 
                                                         </TableCell>
                                                    </TableRow>
                                                 

                                                )
                                            )
                                 }

                              </TableBody>
                           </ScrollArea >

                </Table>
            </div>   

        </div>
    )
}