'use client'

import { api } from "@/app/services/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react"

export default function Pedido({params}){

    const [ orcamento, setOrcamento ] = useState();

    useEffect(()=>{

        async function filtro(){
            try{    
            const response = await api.get(`pedidos/${params.codigo}`) 
            console.log(response)

            if(response.status === 200  ){
                setOrcamento(response.data)
            }

        }catch(e){console.log(e)}
        }
        filtro()
    },[])

    return (
              <div className=" min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full  justify-itens-center items-center   bg-gray-100"  >
       
       {   orcamento &&

        <h1 className=" text-3xl font-bold text-gray-600 "> Pedido : {orcamento.codigo }</h1>
        
        }
        <div className=" items-start flex">
        {   orcamento ? 
            (
                <div>

                    {
                    orcamento.cliente  && (
                        <div className="m-5 bg-white rounded-xl p-2 shadow-lg">
                             <span className="font-bold m-2 text-gray-600"> {orcamento.cliente.codigo}</span>
                             <span  className="font-bold m-2 text-gray-600"> Cliente: {orcamento.cliente.nome}</span>
                             <span className="font-bold m-2 text-gray-600"> cnpj: {orcamento.cliente?.cnpj}</span>
                        </div>
                    )    
                    }

                  {
                    orcamento.produtos.length > 0  && 
                     (
                        <Table  className="w-full bg-white rounded-xl  ">
                            <TableHeader>
                                <TableRow >
                                 <TableHead className=" font-bold text-xl   text-center" >produtos</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableHeader>
                                <TableRow>
                                  <TableHead  className=" text-lg" >Codigo</TableHead>
                                  <TableHead  className="text-lg"> descricao</TableHead>
                                  <TableHead  className="text-lg text-center "  > quantidade</TableHead>
                                  <TableHead  className="text-center text-lg">preco</TableHead>
                                  <TableHead  className="text-center text-lg">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                { orcamento.produtos.map((i)=>(
                                      <TableRow key={ i.codigo } onClick={ ( )=>console.log(i.codigo) }> 
                                      <TableCell className="font-medium text-center font-bold text-gray-600">    {i.codigo}          </TableCell>
                                      <TableCell className=" w-100 font-medium  font-bold text-gray-600 ">{i.descricao}</TableCell>
                                      <TableCell className=" w-80 font-medium text-center font-bold text-gray-600" >{ i.quantidade } </TableCell>
                                      <TableCell className=" w-40 font-medium text-center font-bold text-gray-600 ">  R$  {i?.preco.toFixed(2)}</TableCell>
                                      <TableCell className=" w-40 font-medium text-center font-bold text-gray-600 ">  R$  {i?.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                )) 
                                         
                                    }

                            </TableBody>
                  </Table>
                           
                      ) 
                  }

            {
                    orcamento.servicos.length > 0  && 
                     (
                        <Table  className="w-full bg-white rounded-xl ">
                            <TableHeader>
                                <TableRow>
                                <TableHead className=" text-lg" >Codigo</TableHead>
                                <TableHead  className="text-lg"> Aplicação</TableHead>
                                <TableHead className="text-lg text-center " > Quantidade</TableHead>
                                <TableHead className="text-center text-lg">Preço</TableHead>
                                <TableHead className="text-center text-lg">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                { orcamento.servicos.map((i)=>(
                                      <TableRow key={ i.codigo } onClick={ ( )=>console.log(i.codigo) }> 
                                      <TableCell className="font-medium text-center font-bold text-gray-600">    {i.codigo}          </TableCell>
                                      <TableCell className=" w-100 font-medium  font-bold text-gray-600 ">{i.aplicacao}</TableCell>
                                      <TableCell className=" w-80 font-medium text-center font-bold text-gray-600" >{ i.quantidade } </TableCell>
                                      <TableCell className=" w-40 font-medium text-center font-bold text-gray-600 ">  R$  {i?.valor.toFixed(2)}</TableCell>
                                      <TableCell className=" w-40 font-medium text-center font-bold text-gray-600 ">  R$  {i?.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                )) 
                                    }

                            </TableBody>
                  </Table>
                           
                      ) 
                  }

                  <div className=" flex w-gull items-center justify-center gap-10 m-4 bg-white rounded-xl p-2 shadow-lg">

                     <h2 className=" font-bold text-gray-600">
                        total: R$ {orcamento?.total_geral.toFixed(2)}
                    </h2>
                    <h2 className="font-bold text-gray-600">
                    Total Produtos R$: {orcamento?.total_produtos.toFixed(2)}
                    </h2>
                    <h2 className="font-bold text-gray-600">
                    Total Serviços R$: {orcamento?.total_servicos.toFixed(2)}
                    </h2>
                    <h2 className="font-bold text-gray-600">
                    descontos R$: {orcamento?.descontos.toFixed(2)}
                    </h2>
                  </div>
                        </div>
                    ):(
                 <h2>null</h2>
              )   
                
        }
            </div>
             </div>

    )
}