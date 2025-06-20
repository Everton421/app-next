
'use client'

import {   useEffect, useState } from "react";
import { configApi } from "../services/api";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead,   TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import {   Check, CheckCheck, ClipboardCheck, ClipboardList, ClipboardPenLine,    Edit,    Plus,    Printer,   Terminal,   Wrench,   X  } from "lucide-react";
import  { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FiltroPedidos } from "./components/filtrosPedidos";
import { DateService } from "../services/dateService";
import { TooltipProvider, TooltipTrigger, Tooltip, TooltipContent} from "@/components/ui/tooltip";
import { ThreeDot } from "react-loading-indicators";


export default function Pedidos(){
  
      const [dados, setDados] = useState<pedido[]>([]);
      const [dadosFiltro, setDadosFiltro] = useState<any>([]);
      const [ pesquisa , setPesquisa ] = useState<string | null > ('');
      const [ codigoPedido, setCodigoPedido ] = useState();
      const [ filtroSituacao, setFiltroSituacao ] = useState<string>('full');
      const [ dataInicial, setDataInicial ] = useState<string>('2025-01-01')
      const [ dataFinal, setDataFinal ] = useState<string>('2025-03-27')
      const [ carregando , setCarregando ] = useState(false)
      const  [ filtertipoPedidos, setFilterTipoPedidos ] = useState(1); // 1: pedido, 3: ordem servico 

     const router = useRouter() 
     const api = configApi();
     const dateService = DateService();


  const { user, loading }:any = useAuth();


 
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);


  useEffect( ()=>{
    if (   user && !loading) {
       let dataAtual = dateService.obterDataAtual();
       let  dataAtualPrimeiroDia = dateService.obterDataAtualPrimeiroDiaDoMes();
       setDataFinal(dataAtual);
       setDataInicial(dataAtualPrimeiroDia);
       busca( dataAtualPrimeiroDia,  dataAtual ,   null)
   }
  
    } , [ user, loading ])
  
  

  async function busca( dataInicial:string, dataFinal:string,   filter:any){
    setDados([])
    setCarregando(true);
    let params  

    let paramFilter 
    
    if( isNaN(filter) ){
      paramFilter = 
       {         
        dataInicial: dataInicial,
        dataFinal: dataFinal,
        vendedor:user.vendedor,
        tipo: filtertipoPedidos,

        nome: filter
      }
      
    }
    if( !isNaN(filter) ){
      paramFilter = 
       {         
        dataInicial: dataInicial,
        dataFinal: dataFinal,
        vendedor:user.vendedor,
        tipo: filtertipoPedidos,
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
        tipo: filtertipoPedidos,
      }
    }
    let header = { token:  user.token }
 
    try{

//    await delay(5000)

        let aux = await api.get(`/pedidos/vendas`,{
          params: params,
          headers: header
        });
        
        setDados(aux.data)
        setDadosFiltro(aux.data)
        setCarregando(false)
      }catch(e){
         console.log(e) 
    }finally{

    }
}




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



        function handleOrder(codigo:number){  
         // setCodigoPedido(codigo);
             router.push(`/pedidos/${codigo}`)
        }

        function new_order(){
          router.push(`/pedidos/novo`)
        }

    return (
        <div className=" min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full justify-itens-center items-center   bg-slate-100"  >
           <div className="  w-full md:w-5/6   p-2 mt-22 min-h-screen    rounded-lg bg-white shadow-md " >


          <div className="p-2 rounded-sm bg-slate-100">
              <div className="m-5  flex justify-between   ">
              
        <h1 className="text-2xl md:text-4xl font-bold font-sans text-gray-800">

                  Pedidos
                </h1>
              </div>


          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6  ">
          
          <div className="flex md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3" >
            <Input
              placeholder="Pesquisar por código do cliente ou nome..."
              className="shadow-sm flex-grow bg-white" // Takes available space
              value={String(pesquisa)}
              onChange={(e) => setPesquisa(e.target.value)}
            />

               <Button onClick={()=> busca(dataInicial, dataFinal, pesquisa)}  className="max-h-20">
                            <span className=" text-white font-bold"> Pesquisar </span>
                   </Button>

               <div className="gap-1">  
                  <FiltroPedidos 
                    setDataInicial={setDataInicial} 
                    setDataFinal={setDataFinal} 
                    dataInicial={dataInicial}
                    dataFinal={dataFinal}
                   filtrTipo={filtertipoPedidos}
                   setFiltroTipo={setFilterTipoPedidos}
                   />

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
                <TableHead   > 
                      <span className=" text-xs md:text-lg   text-left ">
                        situaçao
                      </span>
                  </TableHead>
                <TableHead  className="  w-[60%]">
                    <span className=" text-xs md:text-lg  text-left "> Cliente </span>
                </TableHead>  
                <TableHead className=" w-[10%] ">
                  <span className=" text-xs md:text-lg ">
                    Total
                  </span>
                  </TableHead>
                <TableHead className=" max-md:hidden text-center text-lg  w-[20%]">  data cadastro    </TableHead>
                <TableHead className="text-center  text-lg   items-center justify-center flex ">     </TableHead>
                <TableHead className="text-center  text-lg   items-center justify-center flex ">      </TableHead>

          </div>
      
   
 
          {   dados.length > 0 ?
              (
                <ScrollArea className="h-2/3 w-full" >
                  <Table  className="w-full  rounded-xl   ">
                   <TableBody>

               { 
                  dadosFiltro.length > 0 && !carregando &&
                    dadosFiltro.map((i:any)=>(

                 
                          <TableRow key={ i.codigo } 
                              > 
                            <TooltipProvider>
                                <Tooltip >
                                    <TooltipTrigger >   
                                        <TableCell className="  text-center font-bold text-gray-600 items-center justify-center flex   ">
                                              {i.situacao  === 'RE' &&  <div className="bg-red-600      rounded-sm"> <X size={20} color="#FFF"/>  </div>}
                                              {i.situacao  === 'EA' &&  <div className="bg-green-700    rounded-sm"> <Check size={20} color="#FFF" /> </div>}
                                              {i.situacao  === 'AI' &&  <div className="bg-blue-400     rounded-sm"> <CheckCheck size={20} color="#FFF" /> </div>}
                                              {i.situacao  === 'FI' &&  <div className="bg-orange-500   rounded-sm"> <ClipboardCheck size={20} color="#FFF" /> </div>}
                                              {i.situacao  === 'FP' &&  <div className="bg-blue-700     rounded-sm"> <ClipboardPenLine size={20}  color="#FFF" /></div>}
                                            
                                            </TableCell>
                                      </TooltipTrigger>
                                           <TableCell className=" w-[60%]  font-bold text-gray-600"
                                               > 
                                               <button onClick={ ( )=>handleOrder(i.codigo) } className="  ml-[5%]">
                                                 <span className=" text-xs md:text-lg">
                                                    {i.nome}
                                                 </span> 
                                               </button> 
                                          </TableCell>

                                        <TableCell className="  w-[15%]  text-center font-bold text-gray-600 ">  
                                            <span className=" text-xs md:text-lg">
                                              R$  {i?.total_geral.toFixed(2)}
                                            </span>
                                          </TableCell>
                                        <TableCell className="  max-md:hidden w-[10%]    text-center font-bold text-gray-600 "> 
                                             {i.data_cadastro  }
                                        </TableCell>
                                        
                                        <TableCell className=" max-md:hidden text-center font-bold text-gray-600 " rowSpan={1} > 
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
                                              <div className="bg-black md:p-1 md:w-7 rounded-sm">   <Edit size={20} color="#FFF" />   </div>
                                           </button>
                                        </TableCell>

                                        <TableCell className="    text-center font-bold text-gray-600 "> 
                                         
                                              { i.tipo === 1 ?  
                                                <button className="cursor-pointer " title="Pedido de Venda" >
                                                  <div className="bg-green-800  md:p-1  md:w-7 rounded-sm">  
                                                      <ClipboardList  size={20}   color="#FFF" strokeWidth={2} />
                                                  </div>
                                                </button>
                                                 :
                                                <button className="cursor-pointer " title="Ordem De Serviço" >
                                                   <div className="bg-green-800  p-1  w-7 rounded-sm">  
                                                     <Wrench  size={20} color="#FFF" strokeWidth={2} />
                                                  </div>
                                                </button>
                                                 
                                                 }



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
                    carregando  ? (
                     <div className="flex justify-center my-4"> {/* Container para centralizar */}
                       <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
                     </div>
                     ) :
              <p   className="text-xl text-gray-500   ml-7"> nenhum pedido encontrado!</p>  

              )
        }


   


      <div className=" bg-slate-100 p-2  sm:ml-14  fixed bottom-0 left-0 right-0 rounded-xl shadow-md items-center flex justify-center ">
          <div className="">
            
                 <TableRow> 
                                 <TableCell className=" w-40    text-center font-bold text-gray-600 ">
                                     <div className="items-center justify-center md:flex gap-1" >
                                        <button onClick={   ()=>{   filtroSituacao !== 'EA' ? setFiltroSituacao('EA') : setFiltroSituacao('full')    }}  >
                                          <div className="bg-green-700   md:p-1 rounded-sm cursor-pointer" >
                                           <Check size={20} color="#FFF" /> 
                                          </div>
                                        </button>
                                         <span className="text-center text-xs md:text-lg max-md:hidden ">orçamento</span>
                                       </div>
                                    </TableCell>
                                 <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                       <div className="items-center justify-center md:flex gap-1" >
                                          <button onClick={   ()=>{   filtroSituacao !== 'RE' ? setFiltroSituacao('RE') : setFiltroSituacao('full')    }} >
                                            <div className="bg-red-600  md:p-1  rounded-sm cursor-pointer "  >
                                              <X size={20} color="#FFF"/> 
                                            </div>
                                          </button>
                                           <span className="text-center text-xs md:text-lg max-md:hidden ">reprovado</span>
                                        </div> 
                                   </TableCell>

                                   <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                       <div className="items-center justify-center md:flex gap-1" >
                                          <button onClick={   ()=>{   filtroSituacao !== 'AI' ? setFiltroSituacao('AI') : setFiltroSituacao('full')    }}  >
                                          <div className="bg-blue-400  md:p-1  rounded-sm cursor-pointer" >
                                            <CheckCheck size={20} color="#FFF" />
                                         </div>  
                                         </button>
                                            <span className="text-center text-xs md:text-lg max-md:hidden ">pedido</span>
                                       </div> 
                                   </TableCell>

                                   <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                   < div className="items-center justify-center md:flex gap-1" >
                                        <button   onClick={   ()=>{   filtroSituacao !== 'FI' ? setFiltroSituacao('FI') : setFiltroSituacao('full')    }} >
                                        <div className="bg-orange-500  md:p-1 rounded-sm cursor-pointer" >
                                          <ClipboardCheck size={20} color="#FFF" />
                                        </div>  
                                        </button>
                                       <span className="text-center text-xs md:text-lg max-md:hidden ">faturado</span>
                                   </div> 
                                   </TableCell>
                                 
                                   <TableCell className="     text-center font-bold text-gray-600 "> 
                                    <div className="items-center justify-center md:flex gap-1" >
                                      <button   onClick={   ()=>{   filtroSituacao !== 'FP' ? setFiltroSituacao('FP') : setFiltroSituacao('full')    }}>
                                        <div className="bg-blue-700  md:p-1 rounded-sm cursor-pointer"  >
                                           <ClipboardPenLine size={20} color="#FFF" />
                                        </div>    
                                        </button>
                                      <span className="text-center text-xs md:text-lg max-md:hidden">faturado parcialmente</span>
                                    </div> 
                                   </TableCell>
               </TableRow>

          </div>
      </div>
          
          </div>
        </div>

)
}