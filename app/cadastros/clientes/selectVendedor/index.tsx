import { configApi } from "@/app/services/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
  
export const SelectVendedor = ({ defaultVendedor, onChangeVendedor  }: any ) => {

    let api = configApi();
    const [ vendedores, setVendedores ] = useState([]);
    const { user, loading }: any = useAuth();

    const handleSelect = async (value:any) => {
        onChangeVendedor(value)
        console.log(value)
    };


    ///////
    useEffect(()=>{
        async function busca(){
            let dadosVendedores = await api.get('/usuarios',{
              headers: { token:  user.token }
            }
            );
            if(dadosVendedores.data.length > 0 ){
                setVendedores(dadosVendedores.data)
            }
        }
        busca();
    },[ ])
      ///////
    return (
        <Select  defaultValue={defaultVendedor}    onValueChange={handleSelect} >
            <SelectTrigger className="w-[180px] bg-white">
                         <SelectValue placeholder="Vendedor" /> {/* Adicione um placeholder para melhor UX */}
            </SelectTrigger>
            <SelectContent>
                { 
                 vendedores.length > 0 ? ( 
                    vendedores.map((v:any)=>(
                        <SelectItem value={String(v.codigo)}  key={v.codigo}> { v.codigo } {v.nome}</SelectItem>
                    ))
                    ):(
                        < span className=" text-gray-500 font-bold  ">
                        Carregando...
                      </span>
                    )
                }
            </SelectContent>
        </Select>
    );
};