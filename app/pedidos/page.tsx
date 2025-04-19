
'use client'

import { useContext, useEffect, useState } from "react";
import { configApi } from "../services/api";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead,   TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import {   Check, CheckCheck, ClipboardCheck, ClipboardPenLine,    Edit,    Plus,    Printer,   Terminal,   X  } from "lucide-react";
import  { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FiltroPedidos } from "./components/filtrosPedidos";
import { DateService } from "../services/dateService";
import { TooltipProvider, TooltipTrigger, Tooltip, TooltipContent} from "@/components/ui/tooltip";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


export default function Pedidos(){
  
      const [dados, setDados] = useState([]);
      const [dadosFiltro, setDadosFiltro] = useState([]);
      const [ pesquisa , setPesquisa ] = useState<string | null > ('');
      const [ codigoPedido, setCodigoPedido ] = useState();
      const [ filtroSituacao, setFiltroSituacao ] = useState<string>('full');
      const [ dataInicial, setDataInicial ] = useState<string>('2025-01-01')
      const [ dataFinal, setDataFinal ] = useState<string>('2025-03-27')
      const [ carregando , setCarregando ] = useState(true)

     const router = useRouter() 
     const api = configApi();
     const dateService = DateService();


  const { user, loading }:any = useAuth();
 
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/'); // Redireciona para a página de login (ajuste se for outra)
      }
    }
  }, [user, loading, router]);

  async function busca( dataInicial:string, dataFinal:string,   filter:any){
    let params  

    let paramFilter 
    
    if( isNaN(filter) ){
      paramFilter = 
       {         
        dataInicial: dataInicial,
        dataFinal: dataFinal,
        vendedor:user.vendedor,
        nome: filter
      }
      
    }
    if( !isNaN(filter) ){
      paramFilter = 
       {         
        dataInicial: dataInicial,
        dataFinal: dataFinal,
        vendedor:user.vendedor,
        cliente: filter
      }
      
    }

    { filter !== null ?
      params = paramFilter
      :
      params = {        
         dataInicial: dataInicial,
         dataFinal: dataFinal,
          vendedor:user.vendedor,
      }
    }
    let header = { cnpj: Number(user.cnpj)}
    console.log(params)
  
    try{
        let aux = await api.get(`/pedidos/vendas`,{
          params: params,
          headers: header
        });
        setDados(aux.data)
        setDadosFiltro(aux.data)
        setCarregando(false)
      }catch(e){
         console.log(e) 
    }
}


useEffect( ()=>{
  let dataAtual = dateService.obterDataAtual();
  let  dataAtualPrimeiroDia = dateService.obterDataAtualPrimeiroDiaDoMes();
  setDataFinal(dataAtual);
  setDataInicial(dataAtualPrimeiroDia);
 busca( dataAtualPrimeiroDia,  dataAtual ,   null)

  } , [])


  useEffect(()=>{
  
    if(filtroSituacao === 'EA' ){
      let filtro = dados.filter((v)=> v.situacao === 'EA' )
      setDadosFiltro(filtro)
    }

    if(filtroSituacao === 'FI' ){
      let filtro = dados.filter((v)=> v.situacao === 'FI' )
      setDadosFiltro(filtro)
    }
    if(filtroSituacao === 'RE' ){
      let filtro = dados.filter((v)=> v.situacao === 'RE' )
      setDadosFiltro(filtro)
    }
    if(filtroSituacao === 'AI' ){
      let filtro = dados.filter((v)=> v.situacao === 'AI' )
      setDadosFiltro(filtro)
    }
    if(filtroSituacao === 'FP' ){
      let filtro = dados.filter((v)=> v.situacao === 'FP' )
      setDadosFiltro(filtro)
    }

    if( filtroSituacao === 'full' ){
      setDadosFiltro(dados)
    }

  }, [filtroSituacao    ] )

 if(!dados){
  return (
    <div className="flex justify-center items-center h-screen">
       <p>carregando...</p>
    </div>
  );

}


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
         <p>Verificando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex justify-center items-center h-screen">
          <p>Redirecionando para login...</p>
       </div>
    );
  }



        function handleOrder(codigo:number){  
         // setCodigoPedido(codigo);
             router.push(`/pedidos/${codigo}`)
        }

        function new_order(){
          router.push(`/pedidos/novo`)
        }

    return (
        <div className=" min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full justify-itens-center items-center   bg-slate-100"  >
         <div className="w-5/6 p-8 mt-22 h-screen    rounded-lg bg-white shadow-md " >
          <div className="p-2 rounded-sm bg-slate-100">
              <div className="m-5  flex justify-between   ">
                <h1 className="text-4xl  font-sans font-bold  ">
                  
                  Pedidos
                </h1>
              </div>


          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6  ">
          
          <div className="flex md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3" >
            <Input
              placeholder="Pesquisar por código do cliente ou nome..."
              className="shadow-sm flex-grow bg-white" // Takes available space
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />

               <Button onClick={()=> busca(dataInicial, dataFinal, pesquisa)}  className="max-h-20">
                            <span className=" text-white font-bold"> Pesquisar </span>
                   </Button>

               <div className="gap-1">  
                  <FiltroPedidos setDataInicial={setDataInicial} setDataFinal={setDataFinal}  dataInicial={dataInicial} dataFinal={dataFinal}/>
                </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 md:mt-0">
              <Button type="button" className="shadow-sm w-full sm:w-auto"
                 onClick={()=> router.push('/pedidos/novo')}
                >
              <Plus className="h-4 w-4 mr-2" /> Novo
            </Button>
              
          </div>
          </div>
 
            </div>

          <div className="  flex  w-full">
                <TableHead className="text-lg" > situaçao</TableHead>
                <TableHead  className=" w-[60%]">
                    <span className=" text-lg ml-8 "> Cliente </span>
                </TableHead>
                <TableHead className="text-center text-lg w-[10%] ">Total</TableHead>
                <TableHead className="text-center text-lg  w-[20%]">  data cadastro    </TableHead>
                <TableHead className="text-center  text-lg   items-center justify-center flex ">     </TableHead>
                <TableHead className="text-center  text-lg   items-center justify-center flex ">      </TableHead>

          </div>
      
    
 
          {   dados.length > 0 ?
              (
                <ScrollArea className="h-2/3 w-full" >
                  <Table  className="w-full  rounded-xl   ">
                   <TableBody>

               { 
                  dadosFiltro.length > 0 &&
                    dadosFiltro.map((i:any)=>(

                 
                          <TableRow key={ i.codigo } 
                              > 
                            <TooltipProvider>
                                <Tooltip >
                                    <TooltipTrigger >   
                                        <TableCell className="  text-center font-bold text-gray-600   ">
                                              {i.situacao  === 'RE' &&  <div className="bg-red-600     rounded-sm"> <X size={20} color="#FFF"/>  </div>}
                                              {i.situacao  === 'EA' &&  <div className="bg-green-700   rounded-sm">   <Check size={20} color="#FFF" /> </div>}
                                              {i.situacao  === 'AI' &&  <div className="bg-blue-400     rounded-sm"> <CheckCheck size={20} color="#FFF" /> </div>}
                                              {i.situacao  === 'FI' &&  <div className="bg-orange-500  rounded-sm"> <ClipboardCheck size={20} color="#FFF" /> </div>}
                                              {i.situacao  === 'FP' &&  <div className="bg-blue-700    rounded-sm">    <ClipboardPenLine size={20} color="#FFF" /></div>}
                                            
                                            </TableCell>
                                      </TooltipTrigger>
                                           <TableCell className=" w-[60%]  font-bold text-gray-600 "
                                               > 
                                               <button onClick={ ( )=>handleOrder(i.codigo) } >
                                                   {i.nome}
                                               </button> 
                                          </TableCell>

                                        <TableCell className="  w-[15%]  text-center font-bold text-gray-600 ">  
                                            R$  {i?.total_geral.toFixed(2)}
                                          
                                          </TableCell>
                                        <TableCell className="   w-[10%]    text-center font-bold text-gray-600 "> 
                                             {i.data_cadastro  }
                                        </TableCell>
                                        
                                        <TableCell className="    text-center font-bold text-gray-600 "> 
                                          <button 
                                          onClick={()=>{ 
                                          router.push(`/pedidos/${i.codigo}/imprimir`)}}
                                          >
                                              <div className="bg-black  p-1  w-7 rounded-sm">  <Printer size={20} color="#FFF" />  </div>
                                          </button>
                                        </TableCell>

                                        <TableCell className="      text-center font-bold text-gray-600 "> 
                                           <button 
                                             onClick={ ( )=>handleOrder(i.codigo) }
                                             className="cursor-pointer "
                                           >
                                              <div className="bg-black  p-1  w-7 rounded-sm">   <Edit size={20} color="#FFF" />   </div>
                                           </button>
                                        </TableCell>


                                        <TooltipContent>
                                           <p>codigo: {i?.codigo}</p>
                                           <p>cliente: {i?.nome}</p>
                                        </TooltipContent>
                                 </Tooltip>
                            </TooltipProvider>

                          </TableRow>
                          
                      ) )
                    
                     }

                    </TableBody>
                  </Table>
               </ScrollArea>

                ) : (
                 <p > nenhum pedido encontrado!</p>
              )
        }


   


      <div className=" bg-slate-100 p-2  sm:ml-14  fixed bottom-0 left-0 right-0 rounded-xl shadow-md  ">
          <div className="">
            
               
              
                 <TableRow> 
                                 <TableCell className=" w-40    text-center font-bold text-gray-600 ">
                                     <div className="items-center justify-center flex gap-1" >
                                        <button onClick={   ()=>{   filtroSituacao !== 'EA' ? setFiltroSituacao('EA') : setFiltroSituacao('full')    }}  >
                                          <div className="bg-green-700   p-1 rounded-sm cursor-pointer" >
                                           <Check size={20} color="#FFF" /> 
                                          </div>
                                        </button>
                                         <span className="text-center  ">orçamento</span>
                                       </div>
                                    </TableCell>
                                 <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                       <div className="items-center justify-center flex gap-1" >
                                          <button onClick={   ()=>{   filtroSituacao !== 'RE' ? setFiltroSituacao('RE') : setFiltroSituacao('full')    }} >
                                            <div className="bg-red-600     p-1   rounded-sm cursor-pointer "  >
                                              <X size={20} color="#FFF"/> 
                                            </div>
                                          </button>
                                           <span className="text-center  ">reprovado</span>
                                        </div> 
                                   </TableCell>

                                   <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                       <div className="items-center justify-center flex gap-1" >
                                          <button onClick={   ()=>{   filtroSituacao !== 'AI' ? setFiltroSituacao('AI') : setFiltroSituacao('full')    }}  >
                                          <div className="bg-blue-400    p-1  rounded-sm cursor-pointer" >
                                            <CheckCheck size={20} color="#FFF" />
                                         </div>  
                                         </button>
                                            <span className="text-center  ">pedido</span>
                                       </div> 
                                   </TableCell>

                                   <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                   < div className="items-center justify-center flex gap-1" >
                                        <button   onClick={   ()=>{   filtroSituacao !== 'FI' ? setFiltroSituacao('FI') : setFiltroSituacao('full')    }} >
                                        <div className="bg-orange-500  p-1   rounded-sm cursor-pointer" >
                                          <ClipboardCheck size={20} color="#FFF" />
                                        </div>  
                                        </button>
                                       <span className="text-center  ">faturado</span>
                                   </div> 
                                   </TableCell>
                                 
                                   <TableCell className="     text-center font-bold text-gray-600 "> 
                                    <div className="items-center justify-center flex gap-1" >
                                      <button   onClick={   ()=>{   filtroSituacao !== 'FP' ? setFiltroSituacao('FP') : setFiltroSituacao('full')    }}>
                                        <div className="bg-blue-700    p-1  rounded-sm cursor-pointer"  >
                                           <ClipboardPenLine size={20} color="#FFF" />
                                        </div>    
                                        </button>
                                      <span className="text-center  ">faturado parcialmente</span>
                                    </div> 
                                   </TableCell>
               </TableRow>

          </div>
      </div>
          
          </div>
        </div>

)
}