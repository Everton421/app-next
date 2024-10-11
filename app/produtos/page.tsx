
'use client'
import { api } from "../services/api"; 
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function Produtos(){

    const [likes, setLikes] =  useState(0);
    const [ pesquisa , setPesquisa ] = useState('1');

    const [produtos, setProdutos] =  useState<any>([ 
      {
        "codigo":1,
        "descricao":"teste",
        "estoque":5,
        "preco":1
       },
       {
        "codigo":2,
        "descricao":"teste2",
        "estoque":52,
        "preco":1
       },
       {
        "codigo":3,
        "descricao":"teste3",
        "estoque":5,
        "preco":12
       }
    ]);


    async function filter(){
        try{
        let aux = await api.get('offline/produtos')
                console.log(aux.data)
                if(aux.status === 200 ){
                  setProdutos(aux.data)
                }
              }catch(e){console.log(e)}
    }   

    useEffect( ()=>{

      async function busca(){
        try{
        let aux = await api.get(`/acerto/produtos/${pesquisa}`);
          setProdutos(aux.data)
      }catch(e){ console.log(e)}
      }
busca()

    } , [ pesquisa  ])

    function handleClick() {
  //  filter();
        console.log( likes  );
      }

    return (

    
  


 <div className= " min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full  justify-itens-center items-center   bg-gray-100"  >
  <div  className=" w-9/12  mt-22 ">

          <div className="m-5  ">
            <h1 className="text-4xl  font-sans font-bold  ">
               produtos
            </h1>
         </div>

      <div className="w-full ">
         <div  className=" my-2.5 w-full  ">
          <Input placeholder="pesquisar" className="bg-white rounded-3xl shadow-neutral-400 w-2/4 " 
          onChange={(v)=>setPesquisa(v.target.value) }
            />
        </div>  
      </div>



    {
      produtos.length > 0 ? 
      (  

        <Table  className="w-full bg-white rounded-xl ">
          <TableHeader>
            <TableRow>
            <TableHead className="w-[100px] text-lg"></TableHead>
    
              <TableHead className="w-[100px] text-lg">Codigo</TableHead>
              <TableHead className=" text-lg " >Descricao</TableHead>
              <TableHead className=" text-lg " > Preco</TableHead>
              <TableHead  className=" text-lg"   >Estoque</TableHead>
            </TableRow>
          </TableHeader>

        <TableBody>
          {produtos.length > 0 && 
            produtos.map(( i:any )=>(
                  <TableRow> 
                  
                    <TableCell className="font-medium text-center font-bold text-gray-600 ">  <Checkbox/>   </TableCell>
                    <TableCell className="font-medium text-center font-bold text-gray-600 ">    {i.codigo}   </TableCell>
                    <TableCell className=" w-100 font-bold text-gray-600 ">{i.descricao}</TableCell>
                    <TableCell className="  font-bold text-gray-600" > R$ { i?.preco } </TableCell>
                    <TableCell className="text-right  w-10 text-center font-bold text-gray-600">{i.estoque}</TableCell>
                  </TableRow>
                  )
              )
            }
        </TableBody>
        
        </Table>
      )
        : (
          <p > nenhum produto encontrado!</p>
        )
    }

    
    </div>
  </div>
    
)
}