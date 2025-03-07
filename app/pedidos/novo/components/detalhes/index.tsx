import { Textarea } from "@/components/ui/textarea";
import { FunctionComponentElement, FunctionComponentFactory, useEffect, useState } from "react";
import { Check, CheckCheck, ClipboardCheck, ClipboardPenLine, X } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";


 

export default function Detalhes ({ obsPedido, setObsPedido, situacao, setSituacao}){


    const [ observacoes, setObservacoes ] = useState<string>()

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

        function styleStatus( status:string ){

            if( status === 'EA'){
                return "bg-green-700   p-1 rounded-sm"
            } 
        }


    return(
        <div className=" w-full  ">

                <div className="w-3/4 bg-white rounded-sm p-5 shadow-md">
                   <h3 className="text-gray-500 font-bold text-3xl">
                      Situação
                   </h3>


                            <TableRow   > 

                                 <TableCell className=" w-40    text-center font-bold text-gray-600 cursor-pointer"
                                    onClick={()=> setSituacao('EA')}
                                 >
                                   { 
                                     <div className="items-center justify-center flex gap-1" >
                                       <div 
                                       className={ situacao == 'EA' ? "bg-green-700  p-1 rounded-sm text-gray-600"  :  "bg-gray-300  p-1 rounded-sm "  }
                                       >
                                       
                                       <Check size={20} color="#FFF" /> 
                                      </div>
                                      <span className= {    situacao == 'EA' ? "text-center " : "text-center text-gray-300"   } > orçamento</span>
                                     </div>
                                      
                                     }
                                 </TableCell>

                                 <TableCell className=" w-40    text-center font-bold text-gray-600 cursor-pointer"
                                    onClick={()=> setSituacao('RE')}
                                 > 
                                      <  div className="items-center justify-center flex gap-1" >
                                          <div  
                                       className={ situacao == 'RE' ? "bg-red-600  p-1 rounded-sm text-gray-600"  :  "bg-gray-300  p-1 rounded-sm "  }
                                          >  
                                          <X size={20} color="#FFF"/>  </div>
                                          <span className= {    situacao == 'RE' ? "text-center " : "text-center text-gray-300"   } > reprovado</span>
                                        </div> 
                                 </TableCell>

                                   <TableCell className=" w-40    text-center font-bold text-gray-600 cursor-pointer"
                                    onClick={()=> setSituacao('AI')}
                                   > 
                                   <  div className="items-center justify-center flex gap-1" >
                                    {  <div
                                     className={ situacao == 'AI' ? "bg-blue-400  p-1 rounded-sm text-gray-600"  :  "bg-gray-300  p-1 rounded-sm "  }
                                     > 
                                        
                                        <CheckCheck size={20} 
                                           color="#FFF"
                                           />
                                          </div>  }
                                             <span className= {    situacao == 'AI' ? "text-center " : "text-center text-gray-300"   } > pedido</span>
                                          </div> 
                                   </TableCell>

                                   <TableCell className=" w-40    text-center font-bold text-gray-600 cursor-pointer"
                                    onClick={()=> setSituacao('FI')}
                                   > 
                                   < div className="items-center justify-center flex gap-1" >
                                      <div
                                     className={ situacao == 'FI' ? "bg-blue-400  p-1 rounded-sm text-gray-600"  :  "bg-gray-300  p-1 rounded-sm "  }
                                        >
                                       <ClipboardCheck size={20} color="#FFF" /> </div>  
                                       <span className= {    situacao == 'FI' ? "text-center " : "text-center text-gray-300"   } > faturado</span>

                                   </div> 
                                   </TableCell>
                                 
                               
                                 
          </TableRow>
                </div>
                
            <div className=" w-3/4  shadow-md">
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