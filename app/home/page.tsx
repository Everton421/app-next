
'use client'
import { useAuth } from "@/contexts/AuthContext";
import {   ClipboardList, Package, PlusCircle, Users } from "lucide-react";
 import { useEffect, useState } from "react";
 import {    useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreeDot } from "react-loading-indicators";
import { GraficoHome } from "@/components/grafico-home";
import { configApi } from "../services/api";

type chartData = {
    date: string
    desktop: number   
}
type arrChartData ={
   chartData:chartData[]
}


export default function Home() {

  const { user, loading }:any = useAuth();
  const router = useRouter();
  const api = configApi();
 
  const [ dadosGrafico , setDadosGrafico ] = useState<arrChartData[]>([]);
  const [ totalVendasGrafico, setTotalVendasGrafico ] = useState<number>(0);

 
    useEffect(
    ()=>{
      async function busca(){
        let result = await api.get('/pedidos/vendas',{
          params : {        
         dataInicial: "2025-01-01 00:00:00",
         dataFinal: "2025-05-23 00:00:00",
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
           /*   let pedidos = arr.reduce((acumulador, pedido) =>{
                const  { data_cadastro, total_geral } = pedido; 
                  if( acumulador[ data_cadastro ] ){
                    acumulador[data_cadastro].total_geral += total_geral;
                  }else{
                    acumulador[data_cadastro] = { date: data_cadastro, desktop: total_geral };
                  }

                  return acumulador;
                },{});

                const resultadoFinal = Object.values(pedidos);*/
        
              }



      }
      busca()
    },[]  )

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
          {/*  <ChartOverView />  Passar dados dinâmicos se possível */}
            <GraficoHome chartData={dadosGrafico} totalVendas={totalVendasGrafico} />
        </div>
    </section>

     </ScrollArea >
    
    </main>
  );
}
