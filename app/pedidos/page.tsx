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

  return (
    <div className="min-h-screen flex flex-col sm:ml-14 p-4 w-full bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Pedidos</h1>
              <p className="text-sm text-gray-500 mt-1">Gerencie pedidos e ordens de serviço</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700"
                onClick={() => buscar(dataInicial, dataFinal, pesquisa)}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button 
                className="bg-gray-900 hover:bg-gray-800 text-white"
                onClick={() => router.push('/pedidos/novo')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por código ou nome do cliente..."
                  className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900 bg-white"
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
        </div>

        {/* Status Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-4 flex items-center gap-2 overflow-x-auto">
            <span className="text-sm font-medium text-gray-600 mr-2">Situação:</span>
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
                  className={`flex items-center gap-2 ${
                    isActive 
                      ? sit === 'full' 
                        ? 'bg-gray-900 hover:bg-gray-800'
                        : `${config?.bg} ${config?.color} border-0`
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {sit === 'full' ? 'Todos' : config?.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {carregando ? (
            <div className="flex items-center justify-center py-20">
              <ThreeDot variant="pulsate" color="#4B5563" size="medium" text="" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="text-red-500 text-lg">Erro ao carregar dados</div>
              <Button variant="outline" onClick={() => buscar(dataInicial, dataFinal, pesquisa)}>
                Tentar novamente
              </Button>
            </div>
          ) : dadosFiltro.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-600 font-medium w-16 text-center">Sit.</TableHead>
                    <TableHead className="text-gray-600 font-medium w-20">ID</TableHead>
                    <TableHead className="text-gray-600 font-medium">Cliente</TableHead>
                    <TableHead className="text-gray-600 font-medium text-right">Total</TableHead>
                    <TableHead className="text-gray-600 font-medium text-center">Data</TableHead>
                    <TableHead className="text-gray-600 font-medium text-center w-32">Tipo</TableHead>
                    <TableHead className="text-gray-600 font-medium text-right w-28">Ações</TableHead>
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
                        <TableCell className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${config?.bg} ${config?.color}`}>
                                  {Icon && <Icon className="h-4 w-4" />}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{config?.label}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>

                        <TableCell className="font-medium text-gray-900">
                          #{item.id}
                        </TableCell>

                        <TableCell className="text-gray-700">
                          {item.cliente_nome}
                        </TableCell>

                        <TableCell className="text-right font-medium text-gray-900">
                          {formatCurrency(item.total_geral)}
                        </TableCell>

                        <TableCell className="text-center text-gray-600">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {formatDate(item.data_cadastro)}
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {item.tipo === 1 ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    <ClipboardList className="h-3 w-3 mr-1" />
                                    PED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    <Wrench className="h-3 w-3 mr-1" />
                                    OS
                                  </span>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.tipo === 1 ? 'Pedido de Venda' : 'Ordem de Serviço'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-gray-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/pedidos/${item.codigo}/imprimir`);
                                    }}
                                  >
                                    <Printer className="h-4 w-4 text-gray-600" />
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
                                    className="h-8 w-8 hover:bg-gray-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOrder(item.codigo);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 text-gray-600" />
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
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <FileText className="h-12 w-12 text-gray-300" />
              <p className="text-gray-500">Nenhum pedido encontrado</p>
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
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
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
