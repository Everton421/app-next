
'use client'
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody,   TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation'
import { configApi } from "../services/api";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export default function Produtos(){

  const [likes, setLikes] =  useState(0);
  const [ pesquisa , setPesquisa ] = useState();
  const  [ codigo, setCodigo ] = useState<number>();
  const router = useRouter();
  const api = configApi();

    const [produtos, setProdutos] =  useState ([ 
     
    ]);



    useEffect( ()=>{

      async function busca(){
        try{
        const aux = await api.get(`/next/produtos/${pesquisa}`);
          setProdutos(aux.data)
      }catch(e){ console.log(e)}
      }
busca()

    } , [ pesquisa  ])

    function handleClick(i) {
     setCodigo(i);
     router.push(`/produtos/${i}`)
 
      }

    return (

    
  


 <div className= " min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full  justify-itens-center items-center   bg-gray-100"  >
  
  <div className="w-4/5 p-8 min-h-screen  rounded-lg bg-white shadow-md " >

          <div className="m-5  ">
            <h1 className="text-4xl  font-sans font-bold  ">
               Produtos
            </h1>
         </div>
         <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                    placeholder="pesquisar"
                    className="shadow-md"
                    />
                    <Button type="submit" 
                    className="shadow-md"  
                    > Pesquisar</Button>
             </div>
   


      <div className="w-full mt-4  shadow-lg rounded-lg">
       

              <Table  className="w-full bg-white rounded-xl ">
                <TableHeader>
                  <TableRow>
                  <TableHead className="w-[100px] text-lg text-center"><Checkbox/> </TableHead>
                    <TableHead className="w-[100px] text-lg">Codigo</TableHead>
                    <TableHead className="  text-lg " >Descricao</TableHead>
                    <TableHead className="  text-lg " > Preco</TableHead>
                    <TableHead  className=" text-lg"   >Estoque</TableHead>
                    <TableHead className=" text-lg " > </TableHead>

                  </TableRow>
                </TableHeader>

              <TableBody>
           {
                produtos.length > 0 && 
                  produtos.map(( i )=>(
                        <TableRow  
                        className="h-14 justify-center items-center"
                        key={i.codigo}
                        > 
                        
                          <TableCell className=" text-center font-bold text-gray-600"       >  <Checkbox/>   </TableCell>
                          <TableCell className=" text-left   font-bold text-gray-600"        >    {i.codigo}   </TableCell>
                          <TableCell className=" text-left   font-bold text-gray-600 w-100"  >{i.descricao}</TableCell>
                          <TableCell className=" text-left   font-bold text-gray-600"       > R$ { i?.preco } </TableCell>
                          <TableCell className=" text-left   font-bold text-gray-600"       >{i.estoque}</TableCell>
                          <TableCell className=" text-left   font-bold text-gray-600">  
                              <Button type="submit" className="rounded-2xl">
                                  <Edit className="h-5 w-5 transition-all" 
                                      onClick={()=>handleClick(i.codigo)}
                                      />
                              </Button>
                              </TableCell>
                        </TableRow>
                        )
                    )
                  }
              </TableBody>
              
              </Table>
           
               
    </div>

    
    </div>
  </div>
    
)
}