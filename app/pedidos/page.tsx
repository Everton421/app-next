'use client'

import { useEffect, useState } from "react";
import { configApi } from "../services/api";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { 
  Check, CheckCheck, ClipboardCheck, ClipboardList, ClipboardPenLine, 
  Edit, Plus, Printer, Wrench, X, Search, FileText, DollarSign, Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { FiltroPedidos } from "./components/filtrosPedidos";
import { DateService } from "../services/dateService";
import { TooltipProvider, TooltipTrigger, Tooltip, TooltipContent} from "@/components/ui/tooltip";
import { ThreeDot } from "react-loading-indicators";

type Situacao = 'EA' | 'RE' | 'AI' | 'FI' | 'FP';

interface Pedido {
  codigo: number;
  id: string;
  nome: string;
  total_geral: number;
  data_cadastro: string;
  situacao: Situacao;
  tipo: number;
}

const situacaoConfig: Record<Situacao, { label: string; color: string; bg: string; icon: any }> = {
  EA: { label: 'Orçamento', color: 'text-green-700', bg: 'bg-green-100', icon: Check },
  RE: { label: 'Reprovado', color: 'text-red-700', bg: 'bg-red-100', icon: X },
  AI: { label: 'Aprovado', color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCheck },
  FI: { label: 'Faturado', color: 'text-orange-600', bg: 'bg-orange-100', icon: ClipboardCheck },
  FP: { label: 'Fat. Parcial', color: 'text-blue-700', bg: 'bg-blue-200', icon: ClipboardPenLine },
};

export default function Pedidos(){
  const [dados, setDados] = useState<Pedido[]>([]);
  const [dadosFiltro, setDadosFiltro] = useState<Pedido[]>([]);
  const [pesquisa, setPesquisa] = useState<string>('');
  const [filtroSituacao, setFiltroSituacao] = useState<string>('full');
  const [dataInicial, setDataInicial] = useState<string>('')
  const [dataFinal, setDataFinal] = useState<string>('')
  const [carregando, setCarregando] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [filtertipoPedidos, setFilterTipoPedidos] = useState(1);
  const [ limit, setLimit ] = useState<number>(20);

  const router = useRouter() 
  const dateService = DateService();

  const { user, loading }:any = useAuth();

  //useEffect(() => {
  //  if (!loading && !user) {
  //    router.push('/login');
  //  }
  //}, [loading, user, router]);




  async function buscar(dataInicial: string, dataFinal: string, filter: any) {
    setDados([])
    setCarregando(true);
    setError(null);

    const params: any = {        
     data_inicial: dataInicial,
      data_final:dataFinal,
      vendedor: user.codigo,
      limit: limit,
    };

    if (filter !== null) {
      if (isNaN(Number(filter))) {
        params.nome = filter;
      } else {
        params.cliente = filter;
      }
    }

    try {
      const api = configApi(user?.token);
          const header = { token: user.token };
      
      const aux = await api.get(`/pedidos`, {
         headers: header, params })

      setDados(aux.data);
      setDadosFiltro(aux.data);
    } catch (e) {
      console.error(e);
      setError("Erro ao carregar pedidos");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    if (user && !loading) {
      const dataAtual = dateService.obterDataAtual();
      const dataAtualPrimeiroDia = dateService.obterDataAtualPrimeiroDiaDoMes();
      setDataFinal(dataAtual);
      setDataInicial(dataAtualPrimeiroDia);
      buscar(dataAtualPrimeiroDia, dataAtual, null);
    }
  }, [user, loading]);

  useEffect(() => {
    if (filtroSituacao === 'full') {
      setDadosFiltro(dados);
    } else {
      setDadosFiltro(dados.filter((v) => v.situacao === filtroSituacao));
    }
  }, [filtroSituacao, dados]);

  function handleOrder(codigo: number) {
    router.push(`/pedidos/${codigo}`);
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <ThreeDot variant="pulsate" color="#4B5563" size="medium" text="" />
      </div>
    );
  }


  
  
    //************** */
     //    <div className="min-h-screen flex flex-col sm:ml-56 p-4 sm:p-6 lg:p-8 w-full bg-gray-50">
      // <div className="w-full max-w-none"></div>
    

  return (
    
    <div className="min-h-screen flex flex-col sm:ml-52 p-2 sm:p-4 lg:p-6 w-full h-full justify-itens-center items-start bg-slate-100">
      <div className="md:w-[85%] p-2 mt-22 min-h-screen rounded-lg bg-white">
        <div className="p-2 rounded-sm bg-slate-100 w-full">
          <div className="m-2 flex flex-col md:flex-row justify-between">
            <h1 className="text-2xl md:text-4xl font-bold font-sans text-gray-800">
              Pedidos
            </h1>

            <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
              <Button
                type="button"
                variant="outline"
                className="shadow-sm w-full sm:w-auto"
                onClick={() => buscar(dataInicial, dataFinal, pesquisa)}
              >
                <Search className="h-4 w-4 mr-2" />
                <span>Buscar</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="shadow-sm w-full col-span-2 sm:w-auto"
                onClick={() => router.push('/pedidos/novo')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
            </div>
          </div>

          <div className="flex md:flex-row md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar..."
                className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900 bg-white w-full"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscar(dataInicial, dataFinal, pesquisa)}
              />
            </div>

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

        {/* Status Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-3 sm:p-4 flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <span className="text-xs sm:text-sm font-medium text-gray-600 mr-1 sm:mr-2 shrink-0">Situação:</span>
            {(['full', 'EA', 'RE', 'AI', 'FI', 'FP'] as const).map((sit) => {
              const config = situacaoConfig[sit as Situacao];
              const isActive = filtroSituacao === sit;
              const Icon = sit === 'full' ? FileText : config?.icon;
              
              return (
                <Button
                  key={sit}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroSituacao(sit)}
                  className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shrink-0 ${
                    isActive 
                      ? sit === 'full' 
                        ? 'bg-gray-900 hover:bg-gray-800'
                        : `${config?.bg} ${config?.color} border-0`
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                  <span className="hidden xs:inline">{sit === 'full' ? 'Todos' : config?.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {carregando ? (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <ThreeDot variant="pulsate" color="#4B5563" size="medium" text="" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 gap-4">
              <div className="text-red-500 text-base sm:text-lg">Erro ao carregar dados</div>
              <Button variant="outline" onClick={() => buscar(dataInicial, dataFinal, pesquisa)}>
                Tentar novamente
              </Button>
            </div>
          ) : dadosFiltro.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-600 font-medium w-12 sm:w-16 text-center text-xs sm:text-sm">Sit.</TableHead>
                    <TableHead className="text-gray-600 font-medium w-16 sm:w-20 text-xs sm:text-sm">ID</TableHead>
                    <TableHead className="text-gray-600 font-medium text-xs sm:text-sm">Cliente</TableHead>
                    <TableHead className="text-gray-600 font-medium text-right text-xs sm:text-sm hidden md:table-cell">Total</TableHead>
                    <TableHead className="text-gray-600 font-medium text-center text-xs sm:text-sm hidden sm:table-cell">Data</TableHead>
                    <TableHead className="text-gray-600 font-medium text-center w-20 sm:w-32 text-xs sm:text-sm">Tipo</TableHead>
                    <TableHead className="text-gray-600 font-medium text-right w-20 sm:w-28 text-xs sm:text-sm">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosFiltro.map((item) => {
                    const config = situacaoConfig[item.situacao as Situacao];
                    const Icon = config?.icon;
                    
                    return (
                      <TableRow 
                        key={item.codigo} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOrder(item.codigo)}
                      >
                        <TableCell className="text-center py-2 sm:py-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md ${config?.bg} ${config?.color}`}>
                                  {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{config?.label}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>

                        <TableCell className="font-medium text-gray-900 text-xs sm:text-sm py-2 sm:py-3">
                          #{item.id}
                        </TableCell>

                        <TableCell className="text-gray-700 text-xs sm:text-sm py-2 sm:py-3">
                          <span className="block truncate max-w-[120px] sm:max-w-none">{item.cliente_nome}</span>
                        </TableCell>

                        <TableCell className="text-right font-medium text-gray-900 text-xs sm:text-sm py-2 sm:py-3 hidden md:table-cell">
                          {formatCurrency(item.total_geral)}
                        </TableCell>

                        <TableCell className="text-center text-gray-600 text-xs py-2 sm:py-3 hidden sm:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {formatDate(item.data_cadastro)}
                          </div>
                        </TableCell>

                        <TableCell className="text-center py-2 sm:py-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {item.tipo === 1 ? (
                                  <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-green-100 text-green-800">
                                    <ClipboardList className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                    <span className="hidden sm:inline">PED</span>
                                    <span className="sm:hidden">P</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-purple-100 text-purple-800">
                                    <Wrench className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                    <span className="hidden sm:inline">OS</span>
                                    <span className="sm:hidden">O</span>
                                  </span>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.tipo === 1 ? 'Pedido de Venda' : 'Ordem de Serviço'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>

                        <TableCell className="text-right py-2 sm:py-3">
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-gray-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/pedidos/${item.codigo}/imprimir`);
                                    }}
                                  >
                                    <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Imprimir</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-gray-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOrder(item.codigo);
                                    }}
                                  >
                                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 gap-4">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
              <p className="text-gray-500 text-sm sm:text-base">Nenhum pedido encontrado</p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/pedidos/novo')}
              >
                Criar primeiro pedido
              </Button>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {dadosFiltro.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
            <span>{dadosFiltro.length} registro(s) encontrado(s)</span>
            <span className="font-medium text-gray-700">
              Total: {formatCurrency(dadosFiltro.reduce((acc, p) => acc + p.total_geral, 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
