
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { AlignLeft, Check, Edit, Plus, Tag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { configApi } from "../services/api";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FiltroVeiculos } from "./components/filtroVeiculos";
import { Checkbox } from "@radix-ui/react-checkbox";

export default function Veiculos(){
      
      const [pesquisa, setPesquisa] = useState<any>();
      const router = useRouter();
      const [isLoading, setIsLoading] = useState(false);  
      const [ veiculos, setVeiculos ] = useState();
      const [ filtroAtivo, setFiltroAtivo ] = useState<'S'| 'N' >('S');

  const { user, loading: authLoading }: any = useAuth();
  const api = configApi();


      async function busca( ) {
   //     if (!user?.cnpj) return;
   //     setIsLoading(true);
   //     const query = term.trim() === '' ? '1' : term.trim();
        
        let param;

            if( isNaN(pesquisa)){
                param =
                 {
                    modelo:pesquisa,
                    ativo: filtroAtivo,
                   }
            }
            
            if( !isNaN(pesquisa)){
                param =
                 {
                    codigo:pesquisa,
                    ativo: filtroAtivo,
                   }
            }

        
         try {
          const aux = await api.get(`/veiculos`, {
            headers: {
              cnpj: Number(user.cnpj),
            },
            params: param
          
          });
    
          if(aux.status === 200 ){
            setVeiculos(aux.data || []);
    
          }
        } catch (e) {
          console.error('Erro ao buscar veiculos:', e);
          
          setVeiculos([]);
        } finally {
          setIsLoading(false);
        }
      }


      useEffect(() => {
        busca()
        },[ pesquisa, filtroAtivo ])


    return (

        <div className=" min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full justify-itens-center items-center   bg-slate-100"  >
          <div className="w-5/6 p-8 mt-22 h-screen    rounded-lg bg-white shadow-md " >
            <div className="p-2 rounded-sm bg-slate-100">
       
                <div className="m-5  flex justify-between   ">
                      <h1 className="text-3xl md:text-4xl font-bold font-sans text-gray-800">
                            Veículos
                      </h1>
               </div>



        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6  ">
            <div className="flex md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3" >
            <Input
                placeholder="Pesquisar por código ou descrição..."
                className="shadow-md flex-grow bg-white" // Takes available space
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
            />
            </div>

           
            <Checkbox className="bg-red-500"/>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 md:mt-0">
                <Button type="button" className="shadow-sm w-full sm:w-auto" 
                    onClick={()=> router.push('/veiculos/novo')}
                >
                    <Plus className="h-4 w-4 mr-2" /> Novo
                </Button>
    
            <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="flex items-center gap-1" title="Ativo">
                { filtroAtivo === 'S' ?
                    ( <Button onClick={()=> setFiltroAtivo('S')}
                    className="bg-green-600 p-1 w-6 h-6 rounded-sm flex items-center justify-center">
                    <Check size={16} color="#FFF" strokeWidth={3} />
                    </Button> ) :(
                    <Button onClick={()=> setFiltroAtivo('S')}
                        className="bg-gray-400 p-1 w-6 h-6 rounded-sm flex items-center justify-center">
                    <Check size={16} color="#FFF" strokeWidth={3} />
                    </Button>    
                    )
                } 
                </div>

                <div className="flex items-center gap-1" title="Inativo">
                { filtroAtivo === 'N' ? (
                    <Button  onClick={()=> setFiltroAtivo('N')}
                    className="bg-red-600 p-1 w-6 h-6 rounded-sm flex items-center justify-center">
                    <X size={16} color="#FFF" strokeWidth={3} />
                    </Button>
                    ) : (
                    <Button onClick={()=> setFiltroAtivo('N')}
                    className="bg-gray-400 p-1 w-6 h-6 rounded-sm flex items-center justify-center">
                    <X size={16} color="#FFF" strokeWidth={3} />
                    </Button>
                    )
                }
                
                </div>
            </div>
            </div> 

        </div> 
                
      
      </div>

         <div className="w-full mt-4  h-screen shadow-lg ">
      
        <Table  className="w-full  bg-gray-100 rounded-sm ">
            <TableHead className= " w-[5%]   text-base">Codigo</TableHead>
            <TableHead className= " w-[40%]  text-base   " >Modelo</TableHead>
            <TableHead className="  w-[15%] text-base " > Marca</TableHead>
            <TableHead className="  w-[15%] text-base " > Placa</TableHead>
            <TableHead className="  w-[15%] text-base " > Ano</TableHead>

         <TableHead className=" text-base" > </TableHead>
      
         </Table >

          { 
           veiculos && veiculos.length > 0 ?
            (


            <ScrollArea className="w-full mt-4  h-4/6 overflow-auto  shadow-lg rounded-lg  ">
            <Table  className="w-full bg-white rounded-xl ">

            <TableBody>
            { 
                veiculos.length > 0 && 
                veiculos.map(( i:any )=>(
                        <TableRow  
                        className="h-14 justify-center items-center"
                        key={i.codigo}
                        > 
                        
                        <TableCell className="p-3 text-center font-medium text-gray-700 whitespace-nowrap w-[80px]" >  {i.codigo}     </TableCell>
                        <TableCell className="p-3 text-left text-gray-600 w-[40%]"> {i?.modelo ?? ''}  </TableCell>
                        <TableCell className="p-3 text-left text-gray-600 whitespace-nowrap w-[15%]">  { i.marca ?? '' } </TableCell>
                        <TableCell className="p-3 text-left text-gray-600 whitespace-nowrap w-[15%]">  { i.placa ?? '' } </TableCell>

                        <TableCell className="p-3 text-left text-gray-600 whitespace-nowrap w-[15%]">  { i.ano ?? '' } </TableCell>

                        <TableCell className=" text-left   font-bold text-gray-600">  
                <div className="flex items-center justify-center gap-2">
                        
                                <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                       onClick={() => router.push(`/veiculos/${i.codigo}`)}
                                        title="Editar Produto"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                        <div
                            className={`p-1 w-6 h-6 rounded-sm flex items-center justify-center ${
                                i.ativo === 'S' ? 'bg-green-600' : 'bg-red-600'
                            }`}
                            title={i.ativo === 'S' ? 'Ativo' : 'Inativo'}
                            >
                            {i.ativo === 'S' ? (
                                <Check size={16} color="#FFF" strokeWidth={3} />
                            ) : (
                                <X size={16} color="#FFF" strokeWidth={3} />
                                )}
                            </div>
                        </div>

                        </TableCell>

                        
                        {/*<TableCell className=" text-left   font-bold text-gray-600">  
                            { i.ativo == "S" ? 
                                (
                                    <div className=" bg-green-700   p-1  w-7 rounded-sm"> <Check size={20} color="#FFF"   />  </div>
                                    ) : (
                                        <div className="bg-red-600  p-1  w-7 rounded-sm">   <X size={20} color="#FFF" /> </div>
                                )   }    
                        </TableCell> */}
                        </TableRow>
                        )
                    )
                }
            </TableBody>
            
            </Table>
            </ScrollArea>
            ):(
            <span className="text-xl text-gray-500 text-center m-7 "> nenhum veículo encontrado!</span>

            )  
            }         
   
        </div>
         </div>
       </div>
           
       )
}