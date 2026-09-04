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
import { Produto_pedido, Servico_pedido, clientePedido, formaPagamento, pedido, parcela } from "@/types/pedido";

export function NovoPedidoClient({
    dadosOrcamentoInicial,
    initialNewId,
}: {
    dadosOrcamentoInicial: pedido;
    initialNewId: string;
}) {
    const [produtosSelecionados, setProdutosSelecionados] = useState<Produto_pedido[]>([]);
    const [servicosSelecionados, setServicosSelecionados] = useState<Servico_pedido[]>([]);
    const [clienteSelecionado, setClienteSelecionado] = useState<clientePedido | undefined>();
    const [total, setTotal] = useState(0);
    const [totalProdutos, setTotalProdutos] = useState(0);
    const [totalServicos, setTotalServicos] = useState(0);
    const [dadosOrcamento, setDadosOrcamento] = useState<Partial<pedido>>(dadosOrcamentoInicial);
    const [observacoes, setObservacoes] = useState<string>('');
    const [situacao, setSituacao] = useState<string>('EA');
    const [newId] = useState(initialNewId);

    const [codigoNovoPedido, setCodigoNovoPedido] = useState<number>(dadosOrcamentoInicial.codigo || 0);
    const [formaSelecionada, setFormaSelecionada] = useState<formaPagamento | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    const [visible, setVisible] = useState<boolean>(false);
    const [msgApi, setMsgApi] = useState<string>('');
    const [codigoForma, setCodigoForma] = useState<number>(0);

    const dateService = DateService();
    const api = configApi();
    const { user }: any = useAuth();
    const router = useRouter();

    const inputTableClass = "w-full p-1 text-xs sm:text-sm text-center border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
    const cellTableClass = "px-2 py-2 text-xs sm:text-sm font-medium text-gray-700";

    const selecionarItens = (i: Produto_pedido) => {
        if (i) {
            const itemExistente = produtosSelecionados.find(p => p.codigo === i.codigo);
            if (itemExistente) {
                console.log(`Produto ${i.codigo} já foi adicionado.`);
                return;
            }
            setProdutosSelecionados(prev => [...prev, { ...i, quantidade: 1, preco: i.preco || 0 }]);
        }
    };

    const selecionarServicos = (i: Servico_pedido) => {
        if (i) {
            const servicoExistente = servicosSelecionados.find(s => s.codigo === i.codigo);
            if (servicoExistente) {
                console.log(`Serviço ${i.codigo} já foi adicionado.`);
                return;
            }
            setServicosSelecionados(prev => [...prev, { ...i, quantidade: 1, valor: i.valor || 0, total: (i.valor || 0) * 1 }]);
        }
    };

    const handleIncrement = (itemCodigo: number, novaQuantidadeStr: string) => {
        const novaQuantidade = parseInt(novaQuantidadeStr, 10);
        if (isNaN(novaQuantidade) || novaQuantidade < 0) {
            console.log("Quantidade inválida");
            return;
        }
        setProdutosSelecionados(prev =>
            prev.map(p => (p.codigo === itemCodigo ? { ...p, quantidade: novaQuantidade } : p))
        );
    };

    const handleIncrementServices = (itemCodigo: number, novaQuantidadeStr: string) => {
        const novaQuantidade = parseInt(novaQuantidadeStr, 10);
        if (isNaN(novaQuantidade) || novaQuantidade < 0) {
            console.log("Quantidade inválida");
            return;
        }
        setServicosSelecionados(prev =>
            prev.map(s => (s.codigo === itemCodigo ? { ...s, quantidade: novaQuantidade } : s))
        );
    };

    const handlePrice = (itemCodigo: number, novoPrecoStr: string) => {
        const novoPreco = parseFloat(novoPrecoStr);
        if (isNaN(novoPreco) || novoPreco < 0) {
            console.log("Preço inválido");
            return;
        }
        setProdutosSelecionados(prev =>
            prev.map(p => (p.codigo === itemCodigo ? { ...p, preco: novoPreco } : p))
        );
    };

    const handlePriceServices = (itemCodigo: number, novoValorStr: string) => {
        const novoValor = parseFloat(novoValorStr);
        if (isNaN(novoValor) || novoValor < 0) {
            console.log("Valor inválido");
            return;
        }
        setServicosSelecionados(prev =>
            prev.map(s => (s.codigo === itemCodigo ? { ...s, valor: novoValor } : s))
        );
    };

    const deleteItem = (itemCodigo: number) => {
        setProdutosSelecionados(prev => prev.filter(p => p.codigo !== itemCodigo));
    };

    const deleteServico = (itemCodigo: number) => {
        setServicosSelecionados(prev => prev.filter(s => s.codigo !== itemCodigo));
    };

    function gerarParcelaUnica(total: number, codigoPedido: number): parcela[] {
        return [{ pedido: codigoPedido, parcela: 1, valor: total, vencimento: dateService.obterDataAtual() }];
    }

    function gerarParcelas(forma: formaPagamento | undefined, total: number, codigo_pedido: number): parcela[] {
        if (!forma || forma.parcelas <= 0 || total <= 0) {
            return gerarParcelaUnica(total, codigo_pedido);
        }

        const intervalo = forma.intervalo || 0;
        const numParcelas = forma.parcelas;
        const valorParcela = total / numParcelas;
        const dataBase = new Date();
        const novasParcelas: parcela[] = [];

        for (let i = 1; i <= numParcelas; i++) {
            const vencimento = new Date(dataBase);
            if (i > 1) {
                vencimento.setDate(dataBase.getDate() + (intervalo * (i - 1)));
            }
            novasParcelas.push({
                pedido: codigo_pedido,
                parcela: i,
                valor: parseFloat(valorParcela.toFixed(2)),
                vencimento: dateService.formatarData(vencimento),
            });
        }
        return novasParcelas;
    }

    const handleVeic = useCallback((veic: { codigo: number } | null) => {
        setDadosOrcamento(prev => ({ ...prev, veiculo: veic ? Number(veic.codigo) : 0 }));
    }, []);

    const handleType = useCallback((tipo: number) => {
        setDadosOrcamento(prev => ({ ...prev, tipo }));
    }, []);

    async function gravar() {
        if (!dadosOrcamento?.cliente?.codigo) {
            setMsgApi("É necessário selecionar um cliente para o pedido.");
            setVisible(true);
            return;
        }
        if (produtosSelecionados.length === 0 && servicosSelecionados.length === 0) {
            setMsgApi("Adicione pelo menos um produto ou serviço ao pedido.");
            setVisible(true);
            return;
        }

        setIsLoading(true);
        try {
            const pedidoFinal = {
                ...dadosOrcamento,
            };

            let response = await api.post('/pedidos', [pedidoFinal], {
                headers: { token: user.token }
            });
            if (response.status === 200 && !response.data.erro) {
                setMsgApi(`Pedido ${response.data.codigo_pedido || dadosOrcamento.codigo} registrado com sucesso!`);
                setVisible(true);
            } else {
                setMsgApi(response.data.msg || `Erro ao tentar registrar pedido.`);
                setVisible(true);
            }
        } catch (e: any) {
            setMsgApi(e.response?.data?.msg || `Erro ao tentar registrar pedido: ${e.message}`);
            setVisible(true);
            console.error(`Erro ao enviar o orçamento: `, e);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        let accTotalProdutos = 0;
        const produtosAtualizados = produtosSelecionados.map(p => {
            const totalItem = (p.quantidade || 0) * (p.preco || 0);
            accTotalProdutos += totalItem;
            return { ...p, total: totalItem };
        });

        let accTotalServicos = 0;
        const servicosAtualizados = servicosSelecionados.map(s => {
            const totalItem = (s.quantidade || 0) * (s.valor || 0);
            accTotalServicos += totalItem;
            return { ...s, total: totalItem };
        });

        const totalGeral = accTotalProdutos + accTotalServicos;
        setTotalProdutos(accTotalProdutos);
        setTotalServicos(accTotalServicos);
        setTotal(totalGeral);

        let parcelasAtuais = dadosOrcamento?.parcelas || [];
        if (formaSelecionada) {
            parcelasAtuais = gerarParcelas(formaSelecionada, totalGeral, codigoNovoPedido);
        } else {
            if (!formaSelecionada) {
                parcelasAtuais = gerarParcelaUnica(totalGeral, codigoNovoPedido);
            }
        }

        setDadosOrcamento(prev => ({
            ...prev,
            cliente: clienteSelecionado,
            codigo_cliente: clienteSelecionado?.codigo,
            total_produtos: accTotalProdutos,
            total_servicos: accTotalServicos,
            produtos: produtosAtualizados,
            servicos: servicosAtualizados,
            total_geral: totalGeral,
            observacoes: observacoes,
            situacao: situacao,
            parcelas: parcelasAtuais,
            quantidade_parcelas: parcelasAtuais.length,
            formas_Pagamento: formaSelecionada?.codigo || prev?.formas_Pagamento || 0,
        }));
    }, [produtosSelecionados, servicosSelecionados, clienteSelecionado, observacoes, situacao, formaSelecionada, codigoNovoPedido]);

    if (isLoading && !visible) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col sm:ml-56 p-4 bg-slate-100">
                <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="Processando..." textColor="#2563eb" />
            </div>
        );
    }

    return (
        <div className="min-h-screen sm:ml-56 p-2 md:p-4 bg-gray-100 pb-28 md:pb-24">
            <AlertDemo content={msgApi} title="Atenção" visible={visible} setVisible={setVisible} to={msgApi?.includes("sucesso") ? '/pedidos' : undefined} />

            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    Novo Pedido <span className="text-base font-normal text-gray-600">(Nº {newId})</span>
                </h1>
                <Button variant="outline" onClick={() => router.push('/pedidos')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
            </div>

            {/* Seleção de Cliente e Tipo de Pedido */}
            <div className="w-full flex flex-col md:flex-row md:items-end gap-4 mb-4 md:mb-6">
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente:</label>
                    <ListaClientes selecionarCliente={setClienteSelecionado} />
                </div>
                <div className="md:ml-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pedido:</label>
                    <TipoPedidoSeletor setTipo={handleType} tipo={dadosOrcamento?.tipo} />
                </div>
            </div>

            {/* Detalhes do Cliente Selecionado */}
            {clienteSelecionado && (
                <div className="w-full bg-white shadow-md rounded-lg p-3 mb-4 md:mb-6 overflow-x-auto">
                    <Table className="min-w-[600px]">
                        <TableBody>
                            <TableRow>
                                <TableCell className={cellTableClass}><strong>Cód:</strong> {clienteSelecionado.codigo}</TableCell>
                                <TableCell className={cellTableClass}><strong>Nome:</strong> {clienteSelecionado.nome}</TableCell>
                                <TableCell className={cellTableClass}><strong>CNPJ/CPF:</strong> {clienteSelecionado.cnpj || 'N/A'}</TableCell>
                                <TableCell className={cellTableClass}><strong>Cidade:</strong> {clienteSelecionado.cidade || 'N/A'}</TableCell>
                                <TableCell className={cellTableClass}><strong>Celular:</strong> {clienteSelecionado.celular || 'N/A'}</TableCell>
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
                                            <TableHead className={`${cellTableClass} w-[50px]`}>Ação</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {produtosSelecionados.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-4">Nenhum produto adicionado.</TableCell></TableRow>}
                                        {produtosSelecionados.map((i) => (
                                            <TableRow key={i.codigo}>
                                                <TableCell className={cellTableClass}>{i.codigo}</TableCell>
                                                <TableCell className={cellTableClass}>{i.descricao}</TableCell>
                                                <TableCell className={cellTableClass}>
                                                    <input type="number" className={inputTableClass} placeholder="Qtd"
                                                        value={i.quantidade}
                                                        onChange={(e) => handleIncrement(i.codigo, e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className={cellTableClass}>
                                                    <input type="number" step="0.01" className={inputTableClass} placeholder="Preço"
                                                        value={i.preco}
                                                        onChange={(e) => handlePrice(i.codigo, e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className={cellTableClass}>R$ {(i.desconto || 0).toFixed(2)}</TableCell>
                                                <TableCell className={cellTableClass}>R$ {((i.quantidade || 0) * (i.preco || 0)).toFixed(2)}</TableCell>
                                                <TableCell className={cellTableClass}>
                                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-red-500 hover:bg-red-100" onClick={() => deleteItem(i.codigo)}>
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
                                            <TableHead className={`${cellTableClass} w-[50px]`}>Ação</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {servicosSelecionados.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-4">Nenhum serviço adicionado.</TableCell></TableRow>}
                                        {servicosSelecionados.map((i) => (
                                            <TableRow key={i.codigo}>
                                                <TableCell className={cellTableClass}>{i.codigo}</TableCell>
                                                <TableCell className={cellTableClass}>{i.aplicacao}</TableCell>
                                                <TableCell className={cellTableClass}>
                                                    <input type="number" className={inputTableClass} placeholder="Qtd"
                                                        value={i.quantidade}
                                                        onChange={(e) => handleIncrementServices(i.codigo, e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className={cellTableClass}>
                                                    <input type="number" step="0.01" className={inputTableClass} placeholder="Valor"
                                                        value={i.valor}
                                                        onChange={(e) => handlePriceServices(i.codigo, e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className={cellTableClass}>R$ {((i.quantidade || 0) * (i.valor || 0)).toFixed(2)}</TableCell>
                                                <TableCell className={cellTableClass}>
                                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-red-500 hover:bg-red-100" onClick={() => deleteServico(i.codigo)}>
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
                    <TabsContent value="Parcelas" className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento:</label>
                            <SelectFormasPagamento
                                codigoForma={codigoForma}
                                setCodigoForma={setCodigoForma}
                                formaSelecionada={formaSelecionada}
                                setFormaSelecionada={setFormaSelecionada}
                            />
                        </div>
                        <Parcelas
                            dadosOrcamento={dadosOrcamento as pedido}
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
                            cliente={clienteSelecionado as any}
                            setVeiculo={handleVeic}
                            codigoPedido={codigoNovoPedido}
                            codigoVeiculo={dadosOrcamento?.veiculo}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Rodapé Fixo com Totais e Botão Gravar */}
            <div className="bg-white p-3 md:p-4 fixed bottom-0 left-0 right-0 sm:ml-56 shadow-md-top border-t border-gray-200">
                <div className="max-w-full mx-auto">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div className="text-center md:text-left">
                            <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">Total: R$ {total?.toFixed(2)}</span>
                        </div>
                        <div className="text-center md:text-left">
                            <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">Produtos: R$ {totalProdutos?.toFixed(2)}</span>
                        </div>
                        <div className="text-center md:text-left">
                            <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">Serviços: R$ {totalServicos?.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 md:mt-0 flex justify-center md:justify-end">
                            <Button
                                onClick={gravar}
                                disabled={isLoading || !clienteSelecionado || (produtosSelecionados.length === 0 && servicosSelecionados.length === 0)}
                                className="w-full md:w-auto px-6 py-2 text-sm md:text-base"
                            >
                                {isLoading ? (
                                    <ThreeDot variant="pulsate" color="#FFF" size="small" text="" />
                                ) : "GRAVAR PEDIDO"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}