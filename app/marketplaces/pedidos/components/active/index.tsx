// Componente filho (Active)
import { Check, X } from "lucide-react"
import { useState } from "react"

interface props  {
    active:string | undefined,
    handleActive:  any
}

export function Active( {active, handleActive}:props ){

    const [isActive, setIsActive] = useState(active === 'S'); // Estado local para controlar a seleção

    const handleClickAtivo = () => {
        handleActive("S");
        setIsActive(true);
    };

    const handleClickInativo = () => {
        handleActive("N");
        setIsActive(false);
    };


    return(
        <div className=" w-full flex m-3">
        <div className="flex m-3 gap-3 cursor-pointer " onClick={ handleClickAtivo }>
            {
                 isActive  ? (
                    <>
                <span className="font-bold ">ativo</span> 
                    <div className=" bg-green-700   p-1  w-7 rounded-sm"> <Check size={20} color="#FFF"   />  </div>
                </>
                ):(
                    <>
                <span className="font-bold text-gray-300"> ativo</span> 
                    <div className=" bg-gray-300   p-1  w-7 rounded-sm"> <Check size={20}    />  </div>
                </>
                )
            }
        
        </div>

        <div className="flex m-3 gap-3 cursor-pointer" onClick={ handleClickInativo } >
            { 
               !isActive ? 
                (<>
                    <span className="font-bold "> inativo</span> 
                    <div className="bg-red-600  p-1  w-7 rounded-sm">   <X size={20} color="#FFF" /> </div>
                </>
                ):(
                    <>
                            <span className="font-bold text-gray-300"> inativo</span> 
                            <div className="bg-gray-300  p-1  w-7 rounded-sm">   <X size={20}   /> </div>
                    </>
                )

            }
        </div>
 </div>
    )
}