import { Textarea } from "@/components/ui/textarea";
import { FunctionComponentElement, FunctionComponentFactory, useEffect, useState } from "react";


 

export default function Detalhes ({ obsPedido, setObsPedido}){


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

    return(
        <div className=" w-full  ">
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