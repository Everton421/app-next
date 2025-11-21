
'use client'

import {   useEffect, useState } from "react";
import { configApi } from "../services/api";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead,   TableHeader,   TableRow } from "@/components/ui/table";
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
     const dateService = DateService();

     const api = configApi();

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
 
      
   
 
     {dados.length > 0 ? (
  <ScrollArea className="h-[calc(100vh-320px)] w-full rounded-md border">
    {/* Dica: Usar calc() para a altura da ScrollArea a torna mais robusta */}
    <Table className="w-full">
      {/* 1. O Cabeçalho (TableHeader) deve estar DENTRO da Table */}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[5%] text-center">Sit.</TableHead>
          <TableHead className="w-[10%]">ID</TableHead>
          <TableHead className="w-[45%]">Cliente</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="max-md:hidden text-center">Cadastrado</TableHead>
          <TableHead className="text-center" colSpan={3}>Ações</TableHead>
        </TableRow>
      </TableHeader>

      {/* 2. O Corpo (TableBody) também fica DENTRO da Table, depois do Header */}
      <TableBody>
        {dadosFiltro.length > 0 && !carregando &&
          dadosFiltro.map((i: any) => (
            <TableRow key={i.codigo} className="hover:bg-slate-50">
              
              {/* Célula de Situação */}
              <TableCell className="w-[5%] text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {i.situacao === 'RE' && <div className="bg-red-600 rounded-sm inline-flex"><X size={20} color="#FFF" /></div>}
                      {i.situacao === 'EA' && <div className="bg-green-700 rounded-sm inline-flex"><Check size={20} color="#FFF" /></div>}
                      {i.situacao === 'AI' && <div className="bg-blue-400 rounded-sm inline-flex"><CheckCheck size={20} color="#FFF" /></div>}
                      {i.situacao === 'FI' && <div className="bg-orange-500 rounded-sm inline-flex"><ClipboardCheck size={20} color="#FFF" /></div>}
                      {i.situacao === 'FP' && <div className="bg-blue-700 rounded-sm inline-flex"><ClipboardPenLine size={20} color="#FFF" /></div>}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Situação do Pedido</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              {/* Célula ID */}
              <TableCell className="w-[10%] font-bold text-gray-700">
                <button onClick={() => handleOrder(i.codigo)} className="text-left">
                  <span className="text-xs md:text-base font-bold">{i.id}</span>
                </button>
              </TableCell>

              {/* Célula Cliente - Note que apliquei a mesma largura do header */}
              <TableCell className="w-[45%] font-medium text-gray-700">
                <button onClick={() => handleOrder(i.codigo)} className="text-left">
                  <span className="text-xs md:text-base">{i.nome}</span>
                </button>
              </TableCell>

              {/* Célula Total */}
              <TableCell className="text-right font-bold text-gray-600">
                <span className="text-xs md:text-base">
                  R$ {i?.total_geral.toFixed(2)}
                </span>
              </TableCell>

              {/* Célula Data - com classe para esconder em telas pequenas */}
              <TableCell className="max-md:hidden text-center font-medium text-gray-600">
                {new Date (i.data_cadastro).toLocaleDateString('pt-br', { year: 'numeric',day:'2-digit', month:'2-digit' }) }
              </TableCell>

              {/* Células de Ações */}
               <div className="flex gap-2 justify-center">
                  <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <button onClick={() => router.push(`/pedidos/${i.codigo}/imprimir`)}>
                                <div className="bg-gray-700 p-1  rounded-full inline-flex justify-center"><Printer size={14} color="#FFF" /></div>
                             </button>
                        </TooltipTrigger>
                        <TooltipContent><p>Imprimir</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                  <TooltipProvider>

                    <Tooltip>
                        <TooltipTrigger asChild>
                             <button onClick={() => handleOrder(i.codigo)}>
                                <div className="bg-blue-600   p-1 rounded-full inline-flex justify-center"><Edit size={14} color="#FFF" /></div>
                             </button>
                        </TooltipTrigger>

                        <TooltipContent><p>Editar</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                 
                  <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>

                             {i.tipo === 1 ? (
                                <button className="cursor-help" title="Pedido de Venda">
                                  <div className="bg-green-800 p-1 rounded-full inline-flex justify-center"><ClipboardList size={14} color="#FFF" strokeWidth={2} /></div>
                                </button>
                              ) : (
                                <button className="cursor-help" title="Ordem De Serviço">
                                  <div className="bg-purple-800 p-1   rounded-sm inline-flex justify-center"><Wrench size={14} color="#FFF" strokeWidth={2} /></div>
                                </button>
                              )}
                        </TooltipTrigger>

                        <TooltipContent>
                            {i.tipo === 1 ? <p>Pedido de Venda</p> : <p>Ordem de Serviço</p>}
                        </TooltipContent>
                    </Tooltip>

                </TooltipProvider>
              </div>

         

            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  </ScrollArea>
) : (
  carregando ? (
    <div className="flex justify-center my-4">
      <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
    </div>
  ) : (
    <p className="text-xl text-gray-500 ml-7 mt-4">Nenhum pedido encontrado!</p>
  )
)}


   


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
                                         <span className="text-center text-xs md:text-base max-md:hidden ">orçamento</span>
                                       </div>
                                    </TableCell>
                                 <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                       <div className="items-center justify-center md:flex gap-1" >
                                          <button onClick={   ()=>{   filtroSituacao !== 'RE' ? setFiltroSituacao('RE') : setFiltroSituacao('full')    }} >
                                            <div className="bg-red-600  md:p-1  rounded-sm cursor-pointer "  >
                                              <X size={20} color="#FFF"/> 
                                            </div>
                                          </button>
                                           <span className="text-center text-xs md:text-base max-md:hidden ">reprovado</span>
                                        </div> 
                                   </TableCell>

                                   <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                       <div className="items-center justify-center md:flex gap-1" >
                                          <button onClick={   ()=>{   filtroSituacao !== 'AI' ? setFiltroSituacao('AI') : setFiltroSituacao('full')    }}  >
                                          <div className="bg-blue-400  md:p-1  rounded-sm cursor-pointer" >
                                            <CheckCheck size={20} color="#FFF" />
                                         </div>  
                                         </button>
                                            <span className="text-center text-xs md:text-base max-md:hidden ">pedido</span>
                                       </div> 
                                   </TableCell>

                                   <TableCell className=" w-40    text-center font-bold text-gray-600 "> 
                                   < div className="items-center justify-center md:flex gap-1" >
                                        <button   onClick={   ()=>{   filtroSituacao !== 'FI' ? setFiltroSituacao('FI') : setFiltroSituacao('full')    }} >
                                        <div className="bg-orange-500  md:p-1 rounded-sm cursor-pointer" >
                                          <ClipboardCheck size={20} color="#FFF" />
                                        </div>  
                                        </button>
                                       <span className="text-center text-xs md:text-base max-md:hidden ">faturado</span>
                                   </div> 
                                   </TableCell>
                                 
                                   <TableCell className="     text-center font-bold text-gray-600 "> 
                                    <div className="items-center justify-center md:flex gap-1" >
                                      <button   onClick={   ()=>{   filtroSituacao !== 'FP' ? setFiltroSituacao('FP') : setFiltroSituacao('full')    }}>
                                        <div className="bg-blue-700  md:p-1 rounded-sm cursor-pointer"  >
                                           <ClipboardPenLine size={20} color="#FFF" />
                                        </div>    
                                        </button>
                                      <span className="text-center text-xs md:text-base max-md:hidden">faturado parcialmente</span>
                                    </div> 
                                   </TableCell>
               </TableRow>

          </div>
      </div>
          
          </div>
        </div>

)
}