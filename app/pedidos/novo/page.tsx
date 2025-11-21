 

'use client'
 
import { useCallback, useEffect, useState } from "react";
import ListaProdutos from "../components/produtos"; // Assumindo que é responsivo
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ListaClientes from "../components/clientes";  // Assumindo que é responsivo
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListaServicos from "../components/servicos";   // Assumindo que é responsivo
import Parcelas from "../components/parcelas";   // Assumindo que é responsivo ou será ajustado
import { configApi } from "@/app/services/api";
import Detalhes from "../components/detalhes";   // Assumindo que é responsivo
import { useRouter } from 'next/navigation'
import { ScrollArea } from "@/components/ui/scroll-area"; // ScrollArea é bom para conteúdo vertical
import { ArrowLeft, Trash2 } from "lucide-react"; // Ícone de lixeira melhor
import { SelectFormasPagamento } from "../components/selectFormasPagamento";  // Assumindo que é responsivo
import { Veiculos } from "../components/veiculos"; // Assumindo que é responsivo
import { useAuth } from "@/contexts/AuthContext";
import { TipoPedidoSeletor } from "../components/tipoPedido";  // Assumindo que é responsivo
import { ThreeDot } from "react-loading-indicators";
import { AlertDemo } from "@/components/alert/alert";
import { DateService } from "@/app/services/dateService";
import { constructNow } from "date-fns";

// Interfaces (mantenha ou melhore conforme sua estrutura de dados)

export default function NovoPedido( ){
    const  [ produtosSelecionados, setProdutosSelecionados  ] = useState<Produto_pedido[] >([]);
    const  [ servicosSelecionados, setServicosSelecionados  ] = useState<Servico_pedido[]>([]);
    const  [ clienteSelecionado, setClienteSelecionado ] = useState<clientePedido | undefined >();
    const  [ total , setTotal ] = useState(0);
    const  [ totalProdutos , setTotalProdutos ] = useState(0);
    const  [ totalServicos , setTotalServicos ] = useState(0);
    const  [ dadosOrcamento, setDadosOrcamento ] = useState<Partial<pedido>>({}); // Partial para construção gradual
    const  [ observacoes, setObservacoes ] = useState<string>('') // tipado como string
    const  [ situacao, setSituacao  ] = useState<string>('EA'); // tipado como string
    const  [ newId, setNewID ] = useState('');

    const [ codigoNovoPedido, setCodigoNovoPedido ] = useState<number>(0);
    const [ formaSelecionada , setFormaSelecionada] = useState <formaPagamento | undefined>();
    const [isLoading, setIsLoading] = useState(false);  
    const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Para o loading inicial de autenticação

    const [ visible, setVisible ] = useState<boolean>(false);
    const [ msgApi, setMsgApi ] = useState<string>(''); // msgApi tipado como string
    const [ codigoForma , setCodigoForma] = useState<number>(0);

    const dateService = DateService(); 
    const api = configApi();
    const { user, loading: authHookLoading }:any = useAuth();
    const router = useRouter();

 
        async function findOrder() {

            try{
                    let result = await api.get('/pedidos',{
                                    params:{ 
                                        vendedor: user.codigo,
                                        data: '0000-00-00 00:00:00'
                                },
                            headers: {
                                token:  user.token 
                            },
                            }  );

                       if( result.status === 200 && result.data.length > 0 ){
                             let arr:any[] = result.data;
                                let arrID = arr.map( (i) => {
                                        let pNum =   i.id.split('-'[0]) 
                                            let num = parseInt(pNum ,10)
                                            return num;
                                }  )

                              let generatedId = String(Math.max(...arrID) + 1).padStart(10,'0') + '-'+user.codigo;
                                 setNewID(generatedId)
                       return generatedId
              }    

            }catch(e ){
                console.log("Erro ao tentar consulta o ultimo id do pedido")
                       return 0
            }
        }

       
        

    // Autenticação e Geração de Código Inicial
    useEffect(() => {
       
        async function init(){
            if (!authHookLoading) {
                        setIsLoadingAuth(false);
                        if (!user) {
                            router.push('/');
                        } else {
                            const novoCodigo = gerarCodigo(user.codigo || 0); // Garante que user.codigo exista
                            setCodigoNovoPedido(novoCodigo);
                            const data_cadastro = dateService.obterDataAtual();
                            const data_recadastro = dateService.obterDataHoraAtual();
                            const parcelaGerada = gerarParcelaUnica(0, novoCodigo);

                            let idGen = await findOrder();

                            setDadosOrcamento({
                                codigo: novoCodigo,
                                id: String(idGen) ,
                                id_externo:'0',
                                total_geral: 0,
                                descontos: 0,
                                observacoes: '',
                                quantidade_parcelas: parcelaGerada.length,
                                vendedor: user.codigo,
                                situacao: 'EA',
                                tipo: 1, // Tipo padrão, pode ser ajustado
                                total_produtos: 0,
                                total_servicos: 0,
                                produtos: [],
                                servicos: [],
                                formas_Pagamento: 0, // Código da forma de pagamento
                                parcelas: parcelaGerada,
                                veiculo: 0,
                                contato: '',
                                data_cadastro: data_cadastro,
                                data_recadastro: data_recadastro,
                            });
                        }
                    }
        }

          init();
    }, [user, authHookLoading, router ]); // Adicionado dateService

    const inputTableClass = "w-full p-1 text-xs sm:text-sm text-center border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
    const cellTableClass = "px-2 py-2 text-xs sm:text-sm font-medium text-gray-700"; // Ajuste de padding e fonte


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
            // Tratar erro de quantidade inválida, talvez com um alerta
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
            // setVisibleAlertPrice(true); // Use seu alerta se necessário
            console.log("Preço inválido");
            return;
        }
        // setVisibleAlertPrice(false);
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

    function gerarCodigo(vendedor: number) {
        return Number(`${Date.now()}${vendedor}`);
    }

    function gerarParcelaUnica(total: number, codigoPedido: number): parcela[] {
        return [{ pedido: codigoPedido, parcela: 1, valor: total, vencimento: dateService.obterDataAtual() }]; // Use YYYY-MM-DD
    }
    
    function gerarParcelas(forma: formaPagamento | undefined, total: number, codigo_pedido: number): parcela[] {
        if (!forma || forma.parcelas <= 0 || total <= 0) {
            return gerarParcelaUnica(total, codigo_pedido); // Retorna parcela única se os dados da forma não forem válidos
        }
    
        const intervalo = forma.intervalo || 0; // Dias
        const numParcelas = forma.parcelas;
        const valorParcela = total / numParcelas;
        const dataBase = new Date();
        const novasParcelas: parcela[] = [];
    
        for (let i = 1; i <= numParcelas; i++) {
            const vencimento = new Date(dataBase);
            if (i > 1) { // A primeira parcela vence na data base ou com o primeiro intervalo
                vencimento.setDate(dataBase.getDate() + (intervalo * (i -1) )); // Multiplica o intervalo pelo número da parcela (menos 1 para a primeira)
            }
            novasParcelas.push({
                pedido: codigo_pedido,
                parcela: i,
                valor: parseFloat(valorParcela.toFixed(2)), // Arredonda para 2 casas decimais
                vencimento: dateService.formatarData(vencimento), // Formata para YYYY-MM-DD
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

    async function gravar (){
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
            // Certifique-se que dadosOrcamento está completo antes de enviar
            const pedidoFinal = {
                ...dadosOrcamento,
                // Garante que todos os campos obrigatórios estejam presentes
                // Se algum campo for opcional no backend, não precisa se preocupar tanto
            };

            let response = await api.post('/pedidos', [pedidoFinal] , { 
                headers: { token:  user.token  }
            });
            if (response.status === 200 && !response.data.erro) { // Verifica se há erro na resposta
                setMsgApi(`Pedido ${response.data.codigo_pedido || dadosOrcamento.codigo} registrado com sucesso!`);
                setVisible(true);
                // Limpar formulário ou redirecionar aqui, se desejado
            } else {
                setMsgApi(response.data.msg || `Erro ao tentar registrar pedido.`);
                setVisible(true);
            }
        } catch(e: any) {
            setMsgApi(e.response?.data?.msg || `Erro ao tentar registrar pedido: ${e.message}`);
            setVisible(true);
            console.error(`Erro ao enviar o orçamento: `, e);
        } finally {
            setIsLoading(false);
        }
    }

    // useEffect para calcular totais e atualizar dadosOrcamento
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
            if (  !formaSelecionada ) { // Atualiza parcela única se o total mudou
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
    }, [produtosSelecionados, servicosSelecionados, clienteSelecionado, observacoes, situacao, formaSelecionada, codigoNovoPedido]); // Removido dadosOrcamento para evitar loop


    if (isLoadingAuth || authHookLoading) {
        return (
          <div className="flex justify-center items-center h-screen bg-slate-100 sm:ml-14">
             <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="Verificando autenticação..." textColor="#2563eb" />
          </div>
        );
    }
  
    if (!user || !dadosOrcamento?.codigo) { // Se não tem usuário ou código do pedido não foi gerado
        return (
           <div className="flex justify-center items-center h-screen bg-slate-100 sm:ml-14">
             <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="Preparando formulário..." textColor="#2563eb" />
           </div>
        );
    }

    if (isLoading && !visible) { // Loading para operações como gravar, mas não para o alerta
        return( 
          <div className="min-h-screen flex items-center justify-center flex-col sm:ml-14 p-4 bg-slate-100">
            <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="Processando..." textColor="#2563eb" />
          </div> 
        );  
    }

    return (
        <div className="min-h-screen sm:ml-14 p-2 md:p-4 bg-gray-100 pb-28 md:pb-24"> {/* Padding inferior para o rodapé fixo */}
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
                    <ListaClientes selecionarCliente={setClienteSelecionado}/>
                </div>
                <div className="md:ml-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pedido:</label>
                    <TipoPedidoSeletor setTipo={handleType} tipo={dadosOrcamento?.tipo} />
                </div>
            </div>
 
            {/* Detalhes do Cliente Selecionado */}
            {clienteSelecionado && (
                <div className="w-full bg-white shadow-md rounded-lg p-3 mb-4 md:mb-6 overflow-x-auto">
                   <Table className="min-w-[600px]"> {/* min-w para forçar scroll se necessário */}
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

            <hr className="border-gray-300 mb-4 md:mb-6"/> 

            {/* Abas */}
            <div className="w-full">
                <Tabs defaultValue="Produtos" className="w-full">
                    <TabsList className="flex flex-wrap h-auto"> {/* Permite quebra de linha em mobile */}
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
                                            <TableCell className={cellTableClass}>R$ { (i.desconto || 0).toFixed(2)}</TableCell>
                                            <TableCell className={cellTableClass}>R$ { ((i.quantidade || 0) * (i.preco || 0)).toFixed(2)}</TableCell>
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
                                            <TableCell className={cellTableClass}>R$ { ((i.quantidade || 0) * (i.valor || 0)).toFixed(2)}</TableCell>
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
                        {/* Inputs para parcelas personalizadas (manter como no original se necessário, mas esconda se formaSelecionada já define) */}
                        {/*
                        <div className="p-4 border rounded-md bg-gray-50">
                            <p className="text-sm font-medium text-gray-700 mb-2">Personalizar Parcelamento (ignorado se forma de pagamento selecionada):</p>                  
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade de Parcelas:</label>  
                                    <input type="number" className={inputTableClass + " w-full"} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Intervalo entre Parcelas (dias):</label>  
                                    <input type="number" className={inputTableClass + " w-full"} value={formaSelecionada?.intervalo || ''} readOnly={!!formaSelecionada} />
                                </div>
                            </div>
                        </div>
                        */}        
                        <Parcelas  
                            dadosOrcamento={dadosOrcamento as pedido} // Cast para pedido completo
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
                            cliente={clienteSelecionado}
                            setVeiculo={handleVeic}
                            codigoPedido={codigoNovoPedido}
                            codigoVeiculo={dadosOrcamento?.veiculo}
                        />
                    </TabsContent>
                </Tabs>       
            </div>                                
        
            {/* Rodapé Fixo com Totais e Botão Gravar */}
            <div className="bg-white p-3 md:p-4 fixed bottom-0 left-0 right-0 sm:ml-14 shadow-md-top border-t border-gray-200">
                <div className="max-w-full mx-auto"> {/* Alterado para max-w-full para usar todo o espaço no sm:ml-14 */}
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
                                //onClick={ ()=> console.log("dados orcamentos: ", dadosOrcamento)} 
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
 