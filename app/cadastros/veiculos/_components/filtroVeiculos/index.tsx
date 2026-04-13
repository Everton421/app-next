import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover"
import { Button } from "@/components/ui/button";
import { Checkbox } from "@radix-ui/react-checkbox";
import { ListFilter } from "lucide-react";
import { useState } from "react";


export const FiltroVeiculos  = ( )=>{
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
                        <input
                         type="checkbox"
                        />
                     <span className=" ml-2    font-bold"> codigo </span>

                </div>                     
             </PopoverContent>
      </Popover>
    )
}