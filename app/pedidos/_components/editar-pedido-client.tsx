'use client'

import { useCallback, useEffect, useState } from "react";
import ListaProdutos from "../components/produtos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ListaClientes from "../components/clientes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListaServicos from "../components/servicos";
import Parcelas from "../components/parcelas";
import { configApi } from "@/app/services/api";
import Detalhes from "../components/detalhes";
import { useRouter } from 'next/navigation'
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Trash2 } from "lucide-react";
import { SelectFormasPagamento } from "../components/selectFormasPagamento";
import { Veiculos } from "../components/veiculos";
import { useAuth } from "@/contexts/AuthContext";
import { TipoPedidoSeletor } from "../components/tipoPedido";
import { ThreeDot } from "react-loading-indicators";
import { AlertDemo } from "@/components/alert/alert";
import { DateService } from "@/app/services/dateService";

interface Produto_pedido {
  codigo: number;
  descricao: string;
  quantidade: number;
  preco: number;
  desconto?: number;
  total?: number;
}
interface Servico_pedido {
  codigo: number;
  aplicacao: string;
  quantidade: number;
  valor: number;
  total?: number;
}
interface clientePedido {
  codigo: number;
  nome: string;
  cnpj?: string;
  cidade?: string;
  celular?: string;
}
interface parcela {
  pedido: number;
  parcela: number;
  valor: number;
  vencimento: string;
}
interface formaPagamento {
  codigo: number;
  descricao: string;
  parcelas: number;
  intervalo: number;
}
interface pedido {
  codigo: number;
  id: string;
  id_externo: number | string;
  cliente: clientePedido;
  codigo_cliente: number;
  total_geral: number;
  descontos: number;
  observacoes: string | null;
  quantidade_parcelas: number;
  vendedor: number;
  situacao: string;
  tipo: number;
  total_produtos: number;
  total_servicos: number;
  produtos: Produto_pedido[];
  servicos: Servico_pedido[];
  formas_Pagamento: number;
  parcelas: parcela[];
  veiculo: number | null;
  contato: string | null;
  data_cadastro: string;
  data_recadastro: string | null;
}

export function EditarPedidoClient({
  pedidoInicial,
  codigoPedido,
}: {
  pedidoInicial: pedido;
  codigoPedido: number;
}) {
  const [produtosSelecionados, setProdutosSelecionados] = useState<Produto_pedido[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<Servico_pedido[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<clientePedido>(pedidoInicial.cliente);
  const [total, setTotal] = useState<number>(pedidoInicial.total_geral);
  const [totalProdutos, setTotalProdutos] = useState<number>(pedidoInicial.total_produtos);
  const [totalServicos, setTotalServicos] = useState<number>(pedidoInicial.total_servicos);
  const [dadosOrcamento, setDadosOrcamento] = useState<pedido>(pedidoInicial);
  const [parcelas, setParcelas] = useState<parcela[]>();
  const [situacao, setSituacao] = useState<string>(pedidoInicial.situacao);
  const [observacoes, setObservacoes] = useState<string>(pedidoInicial.observacoes || '');
  const [visibleAlertPrice, setVisibleAlertPrice] = useState(false);
  const [codigoNovoPedido, setCodigoNovoPedido] = useState();
  const [formaSelecionada, setFormaSelecionada] = useState<formaPagamento | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [msgApi, setMsgApi] = useState<string>();
  const [codigoForma, setCodigoForma] = useState<number>(0);

  const { user }: any = useAuth();
  const router = useRouter();
  const codigo_pedido: number = codigoPedido;
  const api = configApi();
  const dateService = DateService();

  useEffect(
    () => {
      function ajusteTotais() {
        let totalProdutos = 0;
        let totalServicos = 0;
        let totalGeral = 0;

        if (dadosOrcamento && dadosOrcamento.servicos.length > 0) {
          dadosOrcamento.servicos.map((i) => {
            totalServicos += i.quantidade * i.valor;
          })
        }
        if (dadosOrcamento && dadosOrcamento.produtos.length > 0) {
          dadosOrcamento.produtos.map((i) => {
            totalProdutos += i.quantidade * i.preco;
          })
        }

        setTotalProdutos(totalProdutos)
        setTotalServicos(totalServicos)

        totalGeral = totalProdutos + totalServicos
        setTotal(totalGeral)

        let qtdParcelas: number = 0;
        if (parcelas && parcelas.length > 0) qtdParcelas = parcelas.length

        setDadosOrcamento(
          (prev: any) => ({
            ...prev,
            cliente: clienteSelecionado,
            codigo_cliente: clienteSelecionado?.codigo,
            total_produtos: totalProdutos,
            total_servicos: totalServicos,
            total_geral: totalGeral,
            quantidade_parcelas: qtdParcelas,
            observacoes: observacoes,
            situacao: situacao,
          })
        )
      }
      ajusteTotais();
    },
    [produtosSelecionados, servicosSelecionados, clienteSelecionado, observacoes, situacao, parcelas]
  )

  useEffect(() => {
    if (codigo_pedido && total > 0) {
      let parcela = gerarParcelaUnica(total, codigo_pedido)
      setDadosOrcamento(
        (prev: any) => ({
          ...prev,
          parcelas: parcela
        })
      )
    }
  }, [total, codigo_pedido])

  useEffect(() => {
    if (codigo_pedido !== null && formaSelecionada && total > 0) {
      let aux = gerarParcelas(formaSelecionada, total, codigo_pedido)
      setDadosOrcamento(
        (prev: any) => ({
          ...prev,
          quantidade_parcelas: aux.length,
          parcelas: aux
        })
      )
    }
  }, [formaSelecionada, total, codigo_pedido])

  const selecionarItens = (i: Produto_pedido) => {
    if (i && produtosSelecionados) {
      i.quantidade = 1
      setProdutosSelecionados((prev: any) => [...prev, i])
    }
    if (dadosOrcamento && dadosOrcamento.produtos) {
      let auxProd = dadosOrcamento.produtos
      let v = auxProd.some((p: Produto_pedido) => p.codigo === i.codigo)
      if (v) {
        console.log(`produto ${i.codigo} ja foi adicionado`)
        return
      }
      i.total = (i.quantidade || 1) * (i.preco || 0);
      auxProd.push(i);
      setDadosOrcamento((prev: any) => ({
        ...prev,
        produtos: auxProd
      }))
    }
  }

  const selecionarServicos = (i: Servico_pedido) => {
    if (i && servicosSelecionados) {
      setServicosSelecionados((prev: any) => [...prev, i])
    }
    let auxServ = dadosOrcamento?.servicos || [];
    if (auxServ.length > 0) {
      let v = auxServ.some((s) => s.codigo === i.codigo);
      if (v) {
        console.log(`servicos ${i.codigo} ja foi adicionado`)
        return;
      }
    }
    i.total = (i.quantidade || 1) * (i.valor || 0);
    auxServ.push(i);
    setDadosOrcamento((prev: any) => ({ ...prev, servicos: auxServ }))
  }

  const handleIncrement = (item: Produto_pedido, quantidadeStr: string) => {
    const quantidade = parseInt(quantidadeStr, 10);
    if (isNaN(quantidade) || quantidade < 0) {
      console.log("é necessario informar uma quantidade valida")
      return;
    }
    if (produtosSelecionados !== undefined) {
      setProdutosSelecionados((prevSelectedItems: any) => {
        return prevSelectedItems.map((i: Produto_pedido) => {
          if (i.codigo === item.codigo) {
            return { ...i, quantidade: quantidade };
          }
          return i;
        });
      });
    }
    if (dadosOrcamento && dadosOrcamento.produtos.length > 0) {
      let auxprod = dadosOrcamento.produtos;
      let prod = auxprod.map((i: Produto_pedido) => {
        if (i.codigo === item.codigo) {
          return { ...i, quantidade: quantidade, total: (quantidade * i.preco) };
        }
        return i;
      })
      setDadosOrcamento((prev: any) => ({ ...prev, produtos: prod }))
    }
  };

  const handleIncrementServices = (item: Servico_pedido, quantidadeStr: string) => {
    const quantidade = parseInt(quantidadeStr, 10);
    if (isNaN(quantidade) || quantidade < 0) {
      console.log("é necessario informar uma quantidade valida")
      return;
    }
    if (servicosSelecionados !== undefined) {
      setServicosSelecionados((prevSelectedItems: any) => {
        return prevSelectedItems.map((i: Servico_pedido) => {
          if (i.codigo === item.codigo) {
            return { ...i, quantidade: quantidade };
          }
          return i;
        });
      });
    }
    if (dadosOrcamento && dadosOrcamento.servicos) {
      let auxServ = dadosOrcamento?.servicos || [];
      let serv = auxServ.map((s) => {
        if (s.codigo === item.codigo) {
          return { ...s, quantidade: quantidade, total: (quantidade * item.valor) }
        }
        return s;
      })
      setDadosOrcamento((prev: any) => ({ ...prev, servicos: serv }))
    }
  };

  const handlePrice = (item: Produto_pedido, precoStr: string) => {
    const price = parseFloat(precoStr);
    if (isNaN(price) || price < 0) {
      setVisibleAlertPrice(true);
      return;
    } else {
      setVisibleAlertPrice(false);
    }
    setProdutosSelecionados((prevSelectedItems: Produto_pedido[]) => {
      return prevSelectedItems.map((i) => {
        if (i.codigo === item.codigo) {
          return { ...i, preco: price };
        }
        return i;
      });
    });
    if (dadosOrcamento && dadosOrcamento.produtos.length > 0) {
      let auxprod = dadosOrcamento.produtos;
      let prod = auxprod.map((i: Produto_pedido) => {
        if (i.codigo === item.codigo) {
          return { ...i, preco: price, total: (i.quantidade * price) };
        }
        return i;
      })
      setDadosOrcamento((prev: any) => ({ ...prev, produtos: prod }))
    }
  };

  const handlePriceServices = (item: Servico_pedido, valorStr: string) => {
    const valor = parseFloat(valorStr);
    let auxPreco = isNaN(valor) || valor < 0 ? 0 : valor;
    if (isNaN(valor) || valor < 0) {
    }
    setServicosSelecionados((prevSelectedItems: Servico_pedido[]) => {
      return prevSelectedItems.map((i) => {
        if (i.codigo === item.codigo) {
          return { ...i, valor: auxPreco };
        }
        return i;
      });
    });
    if (dadosOrcamento && dadosOrcamento.servicos) {
      let auxServ = dadosOrcamento?.servicos || [];
      let serv = auxServ.map((s) => {
        if (s.codigo === item.codigo) {
          return { ...s, valor: auxPreco, total: (s.quantidade * auxPreco) }
        }
        return s;
      })
      setDadosOrcamento((prev: any) => ({ ...prev, servicos: serv }))
    }
  };

  const deleteItem = (item: Produto_pedido) => {
    setProdutosSelecionados((prevSelectedItems: Produto_pedido[]) =>
      prevSelectedItems.filter(i => i.codigo !== item.codigo)
    );
    if (dadosOrcamento && dadosOrcamento.produtos) {
      let prods = dadosOrcamento.produtos.filter(i => i.codigo !== item.codigo);
      setDadosOrcamento((prev: any) => ({ ...prev, produtos: prods }))
    }
  }

  const deleteServico = (item: Servico_pedido) => {
    setServicosSelecionados((prevSelectedItems: Servico_pedido[]) =>
      prevSelectedItems.filter(i => i.codigo !== item.codigo)
    );
    if (dadosOrcamento && dadosOrcamento.servicos) {
      let services = dadosOrcamento.servicos.filter((i) => i.codigo !== item.codigo);
      setDadosOrcamento((prev: any) => ({ ...prev, servicos: services }))
    }
  }

  function gerarParcelaUnica(total: number, codigoPedido: number): parcela[] {
    const aux = [{ pedido: codigoPedido, parcela: 1, valor: total, vencimento: dateService.obterDataHoraAtual() }];
    return aux
  }

  function gerarParcelas(forma: formaPagamento | undefined, total: number, codigo_pedido: number): parcela[] {
    if (!forma || !forma.parcelas || forma.parcelas <= 0 || total <= 0) {
      return gerarParcelaUnica(total, codigo_pedido);
    }
    const intervalo = forma.intervalo;
    const numParcelas = forma.parcelas;
    const valorParcela = parseFloat((total / numParcelas).toFixed(2));
    const dataBase = new Date();
    const novasParcelas = [];
    for (let i = 1; i <= numParcelas; i++) {
      const vencimento = new Date(dataBase);
      if (i > 1) {
        vencimento.setDate(dataBase.getDate() + (intervalo * (i - 1)));
      }
      novasParcelas.push({
        pedido: codigo_pedido,
        parcela: i,
        valor: valorParcela,
        vencimento: dateService.formatarData(vencimento),
      });
    }
    return novasParcelas;
  }

  function handleVeic(veic: any) {
    setDadosOrcamento(
      (prev: any) => {
        if (veic && veic.codigo && prev) {
          return { ...prev, veiculo: veic.codigo }
        }
        return prev;
      }
    )
  }
  function handleType(tipo: any) {
    setDadosOrcamento(
      (prev: any) => {
        if (prev) {
          return { ...prev, tipo: tipo }
        }
        return prev;
      }
    )
  }

  async function gravar() {
    if (!dadosOrcamento || !dadosOrcamento.cliente?.codigo) {
      setMsgApi("É necessário informar o cliente.");
      setVisible(true);
      return;
    }
    if ((dadosOrcamento.produtos || []).length === 0 && (dadosOrcamento.servicos || []).length === 0) {
      setMsgApi("Adicione pelo menos um produto ou serviço ao pedido.");
      setVisible(true);
      return;
    }

    const dadosParaGravar = {
      ...dadosOrcamento,
      data_recadastro: dateService.obterDataHoraAtual()
    }

    setIsLoading(true)
    try {
      let response = await api.post('/pedidos', [dadosParaGravar], {
        headers: { token: user.token }
      });
      if (response.status === 200 && !response.data.erro) {
        setMsgApi(`Pedido ${response.data.codigo_pedido || dadosParaGravar.codigo} atualizado com sucesso!`);
        setVisible(true)
      } else {
        setMsgApi(response.data.msg || `Erro ao tentar atualizar pedido.`);
        setVisible(true);
      }
    } catch (e: any) {
      setMsgApi(e.response?.data?.msg || `Erro ao tentar atualizar pedido! ${e.message}`);
      setVisible(true)
      console.error(` Erro ao enviar o orcamento: `, e)
    } finally {
      setIsLoading(false)
    }
  }

  const inputTableClass = "w-full p-1 text-xs sm:text-sm text-center border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
  const cellTableClass = "px-2 py-2 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap";

  return (
    <div className="min-h-screen sm:ml-56 p-2 md:p-4 bg-gray-100 pb-28 md:pb-24">
      <AlertDemo content={msgApi} title="Atenção" visible={visible} setVisible={setVisible} to={msgApi?.includes("sucesso") ? '/pedidos' : undefined} />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">
            Editando Pedido: {dadosOrcamento && dadosOrcamento.id && dadosOrcamento.id}
          </h1>
          {dadosOrcamento && dadosOrcamento.id_externo && (
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              Código Externo: {dadosOrcamento.id_externo}
            </h1>
          )}
        </div>
        <Button variant="outline" onClick={() => router.push('/pedidos')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      {/* Seleção de Cliente e Tipo de Pedido */}
      <div className="w-full flex flex-col md:flex-row md:items-end gap-4 mb-4 md:mb-6">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente:</label>
          <ListaClientes selecionarCliente={setClienteSelecionado} clienteInicial={dadosOrcamento?.cliente} />
        </div>
        <div className="md:ml-4 flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pedido:</label>
          <TipoPedidoSeletor setTipo={handleType} tipo={dadosOrcamento?.tipo} />
        </div>
      </div>

      {/* Detalhes do Cliente Selecionado */}
      {dadosOrcamento?.cliente && (
        <div className="w-full bg-white shadow-md rounded-lg p-3 mb-4 md:mb-6 overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableBody>
              <TableRow>
                <TableCell className={cellTableClass}><strong>Cód:</strong> {dadosOrcamento.cliente.codigo}</TableCell>
                <TableCell className={cellTableClass}><strong>Nome:</strong> {dadosOrcamento.cliente.nome}</TableCell>
                <TableCell className={cellTableClass}><strong>CNPJ/CPF:</strong> {dadosOrcamento.cliente.cnpj || 'N/A'}</TableCell>
                <TableCell className={cellTableClass}><strong>Cidade:</strong> {dadosOrcamento.cliente.cidade || 'N/A'}</TableCell>
                <TableCell className={cellTableClass}><strong>Celular:</strong> {dadosOrcamento.cliente.celular || 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <hr className="border-gray-300 mb-4 md:mb-6" />

      {/* Abas */}
      <div className="w-full">
        <Tabs defaultValue="Produtos" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="Produtos">Produtos</TabsTrigger>
            <TabsTrigger value="Servicos">Serviços</TabsTrigger>
            <TabsTrigger value="Parcelas">Parcelas</TabsTrigger>
            <TabsTrigger value="Detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="Veículos">Veículos</TabsTrigger>
          </TabsList>

          {/* Conteúdo da Aba Produtos */}
          <TabsContent value="Produtos" className="mt-4">
            <div className="w-full md:w-1/2 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adicionar Produto:</label>
              <ListaProdutos selecionarProduto={selecionarItens} />
            </div>
            <ScrollArea className="h-auto max-h-96 w-full rounded-md border">
              <div className="overflow-x-auto">
                <Table className="min-w-[800px] bg-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cellTableClass}>Cód.</TableHead>
                      <TableHead className={`${cellTableClass} w-[30%]`}>Descrição</TableHead>
                      <TableHead className={`${cellTableClass} w-[100px]`}>Qtd.</TableHead>
                      <TableHead className={`${cellTableClass} w-[120px]`}>Preço Unit.</TableHead>
                      <TableHead className={cellTableClass}>Desc.</TableHead>
                      <TableHead className={`${cellTableClass} w-[120px]`}>Total</TableHead>
                      <TableHead className={`${cellTableClass} text-center w-[50px]`}>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(dadosOrcamento?.produtos || []).length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-4 text-gray-500">Nenhum produto adicionado.</TableCell></TableRow>
                    )}
                    {dadosOrcamento?.produtos?.map((i: Produto_pedido) => (
                      <TableRow key={i.codigo}>
                        <TableCell className={cellTableClass}>{i.codigo}</TableCell>
                        <TableCell className={cellTableClass}>{i.descricao}</TableCell>
                        <TableCell className={cellTableClass}>
                          <input type="number" className={inputTableClass} placeholder="Qtd"
                            value={i.quantidade || ''}
                            onChange={(e: any) => handleIncrement(i, e.target.value)}
                          />
                        </TableCell>
                        <TableCell className={cellTableClass}>
                          <input type="number" step="0.01" className={inputTableClass} placeholder="Preço"
                            value={i.preco || ''}
                            onChange={(e) => handlePrice(i, e.target.value)}
                          />
                        </TableCell>
                        <TableCell className={cellTableClass}>R$ {(i.desconto || 0).toFixed(2)}</TableCell>
                        <TableCell className={cellTableClass}>R$ {Number(i.total || 0).toFixed(2)}</TableCell>
                        <TableCell className={`${cellTableClass} text-center`}>
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-red-500 hover:bg-red-100" onClick={() => deleteItem(i)}>
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Conteúdo da Aba Serviços */}
          <TabsContent value="Servicos" className="mt-4">
            <div className="w-full md:w-1/2 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adicionar Serviço:</label>
              <ListaServicos selecionarServico={selecionarServicos} />
            </div>
            <ScrollArea className="h-auto max-h-96 w-full rounded-md border">
              <div className="overflow-x-auto">
                <Table className="min-w-[700px] bg-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cellTableClass}>Cód.</TableHead>
                      <TableHead className={`${cellTableClass} w-[40%]`}>Aplicação/Descrição</TableHead>
                      <TableHead className={`${cellTableClass} w-[100px]`}>Qtd.</TableHead>
                      <TableHead className={`${cellTableClass} w-[120px]`}>Valor Unit.</TableHead>
                      <TableHead className={`${cellTableClass} w-[120px]`}>Total</TableHead>
                      <TableHead className={`${cellTableClass} text-center w-[50px]`}>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(dadosOrcamento?.servicos || []).length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-4 text-gray-500">Nenhum serviço adicionado.</TableCell></TableRow>
                    )}
                    {dadosOrcamento?.servicos?.map((i: Servico_pedido) => (
                      <TableRow key={i.codigo}>
                        <TableCell className={cellTableClass}>{i.codigo}</TableCell>
                        <TableCell className={cellTableClass}>{i.aplicacao}</TableCell>
                        <TableCell className={cellTableClass}>
                          <input type="number" className={inputTableClass} placeholder="Qtd"
                            value={i.quantidade || ''}
                            onChange={(e: any) => handleIncrementServices(i, e.target.value)}
                          />
                        </TableCell>
                        <TableCell className={cellTableClass}>
                          <input type="number" step="0.01" className={inputTableClass} placeholder="Valor"
                            value={i.valor || ''}
                            onChange={(e) => handlePriceServices(i, e.target.value)}
                          />
                        </TableCell>
                        <TableCell className={cellTableClass}>R$ {Number(i.total || 0).toFixed(2)}</TableCell>
                        <TableCell className={`${cellTableClass} text-center`}>
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-red-500 hover:bg-red-100" onClick={() => deleteServico(i)}>
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Conteúdo da Aba Parcelas */}
          <TabsContent value="Parcelas" className="mt-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento:</label>
              <SelectFormasPagamento
                codigoForma={dadosOrcamento?.formas_Pagamento || codigoForma}
                setCodigoForma={setCodigoForma}
                formaSelecionada={formaSelecionada}
                setFormaSelecionada={setFormaSelecionada}
              />
            </div>
            <div className="p-4 border rounded-md bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Parcelamento Personalizado (se aplicável):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade de Parcelas:</label>
                  <input
                    type="number"
                    readOnly
                    value={dadosOrcamento?.quantidade_parcelas || formaSelecionada?.parcelas || ''}
                    className={`${inputTableClass} w-full bg-gray-100`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Intervalo entre Parcelas (dias):</label>
                  <input
                    type="number"
                    readOnly
                    value={formaSelecionada?.intervalo || ''}
                    className={`${inputTableClass} w-full bg-gray-100`}
                  />
                </div>
              </div>
            </div>
            <Parcelas
              dadosOrcamento={dadosOrcamento}
              setDadosOrcamento={setDadosOrcamento}
              total={total}
            />
          </TabsContent>

          {/* Conteúdo da Aba Detalhes */}
          <TabsContent value="Detalhes" className="mt-4">
            <Detalhes setSituacao={setSituacao} situacao={situacao} obsPedido={observacoes} setObsPedido={setObservacoes} />
          </TabsContent>

          {/* Conteúdo da Aba Veículos */}
          <TabsContent value="Veículos" className="mt-4">
            <Veiculos
              cliente={dadosOrcamento?.cliente as any}
              setVeiculo={handleVeic}
              codigoPedido={codigo_pedido}
              codigoVeiculo={dadosOrcamento?.veiculo}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Rodapé Fixo com Totais e Botão Gravar */}
      <div className="bg-white p-3 md:p-4 fixed bottom-0 left-0 right-0 sm:ml-56 shadow-md-top border-t border-gray-200">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1">
              <span className="text-gray-600 font-semibold text-xs sm:text-sm">Total: R$ {total?.toFixed(2)}</span>
              <span className="text-gray-600 font-semibold text-xs sm:text-sm">Produtos: R$ {totalProdutos?.toFixed(2)}</span>
              <span className="text-gray-600 font-semibold text-xs sm:text-sm">Serviços: R$ {totalServicos?.toFixed(2)}</span>
            </div>
            <div className="mt-2 md:mt-0 flex justify-center md:justify-end">
              <Button
                onClick={gravar}
                disabled={isLoading || !dadosOrcamento?.cliente || ((dadosOrcamento?.produtos?.length === 0 && dadosOrcamento?.servicos?.length === 0))}
                className="w-full md:w-auto px-6 py-2 text-sm"
              >
                {isLoading && !visible ? (
                  <ThreeDot variant="pulsate" color="#FFF" size="small" text="" />
                ) : "SALVAR ALTERAÇÕES"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}