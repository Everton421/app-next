
'use client'
import { useAuth } from "@/contexts/AuthContext";
import {   ClipboardList, DollarSign, Package, PlusCircle, Users } from "lucide-react";
 import { useEffect, useState } from "react";
 import {    useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreeDot } from "react-loading-indicators";
import { GraficoHome } from "@/components/grafico-home";
import { configApi } from "../services/api";
import { resolve } from "path";
import { DateService } from "../services/dateService";
import { ChartPieDonutText } from "@/components/pie-chart/pie-chart";
import { ChartRadialText   } from "@/components/radial-chart/radial-chart";
import { ChartAreaInteractive } from "@/components/area-chart/ara-chart";

type chartData = {
    date: string
    desktop: number   
}
type arrChartData ={
   chartData:chartData[]
}


export default function Home() {


  const { user , loading   }:any = useAuth();
  const router = useRouter();
  const api = configApi();
  const dateService = DateService();

  const [ dadosGrafico , setDadosGrafico ] = useState<any[]>([]);
  const [ totalVendasGrafico, setTotalVendasGrafico ] = useState<number>(0);
  const [melhorVenda , setMelhorVenda] = useState<any>();
 const [loadingDados, setLoadingDados] = useState(false)
 
 const [ dataInicial, setDataInicial ] = useState( dateService.obterDataAtualPrimeiroDiaDoMes()+'00:00:00');
 const [ dataFinal, setDataFinal ] = useState(dateService.obterDataHoraAtual() );

  function delay(ms:any)  {
    return new Promise((resolve)=>{ setTimeout( resolve,ms )})
   }

    async function busca(){
        try{
          setLoadingDados(true)
          let result = await api.get('/pedidos/vendas',{
                  params : {        
                dataInicial: dataInicial,
                dataFinal:  dataFinal,
                limit:10000,
                  vendedor: user.codigo
                  },
                  headers: {
                    token:  user.token 
                  },
                })
                  
                if( result.status === 200 && result.data.length > 0 ){
                    let arr:any[] = result.data;
                    let arrLength = arr.length;
                      console.log(arr)
                    if (arrLength > 0 ){
                          let arrTotais = arr.map((i)=> i.total_geral )
                          let maxTotal = Math.max(...arrTotais) 
                          let maiorPedido = arr.filter((i)=> i.total_geral === maxTotal)
                          setMelhorVenda(maiorPedido[0])
                    }

                    let aux:any[] =[]
                    if( arr.length > 0 ){

                        let auxTotal=0;
                      arr.forEach((i)=>{
                      aux.push({ date:i.data_cadastro, desktop:i.total_geral })
                        auxTotal += i.total_geral
                      })
                      
                      setTotalVendasGrafico(auxTotal);
                      setDadosGrafico(aux);
                    }
                      }
          setLoadingDados(false)

        }catch(e){
          setLoadingDados(true)

        }finally{
          setLoadingDados(false)
        }
      }
    useEffect(
    ()=>{
      async function filterData(){
        await delay(2000)
        busca()
      }
      filterData()
    },[   ]  )

  useEffect(
    ()=>{
        async function filterData(){
        await delay(2000)
        busca()
      }
      filterData()
    },[ dataInicial ,dataFinal   ]  )



  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login'); // Redireciona para a página de login (ajuste se for outra)
      }
    }
  }, [user, loading, router]);


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
 


  return (
    <main className="sm:ml-14 p-4 bg-slate-100 min-h-screen  h-full  " > {/* Garantir altura mínima */}
    <ScrollArea className="w-full   h-full " >
      

    {/* Mensagem de Boas-vindas */}
    <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">
        Olá, {user.nome || 'Usuário'}! 
    </h1>

    {/* Seção de Ações Rápidas */}
    <section className="mb-6 flex flex-wrap gap-2 sm:gap-4">
        <Button onClick={() => router.push('/pedidos/novo')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Pedido
        </Button>
        <Button variant="outline" onClick={() => router.push('/clientes')}>
            <Users className="mr-2 h-4 w-4" /> Clientes
        </Button>
        <Button variant="outline" onClick={() => router.push('/produtos')}>
             <Package className="mr-2 h-4 w-4" /> Produtos
        </Button>
         <Button variant="outline" onClick={() => router.push('/pedidos')}>
             <ClipboardList className="mr-2 h-4 w-4" /> Meus Pedidos
        </Button>
       
    </section>

    {/* Seção de KPIs (Cards)  
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"> 
    <Card>
          
        </Card>
        <Card className="cursor-pointer hover:bg-sky-50" onClick={() => router.push('/pedidos?status=pendente')}>
        </Card>
    </section>*/}

    {/* Seção do Gráfico */}
    <section className="w-full bg-white p-4 rounded-lg shadow"> {/* Envolver gráfico em card/seção */}
          
         {/* Adicionar talvez um seletor de período para o gráfico */}
        <div className="w-full items-center justify-center flex  ">
        {   loadingDados ? 
            <ThreeDot color="blue" />  
          :
               <GraficoHome 
                chartData={dadosGrafico}
                totalVendas={totalVendasGrafico}
                setDataFinal={setDataFinal}
                setDataInicial={setDataInicial}
                dataFinal={dataFinal}
              dataInicial={dataInicial}
                   />
          }

        </div>


    </section>

    <section className="w-full bg-white p-4 rounded-lg shadow mt-3"> {/* Envolver gráfico em card/seção */}
       <div className="w-full items-center justify-center flex  ">
         {  loadingDados   ? 
         <>
         <ThreeDot color="blue" /> 
         </>
          :   <div className=" flex justify-between flex-col md:flex-row w-full">
                <div className="flex items-center gap-1"  >
                 <span className=" text-black  text-xs md:text-base font-bold " > Código: </span>
                 <span className=" text-zinc-500 text-xs md:text-base" >   { melhorVenda?.codigo} </span>
               </div>
                <div className="flex items-center" >
                 <span className=" text-zinc-500 text-xs md:text-base" >   { melhorVenda?.nome} </span>
               </div>

                <div className="flex items-center" >
                   <DollarSign className="w-4"/>
                   <span className=" text-zinc-500  text-xs md:text-base" >   { melhorVenda && new Intl.NumberFormat('de-DE').format( melhorVenda?.total_geral) } </span>
               </div>
      
          </div>
           }

        </div>
    </section>

     </ScrollArea >
    
    </main>
  );
}
