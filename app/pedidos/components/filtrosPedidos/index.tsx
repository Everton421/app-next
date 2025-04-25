import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover"
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { TipoPedidoSeletor } from "../tipoPedido";

type props ={
  setDataInicial:Dispatch<SetStateAction<string>>
    setDataFinal: Dispatch<SetStateAction<string>>
    dataInicial: string
    dataFinal: string
    filtrTipo:number,
     setFiltroTipo:Dispatch<SetStateAction<number>>
}

export const FiltroPedidos  = ({ setDataInicial, setDataFinal , dataInicial, dataFinal, filtrTipo, setFiltroTipo }:props)=>{
  const [date, setDate] =  useState<Date | undefined>(new Date())
 
  
    return(
        <Popover>
        <PopoverTrigger>  
              <Button    >
                       <ListFilter size={25} color="#FFF"/>
                     <span className=" ml-2 text-white font-bold"> Filtrar </span>
              </Button> 
       </PopoverTrigger>

         <PopoverContent className="bg-white w-full ">
                <div className="w-full  flex">
                  < label className="m-5 font-bold "> inicio</label>

                      <input 
                        type="date"
                        className="font-bold text-gray-500"
                        onChange={( v )=> setDataInicial(v.target.value)}  
                        defaultValue={dataInicial} 
                      />
                  
                  < label className="m-5 font-bold">  final</label>
                      <input 
                        type="date"
                        className="font-bold text-gray-500" 
                        onChange={(v)=> setDataFinal(v.target.value)} 
                        defaultValue={dataFinal} 
                        />
                 </div>                     
             
               <div className=" m-2">
                <TipoPedidoSeletor  setTipo={setFiltroTipo} tipo={filtrTipo}  />
              </div>
             </PopoverContent>

      </Popover>
    )
}