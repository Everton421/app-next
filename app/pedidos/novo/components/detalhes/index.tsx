import { Textarea } from "@/components/ui/textarea";
import { FunctionComponentElement, FunctionComponentFactory, useEffect, useState } from "react";
import { Check, CheckCheck, ClipboardCheck, ClipboardPenLine, X } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";


 

export default function Detalhes ({ obsPedido, setObsPedido}){


    const [ observacoes, setObservacoes ] = useState<string>()
    const [ situacao, setSituacao ] = useState('EA')

    useEffect(
        ()=>{
            function init(){
                if(  obsPedido ){
                    setObservacoes(obsPedido)
                }
            }
            init();
        },[]
    )

        function handleObs(v:string){
            setObsPedido(v)
            setObservacoes(v)
        }

    return(
        <div className=" w-full  ">

                <div className="w-3/4 bg-white rounded-sm">
                   <h3 className="text-gray-500 font-bold text-3xl">
                      Situação
                   </h3>


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
                                    {  <div className="bg-blue-400    p-1  rounded-sm" > 
                                        
                                        <CheckCheck size={20} 
                                        color="#FFF"
                                         />
                                          </div>  }
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
                                 
                               
                                 
          </TableRow>
                </div>
                
            <div className=" w-3/4">
                <h2 className="text-gray-500 font-bold text-3xl">
                    observações
                </h2>
                
                <Textarea
                className="bg-white mt-2"
                placeholder="observações..."
                    value={observacoes}
                    onChange={(v)=> handleObs(v.target.value)}
                />
            </div>
        </div>
    )    

}