import { configApi } from "@/app/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";


type props = {
    codigoForma:number,
    setCodigoForma:()=>{},
    setFormaSelecionada: (value:any)=>{},
    formaSelecionada:{},
}

export const SelectFormasPagamento = ({codigoForma, setCodigoForma, formaSelecionada, setFormaSelecionada }: props )=>{

        const [ dados , setDados ] = useState([])

    const api = configApi();
         const { user }:any = useAuth();

    async function buscaFormas_Pagamento (){
        const response = await api.get("/offline/formas_Pagamento",

            { headers:{ cnpj: Number(user.cnpj)}}
        )
        if(response.status == 200 ){
              
                    //if(  response.data.length > 0 && forma_pagamento > 0){
                    //    setFormaSelecionada(response.data.find((v)=> v.codigo === forma_pagamento)) 
                    // } 
                    // 

            setDados(response.data)
        }
    }
    
     function selecFpgt ( fpgt ){
       setFormaSelecionada(fpgt)
    }

////////
    useEffect(()=>{
        buscaFormas_Pagamento()
        
    },[])
////////



    return(

     <div className=" w-full     ">
       <div className="flex">
        <Select onValueChange={selecFpgt}  >
            <SelectTrigger className="w-[200px] bg-white rounded-lg shadow-md">
                <SelectValue placeholder="Formas De Pagamento" />
            </SelectTrigger>
            <SelectContent className=" bg-white">
                    {
                        dados.length > 0 ? (
                         dados.map( (i:any)=>(
                            <SelectItem className="shadow-md m-2 cursor-pointer"   value={i}   key={i.codigo} > {i.codigo} {i.descricao}   Qtd parcelas: { i.parcelas}</SelectItem>
                         ))
                        ) : (
                            <span> Nenhum item encontrado!</span>
                        )
                    }
           
            </SelectContent>
        </Select>
        
        { formaSelecionada &&    
          <div className="w-[40%] ml-[20%]  bg-white rounded-md shadow-md ">                  
                <span className="text-gray-500 font-bold text-xl ml-3">
              {  formaSelecionada?.descricao} 
                </span>
          </div>
           }
      </div>

  

 </div>
    )
}