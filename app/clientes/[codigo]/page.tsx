'use client'

import { UseDateFunction } from "@/app/hooks/useDateFunction"
import { Active } from "@/app/pedidos/components/active" // Supondo que este componente é responsivo
import { configApi } from "@/app/services/api"
import { AlertDemo } from "@/components/alert/alert"
import { ArrowLeft, Save } from "lucide-react"
import { redirect, useRouter } from "next/navigation" // useRouter de next/navigation
import { useEffect, useState, useCallback } from "react"
import { SelectPessoa } from "../select" // Supondo que este componente é responsivo
import { InputMask } from "primereact/inputmask"
import { SelectVendedor } from "../selectVendedor" // Supondo que este componente é responsivo
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ThreeDot } from "react-loading-indicators"

type prop = { params: { codigo: string } } // Código geralmente é string na URL

interface ICliente { // Definir a interface para melhor tipagem
    id: number;
    codigo: number;
    nome: string;
    cnpj: string | null;
    ie: string | null;
    celular: string | null;
    cep: string | null;
    estado: string | null;
    cidade: string | null;
    endereco: string | null;
    bairro: string | null;
    numero: string | null;
    observacoes: string | null;
    ativo: string;
    vendedor: number | null;
    data_cadastro: string;
    data_recadastro: string | null;
    // Adicione outros campos se existirem
}


export default function Cliente({ params }: prop) {
    const api = configApi()
    const [data, setData] = useState<ICliente | null>(null);
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [msgAlert, setMsgAlert] = useState<string>('');
    const useDateService = UseDateFunction()
    const router = useRouter();
    const { user, loading: authLoading }: any = useAuth(); // Renomear loading para authLoading para evitar conflito

    // Estados para os campos do formulário
    const [pessoa, setPessoa] = useState<string>('f'); // Default 'f'
    const [maskCnpj, setMaskCnpj] = useState<string>('999.999.999-99');
    const [placeholderPessoa, setPlaceholderPessoa] = useState<string>("000.000.000-00");
    const [cnpj, setCnpj] = useState<string>('');

    const [nome, setNome] = useState<string>('');
    const [ie, setIe] = useState<string>('');
    const [celular, setCelular] = useState<string>('');
    const [maskCelular, setMaskCelular] = useState<string>("(99) 9999-9999");


    const [cep, setCep] = useState<string>('');
    const [estado, setEstado] = useState<string>('');
    const [cidade, setCidade] = useState<string>('');
    const [endereco, setEndereco] = useState<string>('');
    const [bairro, setBairro] = useState<string>('');
    const [numero, setNumero] = useState<string>('');
    const [observacoes, setObservacoes] = useState<string>('');
    const [ativo, setAtivo] = useState<string>('S'); // Manter estado local para o componente Active
    const [codigoVendedor, setCodigoVendedor] = useState<number | undefined>(); // Pode ser undefined inicialmente
    
    // Dados não editáveis diretamente no formulário, mas exibidos
    const [codigoCliente, setCodigoCliente] = useState<number | undefined>();
    const [dataCadastro, setDataCadastro] = useState<string | undefined>();
    
    const [isLoading, setIsLoading] = useState(true); // Inicia true para busca inicial

    // Redireciona se não estiver autenticado
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!params.codigo || !user?.token) {  
            if(!params.codigo) router.push('/clientes');  
            setIsLoading(false);  
            return;
        }
        
        async function buscaCliente() {
            setIsLoading(true);
            try {
                const response = await api.get(`/clientes`, {
                    headers: { token: user.token },
                    params: { codigo: params.codigo, limit: 1 }
                });
                if (response.data && response.data.length > 0) {
                    const clienteData = response.data[0] as ICliente;
                    setData(clienteData); // Guarda os dados originais

                    // Popula os estados do formulário
                    setNome(clienteData.nome || '');
                    setCodigoCliente(clienteData.codigo);
                    setIe(clienteData.ie || '');
                    setCelular(clienteData.celular || '');
                    setCep(clienteData.cep || '');
                    setEstado(clienteData.estado || '');
                    setCidade(clienteData.cidade || '');
                    setEndereco(clienteData.endereco || '');
                    setBairro(clienteData.bairro || '');
                    setNumero(clienteData.numero || '');
                    setObservacoes(clienteData.observacoes || '');
                    setAtivo(clienteData.ativo || 'S');
                    setDataCadastro( clienteData.data_cadastro );
                    setCodigoVendedor(clienteData.vendedor ?? undefined);

                    if (clienteData.celular) {
                        const celularNumeros = clienteData.celular.replace(/\D/g, "");
                        setMaskCelular(celularNumeros.length > 10 ? "(99) 99999-9999" : "(99) 9999-9999");
                    }

                    if (clienteData.cnpj) {
                        const cnpjNumeros = clienteData.cnpj.replace(/\D/g, "");
                        setCnpj(clienteData.cnpj); // Mantém a formatação original se houver
                        if (cnpjNumeros.length > 11) {
                            setPessoa('j');
                        } else {
                            setPessoa('f');
                        }
                    } else {
                        setPessoa('f'); // Default se não houver CNPJ
                        setCnpj('');
                    }

                } else {
                    setMsgAlert("Cliente não encontrado.");
                    setVisibleAlert(true);
                    router.push('/clientes'); // Opcional: redirecionar se não encontrar
                }
            } catch (e) {
                console.error("Erro ao buscar cliente:", e);
                setMsgAlert("Erro ao carregar dados do cliente.");
                setVisibleAlert(true);
            } finally {
                setIsLoading(false);
            }
        }
        buscaCliente();
    }, [params.codigo, user?.token, router   ]);  

    useEffect(() => {
        if (pessoa === 'j') {
            setMaskCnpj("99.999.999/9999-99");
            setPlaceholderPessoa("00.000.000/0000-00");
        } else { // 'f' ou qualquer outro valor
            setMaskCnpj("999.999.999-99");
            setPlaceholderPessoa("000.000.000-00");
        }
    }, [pessoa]);

    const handlePessoaChange = (value: string) => {
        setPessoa(value);
    };

    const handleVendedorChange = (value: any) => {  
        setCodigoVendedor(Number(value));
    };

    const handleActiveChange = useCallback((newAtivoState: string) => {
        setAtivo(newAtivoState);
    }, []);

    const gravar = async () => {
        if (!data) {
            setMsgAlert("Dados originais do cliente não carregados. Não é possível salvar.");
            setVisibleAlert(true);
            return;
        }
        setIsLoading(true);

        const dataParaGravar = {
            ...data, // Mantém id, data_cadastro, etc.
            nome,
            cnpj: pessoa === 'j' ? cnpj : (pessoa === 'f' ? cnpj : null), // Garante que CNPJ/CPF está correto
            ie,
            celular,
            vendedor: codigoVendedor,
            cep,
            estado,
            cidade,
            endereco,
            bairro,
            numero,
            observacoes,
            ativo,  
        };

        try {
            const result = await api.put(`/cliente`, dataParaGravar, {  
                headers: { token: user.token },
            });
            if (result.status === 200 ) { // verificar se tem result.data.erro se o backend retornar
                 if (result.data.erro) {
                    setMsgAlert(result.data.msg || `Erro ao alterar cliente.`);
                    setVisibleAlert(true);
                } else {
                    setMsgAlert(`Cliente ${data.codigo || ''} alterado com sucesso!`);
                    setVisibleAlert(true);
                    // setData(dataParaGravar as ICliente); // Atualiza o 'data' original se necessário
                }
            } else {
                 setMsgAlert(`Erro ao alterar cliente. Status: ${result.status}`);
                 setVisibleAlert(true);
            }
        } catch (e: any) {
            console.error("Erro ao gravar cliente:", e);
            const errorMsg = e.response?.data?.msg || e.message || "Ocorreu um erro ao tentar gravar as alterações.";
            setMsgAlert(errorMsg);
            setVisibleAlert(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Classes comuns para inputs e labels
    const labelClass = "block text-sm md:text-base text-gray-700 font-semibold mb-1";
    const inputClass = "p-2 w-full text-sm md:text-base text-gray-700 font-medium shadow-md rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 read-only:bg-gray-100 read-only:cursor-not-allowed";

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-100 sm:ml-14">
                <ThreeDot variant="pulsate" color="#2563eb" size="medium"   textColor="#2563eb" />
            </div>
        );
    }
    
    if (isLoading && !data) { // Mostra loading principal se estiver carregando e não houver dados ainda
        return (
            <div className="min-h-screen flex items-center justify-center flex-col sm:ml-14 p-4 bg-slate-100">
                <ThreeDot variant="pulsate" color="#2563eb" size="medium"   textColor="#2563eb" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col sm:ml-14 p-4 bg-slate-100 pb-24 md:pb-20">
            <AlertDemo content={msgAlert} title="Atenção" visible={visibleAlert} setVisible={setVisibleAlert} to={msgAlert.includes("sucesso") ? '/clientes' : undefined} />

            {/* Cabeçalho: Título e Botão Voltar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    Editar Cliente
                </h1>
                <Button variant="outline" onClick={() => router.push('/clientes')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
            </div>

            {/* Informações do Cliente (Código, Data Cadastro) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-3 rounded-md shadow">
                    <span className={labelClass}>Código:</span>
                    <p className="text-gray-900 font-medium">{codigoCliente || 'N/A'}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow">
                    <span className={labelClass}>Data Cadastro:</span>
                    <p className="text-gray-900 font-medium">{dataCadastro || 'N/A'}</p>
                </div>
            </div>
            
            {/* Seção Nome, Pessoa, CNPJ/CPF */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6 items-end">
                <div className="lg:col-span-5 flex flex-col">
                    <label htmlFor="nome" className={labelClass}>Nome / Razão Social:</label>
                    <input id="nome" className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo ou Razão Social" />
                </div>
                <div className="lg:col-span-3 flex flex-col">
                    <label htmlFor="tipoPessoa" className={labelClass}>Pessoa:</label>
                    <SelectPessoa id="tipoPessoa" defaultTipoPessoa={pessoa} onchange={handlePessoaChange} className={inputClass} />
                </div>
                <div className="lg:col-span-4 flex flex-col">
                    <label htmlFor="cnpjCpf" className={labelClass}>{pessoa === 'j' ? 'CNPJ:' : 'CPF:'}</label>
                    <InputMask id="cnpjCpf" className={inputClass} mask={maskCnpj} placeholder={placeholderPessoa} value={cnpj} onChange={(e: any) => setCnpj(e.target.value)} />
                </div>
            </div>

            {/* Seção IE/RG e Celular */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-end">
                <div className="flex flex-col">
                    <label htmlFor="ieRg" className={labelClass}>{pessoa === 'j' ? 'IE (Inscrição Estadual):' : 'RG:'}</label>
                    <input id="ieRg" className={inputClass} value={ie} onChange={(e) => setIe(e.target.value)} placeholder={pessoa === 'j' ? 'Nº da Inscrição Estadual' : 'Nº do RG'} />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="celular" className={labelClass}>Celular:</label>
                    <InputMask id="celular" className={inputClass} mask={maskCelular} placeholder="(00) 00000-0000" value={celular} onChange={(e: any) => setCelular(e.target.value)} />
                </div>
            </div>

            {/* Seção Vendedor */}
            <div className="mb-6">
                <label htmlFor="vendedor" className={labelClass}>Vendedor:</label>
                <SelectVendedor id="vendedor" defaultVendedor={codigoVendedor} onChangeVendedor={handleVendedorChange} className={inputClass} />
            </div>
            
            {/* Seção Endereço */}
            <div className="mb-6">
                <h2 className="text-lg md:text-xl text-gray-700 font-bold mb-2">Endereço</h2>
                <hr className="border-gray-300 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
                    <div className="flex flex-col">
                        <label htmlFor="cep" className={labelClass}>CEP:</label>
                        <InputMask id="cep" className={inputClass} mask="99999-999" placeholder="00000-000" value={cep} onChange={(e: any) => setCep(e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="estado" className={labelClass}>Estado (UF):</label>
                        <input id="estado" className={inputClass} value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} placeholder="Ex: SP" maxLength={2} />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="cidade" className={labelClass}>Cidade:</label>
                        <input id="cidade" className={inputClass} value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: São Paulo" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-end">
                    <div className="flex flex-col lg:col-span-6">
                        <label htmlFor="endereco" className={labelClass}>Logradouro (Rua, Av.):</label>
                        <input id="endereco" className={inputClass} value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Ex: Av. Paulista" />
                    </div>
                    <div className="flex flex-col lg:col-span-3">
                        <label htmlFor="bairro" className={labelClass}>Bairro:</label>
                        <input id="bairro" className={inputClass} value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex: Bela Vista" />
                    </div>
                    <div className="flex flex-col lg:col-span-3">
                        <label htmlFor="numero" className={labelClass}>Número:</label>
                        <input id="numero" className={inputClass} value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 1000 ou S/N" />
                    </div>
                </div>
            </div>

            <hr className="border-gray-300 mt-5 mb-4" />

            {/* Seção Observações */}
            <div className="flex flex-col mb-6">
                <label htmlFor="observacoes" className={labelClass}>Observações:</label>
                <textarea id="observacoes" className={`${inputClass} min-h-[100px]`} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={4} />
            </div>

            {/* Componente Ativo/Inativo */}
            <div className="mb-6">
                 <label className={labelClass}>Status do Cliente:</label>
                 <Active active={ativo} handleActive={handleActiveChange} />
            </div>


            {/* Botão Gravar Fixo */}
            <div className="bg-white p-3 fixed bottom-0 left-0 right-0 shadow-md-top sm:ml-14 border-t border-gray-200">
                <div className="max-w-7xl mx-auto flex justify-end">
                    <Button 
                        className="bg-black hover:bg-gray-800 flex items-center gap-2 px-4 py-2 disabled:opacity-50" 
                        onClick={gravar}
                        disabled={isLoading} // Desabilita o botão enquanto estiver carregando/gravando
                    >
                        {isLoading ? (
                            <>
                                <ThreeDot variant="bob" color="#FFF" size="small" />
                                <span className="text-white font-bold">Salvando...</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} color="#FFF" />
                                <span className="text-white font-bold">Salvar Alterações</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}