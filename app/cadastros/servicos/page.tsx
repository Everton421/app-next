'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Check, Edit, Plus, X } from "lucide-react";
import { config } from "process";
import { useEffect, useState } from "react";
import { configApi } from "../../services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { basicServico } from "@/types/servico";
import { ThreeDot } from "react-loading-indicators";


export default function servicos(){

const {user, loading }:any = useAuth();

 const [ pesquisa , setPesquisa ] = useState<string>('');
 const [ dados, setDados ] = useState();
 const [ servicos, setServicos ] = useState<basicServico[] | null >(null);
 const [ filtroAtivo, setFiltroAtivo ] = useState('S');
 const [isLoading, setIsLoading] = useState(false);  

    const api = configApi();
    const router = useRouter();

   
    async function busca(term: string) {
      setServicos([])
      setIsLoading(true)
      try{
        if(!user  ) return;
    const query = term.trim() === '' ? 'a' : term.trim();

        const  headers = { token:  user.token  }  
      let result = await api.get(`/servicos/search`, { 
          headers, 
          params:{
            aplicacao: query,
            ativo:filtroAtivo
          }
          
      })
          console.log("Data ",result.data)

      if( result.status === 200   ){
          setServicos( result.data);
          console.log("Data ",result.data)
      }
    }catch(e:any){
      console.log("Erro ",e.response)
    }finally{
      setIsLoading(false)
    }
    
    }


    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/'); // Redireciona para a página de login (ajuste se for outra)
        }
      }
    }, [ ]);
  
  
   useEffect(()=>{
       busca(pesquisa);
    },[ pesquisa, filtroAtivo, ])

   useEffect(()=>{
      busca(pesquisa);
    },[])
 
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
                  <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
        </div>
      );
    }
  
    if (!user) {
      return (
         <div className="flex justify-center items-center h-screen">
           <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
         </div>
      );
    }

    function handleClick(i:any) {
      router.push(`/cadastros/servicos/${i}`)
  
       }

    
       
    return(
      <div className=" min-h-screen flex flex-col sm:ml-52 p-2 sm:p-4 lg:p-6 w-full h-full justify-itens-center items-start   bg-slate-100 "  >
      <div className="    md:w-[85%]  p-2 mt-22 min-h-screen  rounded-lg bg-white   " >
        <div className="  p-2   rounded-sm bg-slate-100 w-full  ">

            <div className="m-2 flex flex-col md:flex-row justify-between">
              <h1 className="text-2xl md:text-4xl font-bold font-sans text-gray-800">
                Serviços
              </h1>

              <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="shadow-sm w-full sm:w-auto"
                  onClick={() => router.push('/cadastros/servicos/novo')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Serviço
                </Button>
              </div>
            </div>

            <div className="flex md:flex-row md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3">
              <div className="relative flex-grow">
                <Input
                  placeholder="Pesquisar por código ou descrição..."
                  className="shadow-sm flex-grow bg-white pl-10"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-4 m-3">
                <div className="flex items-center gap-1" title="Ativo">
                  {filtroAtivo === 'S' ?
                    (<Button onClick={() => setFiltroAtivo('S')}
                      className="bg-green-600 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                      <Check size={16} color="#FFF" strokeWidth={3} />
                    </Button>) : (
                      <Button onClick={() => setFiltroAtivo('S')}
                        className="bg-gray-400 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                        <Check size={16} color="#FFF" strokeWidth={3} />
                      </Button>
                    )
                  }
                </div>

                <div className="flex items-center gap-1" title="Inativo">
                  {filtroAtivo === 'N' ? (
                    <Button onClick={() => setFiltroAtivo('N')}
                      className="bg-red-600 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                      <X size={16} color="#FFF" strokeWidth={3} />
                    </Button>
                  ) : (
                    <Button onClick={() => setFiltroAtivo('N')}
                      className="bg-gray-400 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                      <X size={16} color="#FFF" strokeWidth={3} />
                    </Button>
                  )
                  }
                </div>
              </div>
            </div>
         </div>

            <div className="w-full mt-4  h-screen shadow-lg ">
                        <Table  className="w-full  bg-gray-100 rounded-sm ">
                           <TableHead className= " w-[7%]   text-xs md:text-base">Codigo</TableHead>
                           <TableHead className= " w-[75%]  text-xs md:text-base   " >aplicacao</TableHead>
                           <TableHead className="  w-[15%]  text-xs md:text-base " > Valor</TableHead>
                           <TableHead className=" text-base" > </TableHead>
                        </Table >
      { 
        servicos && servicos.length > 0 ?
        (
              <ScrollArea className="w-full mt-4  h-[80%] overflow-auto  shadow-lg rounded-lg  ">
                    <Table  className="w-full bg-white rounded-xl ">
       
                    <TableBody>
                 { 
                      servicos.length > 0 && 
                        servicos.map(( i:basicServico )=>(
                              <TableRow  
                              className="h-14 justify-center items-center"
                              key={i.codigo}
                              > 
                              
                                <TableCell className=" text-xs md:text-base text-center font-medium text-gray-700 whitespace-nowrap w-[80px]" >  {i.codigo}     </TableCell>
                                <TableCell className=" text-xs md:text-base text-left text-gray-600 w-[75%]"> {i?.aplicacao ?? ''}  </TableCell>
                                <TableCell className=" text-xs md:text-base text-left text-gray-600 whitespace-nowrap w-[100px]"> R$ { Number(i.valor)?.toFixed(2) ?? '00' } </TableCell>
                                <TableCell className=" text-left   font-bold text-gray-600">  
                      <div className="flex items-center justify-center gap-2">
                              
                                      <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8"
                                              onClick={() => handleClick(i.codigo)}
                                              title="Editar Produto"
                                            >
                                              <Edit className="h-4 w-4" />
                                           </Button>
                                <div
                                    className={`p-1 w-5 h-5 rounded-full flex items-center justify-center ${
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
                               
                              </TableRow>
                              )
                          )
                       }
                    </TableBody>
                    
                    </Table>
              </ScrollArea>
        ):(
          isLoading ? 
          (
            <div className="flex justify-center my-4"> {/* Container para centralizar */}
            <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
          </div>
      ):
          <span className=" text-xs md:text-xl text-gray-500 text-center   m-7 "> nenhum serviço encontrado!</span>
      
        )  
      }         
                     
          </div>
      
          
          </div>
        </div>
    )
}
