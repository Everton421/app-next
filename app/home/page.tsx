'use client'
import { useAuth } from "@/contexts/AuthContext";
import {   Badge, ClipboardList, DollarSign, Package, PlusCircle, Users, TrendingUp, UserPlus, X, Check, CheckCheck, ClipboardCheck, ClipboardPenLine } from "lucide-react";
import { useEffect, useState } from "react";
import {    useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreeDot } from "react-loading-indicators";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartOverView } from "@/components/chart";
import { DateService } from "../services/dateService";
import { configApi } from "../services/api";

// --- Tipagem para os dados do Dashboard ---
type VendasPorDia = {
    date: string;
    total: number;
}

type PedidoRecente = {
    id: string;
    id_externo:string,
    cliente: { nome: string };
    valor_total: number;
    situacao: 'EA' | 'RE' | 'AI' | 'FP' | 'FI';
}

type DashboardData = {
    faturamentoTotal: number;
    totalPedidos: number;
    ticketMedio: number;
    novosClientes: number;
    vendasPorDia: VendasPorDia[];
    pedidosRecentes: PedidoRecente[];
}

// --- Componente de Card para KPIs (reutilizável) ---
const KpiCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
)

export default function Home() {
  const { user, loading: authLoading }: any = useAuth();
  const router = useRouter();
  const api = configApi();
  const dateService = DateService();

  // <<< MUDANÇA 1: Estado inicializado como null para aguardar os dados da API
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  // Estados para filtro de data (mantidos para uso futuro)
  const [dataInicial, setDataInicial] = useState(dateService.obterDataAtualPrimeiroDiaDoMes() + ' 00:00:00');
  const [dataFinal, setDataFinal] = useState(dateService.obterDataHoraAtual());

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
    }
  }, [user, authLoading, router]);


  // <<< MUDANÇA 2: useEffect unificado e refatorado para buscar e processar os dados da API
  useEffect(() => {
    // Só executa a busca se o usuário estiver carregado
    if (user) {
        const fetchDashboardData = async () => {
            setLoadingData(true);
            try {
                const header = { token: user.token };
                const params = { 
                    vendedor: 2, 
                    // Você pode usar as datas do estado aqui quando o filtro estiver ativo
                    // data_inicial: dataInicial,
                    // data_final: dataFinal
                };

                // <<< MUDANÇA 3: Usando Promise.all para executar chamadas em paralelo
                const [
                    responseTotais,
                    responseVendasPorDia,
                    responsePedidosRecentes
                ] = await Promise.all([
                    api.get('/pedidos_totais', { headers: header, params }),
                    api.get('/pedidos_totais_por_data', { headers: header, params }),
                    api.get('/pedidos_ultimos_inseridos', { headers: header, params })
                ]);

                // <<< MUDANÇA 4: Processando e combinando os dados das respostas
                
                // Supondo que a API /pedidos_totais retorna um array com um único objeto
                const totais = responseTotais.data[0] || {};

                // Supondo que a API /pedidos_ultimos_inseridos retorna um array de pedidos
                // e o nome do cliente vem como 'cliente_nome' ou algo similar.
                // É preciso mapear para o formato que o componente espera: { cliente: { nome: '...' } }
                const pedidosRecentesFormatados = responsePedidosRecentes.data.map((pedido: any) => ({
                    id: pedido.id, // ou pedido.numero_pedido
                    id_externo: pedido.id_externo,
                    cliente: { nome: pedido.nome || 'Cliente não identificado' },
                    valor_total: parseFloat(pedido.total_geral),
                    situacao: pedido.situacao,
                }));
                
                // Supondo que a API /pedidos_totais_por_data já retorna o formato { date: '...', total: ... }
                const vendasPorDiaFormatadas = responseVendasPorDia.data.map((venda: any) => ({
                    date: dateService.formatarData(venda.data_cadastro, 'dd/MM'), // Exemplo de formatação
                    total: parseFloat(venda.total),
                }));

                // Construindo o objeto final para o estado
                const dadosFinais: DashboardData = {
                    faturamentoTotal: parseFloat(totais.total_faturado || 0),
                    totalPedidos: parseInt(totais.quantidade_pedidos || 0),
                    ticketMedio: parseFloat(totais.media_pedidos || 0),
                    novosClientes: parseInt(totais.novos_clientes || 0),
                    vendasPorDia: vendasPorDiaFormatadas,
                    pedidosRecentes: pedidosRecentesFormatados,
                };
                
                // <<< MUDANÇA 5: Atualizando o estado com os dados da API
                setDashboardData(dadosFinais);

            } catch (error) {
                console.error("Erro ao buscar dados do dashboard:", error);
                // Opcional: mostrar uma mensagem de erro na tela
            } finally {
                setLoadingData(false);
            }
        };

        fetchDashboardData();
    }
  }, [user]); // Dependência apenas de `user`. Se precisar que o filtro de data atualize, adicione `dataInicial` e `dataFinal` aqui.


  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ThreeDot variant="pulsate" color="#2563eb" size="medium" />
      </div>
    );
  }

  return (
    <main className="sm:ml-14 p-4 md:p-8 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
                Dashboard
            </h1>
            <div className="flex flex-wrap gap-2">
                <Button onClick={() => router.push('/pedidos/novo')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Pedido
                </Button>
                <Button variant="outline" onClick={() => router.push('/clientes')}>
                    <Users className="mr-2 h-4 w-4" /> Clientes
                </Button>
                <Button variant="outline" onClick={() => router.push('/produtos')}>
                    <Package className="mr-2 h-4 w-4" /> Produtos
                </Button>
            </div>
        </div>
        
        {/* <<< MUDANÇA 6: Condicional de renderização ajustada para `loadingData` e `dashboardData` */}
        {loadingData ? (
             <div className="flex justify-center items-center h-64">
                <ThreeDot variant="pulsate" color="#2563eb" size="medium" />
             </div>
        ) : dashboardData ? ( // Renderiza somente se dashboardData não for null
        <ScrollArea className="h-full">
            {/* Seção de KPIs (Cards) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard 
                    title="Faturamento Total"
                    value={dashboardData.faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    icon={DollarSign}
                    description="Faturamento no período"
                />
                <KpiCard 
                    title="Pedidos Realizados"
                    value={`+${dashboardData.totalPedidos}`}
                    icon={ClipboardList}
                    description="Total de pedidos no período"
                />
                <KpiCard 
                    title="Ticket Médio"
                    value={dashboardData.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    icon={TrendingUp}
                    description="Valor médio por pedido"
                />
                <KpiCard 
                    title="Novos Clientes"
                    value={`+${dashboardData.novosClientes}`}
                    icon={UserPlus}
                    description="Novos clientes cadastrados"
                />
            </section>

            {/* Seção Principal com Gráfico e Pedidos Recentes */}
            <section className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Visão Geral das Vendas</CardTitle>
                        <CardDescription>
                           Vendas diárias no período selecionado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ChartOverView data={dashboardData.vendasPorDia} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                     <CardHeader>
                        <CardTitle>Pedidos Recentes</CardTitle>
                        <CardDescription>
                            Os últimos pedidos realizados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-4">
                            {dashboardData.pedidosRecentes.map(pedido => (
                                <div key={pedido.id} className="flex items-center">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{pedido.cliente.nome}</p>
                                        
                                      <div className= " flex gap-3">   
                                        <p className="text-sm text-muted-foreground text-blue-600 font-bold ">Id: {pedido.id}</p>
                                    {   pedido.id_externo && pedido.id_externo !== null &&
                                        <p className="text-sm text-muted-foreground text-blue-600 font-bold ">Id Externo: {pedido.id_externo}</p>
                                     }
                                     </div>
                                      
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {pedido.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                                 {pedido.situacao == 'RE' &&  <X size={20}  className="bg-red-600" color='#FFF'  /> }
                                                 {pedido.situacao == 'EA' &&  <Check size={20} className="bg-green-700 " color='#FFF'  /> }
                                                 {pedido.situacao == 'AI' &&  <CheckCheck size={20} className="bg-blue-400"  color='#FFF' /> }
                                                 {pedido.situacao == 'FI' &&  <ClipboardCheck size={20}  className="bg-orange-500"  color='#FFF' /> }
                                                 {pedido.situacao == 'FP' &&  <ClipboardPenLine size={20}  className="bg-blue-700" color='#FFF' /> }
                                    </div>
                                </div>
                            ))}
                       </div>
                    </CardContent>
                </Card>
            </section>
        </ScrollArea>
        ) : (
            // Opcional: Mensagem para quando não há dados ou ocorreu um erro
            <div className="text-center text-gray-500 mt-16">
                <p>Não foi possível carregar os dados do dashboard.</p>
                <p>Tente recarregar a página.</p>
            </div>
        )}
    </main>
  );
}