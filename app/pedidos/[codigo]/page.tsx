'use client'

 
import MainPedido from "../components/main";

export default function Pedido({params}){
 
return(
       <>
       {
        params !== null &&
        <MainPedido codigo_pedido={params.codigo}/>
       }
       </>
    )
}