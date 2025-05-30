// Componente pai (cliente)
'use client'

import { UseDateFunction } from "@/app/hooks/useDateFunction"
import { configApi } from "@/app/services/api"
import { AlertDemo } from "@/components/alert/alert"
import { ArrowLeft, Save  } from "lucide-react"
import {  useRouter  } from "next/navigation"
import { useEffect, useState, useCallback } from "react" // Import useCallback

import { InputMask } from 'primereact/inputmask';
import { SelectPessoa } from "../select" // Supondo que este componente é responsivo ou ajustaremos seu container
import { SelectVendedor } from "../selectVendedor" // Supondo que este componente é responsivo ou ajustaremos seu container
import { Button } from "@/components/ui/button"
import { DateService } from "@/app/services/dateService"
import { useAuth } from "@/contexts/AuthContext"

export default function NovoCliente() {
    const api = configApi()
    const [msgAlert, setMsgAlert] = useState<string>('');

    const [ nome, setNome ]       = useState<string>();
    const [ cnpj, setCnpj ]       = useState<string>();
    const [ ie, setIe ]           = useState<string>();
    const [ celular, setCelular ] = useState<string>();

    const [ cep, setCep ]                   = useState<string>('');
    const [ estado, setEstado ]             = useState<string>();
    const [ cidade, setCidade ]             = useState<string>();
    const [ endereco, setEndereco ]         = useState<string>();
    const [ bairro, setBairro ]             = useState<string>();
    const [ observcoes, setObservcoes ]     = useState<string>();
    const [ ativo, setAtivo ]               = useState<string>('S');
    const [ rota, setRota ]                 = useState<string | null >(null)
    const [ maskCnpj , setMaskCnpj ]        = useState<string  > ('')
    const [pessoa , setPessoa ]             = useState<string  > ('f')
    const [ placeholderPessoa , setPlaceholderPessoa ] = useState<string > ("000.000.000.00")
    const [ codigoVendedor, setCodigoVendedor ]     = useState<number>();
    const [ numero, setNumero ] = useState<string | null>(null);
    const [ visible, setVisible ] = useState<boolean>(false)
    const router = useRouter();

    const dateService = DateService();
    const { user }: any = useAuth();
 
    async function gravar (){
        // ... (lógica de gravação permanece a mesma)
        if( !cep || cep === null || cep === '' ){
            setVisible(true)
            setMsgAlert("é necessario informar o cep para gravar!")
            return; // Adicionar return para evitar múltiplas chamadas e processamento desnecessário
        }
        if( !cidade || cidade === null || cidade === '' ){
            setVisible(true)
            setMsgAlert("é necessario informar a cidade para gravar!")
            return;
        }
        // ... (Adicionar return para todas as validações)
        if( !nome || nome === null || nome === '' ){
            setVisible(true)
            setMsgAlert("é necessario informar o nome para gravar!")
            return;
        }
        if( !cnpj || cnpj === null || cnpj === '' ){
            setVisible(true)
            setMsgAlert("é necessario informar o cnpj para gravar!")
            return;
        }
        if( !celular || celular === null || celular === '' ){
            setVisible(true)
            setMsgAlert("é necessario informar o celular para gravar!")
            return;
        }
        if( !endereco || endereco === null || endereco === '' ){
            setVisible(true)
            setMsgAlert("é necessario informar o endereco para gravar!")
            return;
        }
        if( !bairro || bairro === null || bairro === '' ){
            setVisible(true)
            setMsgAlert("é necessario informar o bairro para gravar!")
            return;
        }
        if( !estado || estado === null || estado === '' ){
            setVisible(true)
            setMsgAlert("é necessario informar o estado para gravar!")
            return;
        }
        if( !numero || numero === null || numero === '' ){
            setVisible(true)
            setMsgAlert("é necessario informar o numero para gravar!")
            return;
        }

        const dados = {
            cep: cep,
            cidade: cidade,
            estado: estado,
            bairro: bairro,
            endereco: endereco,
            celular: celular,
            cnpj: cnpj,
            nome: nome,
            ativo: ativo,
            numero:numero,
            data_cadastro: dateService.obterDataAtual(),
            data_recadastro: dateService.obterDataHoraAtual(),
            id:0,
            // Adicionar vendedor se for necessário no backend
            // codigo_vendedor: codigoVendedor 
        }

        try{
            let  result = await api.post('/cliente', dados ,{
                headers: { token:  user.token }
            });

            if( result.status === 200 && !result.data.erro){
                setVisible(true)
                setMsgAlert('Cliente cadastrado com sucesso!')
                setRota('/clientes')
            } else if( result.status === 200 &&  result.data.erro){
                setVisible(true)
                setMsgAlert(result.data.msg)
            } else {
                // Caso genérico de erro não tratado acima
                setVisible(true)
                setMsgAlert('Ocorreu um erro ao tentar gravar o cliente. Status: ' + result.status)
            }
            console.log(result)
        } catch(e:any){
            console.error(e); // Usar console.error para erros
            const errorMsg = e.response?.data?.msg || e.message || 'Ocorreu um erro desconhecido ao tentar gravar o cliente!';
            setVisible(true)
            setMsgAlert(errorMsg);
        }
    }

    useEffect(()=>{
        if( pessoa === 'j'  ){
            setMaskCnpj("99.999.999/9999-99")
            setPlaceholderPessoa("00.000.000/0000-00")
        }
        if( pessoa === 'f'  ){
            setMaskCnpj("999.999.999.99")
            setPlaceholderPessoa("000.000.000.00")
        }
    },[pessoa])

    const handlePessoaChange = (value: string) => {
        setPessoa(value);
        setCnpj(''); // Limpar CNPJ/CPF ao mudar o tipo de pessoa
    };

    const handleVendedorChange = (value:any ) => {
        setCodigoVendedor(Number(value));
    };

    // Classes comuns para inputs e labels para facilitar a manutenção
    const labelClass = "block text-sm md:text-base text-gray-700 font-semibold mb-1";
    const inputClass = "p-2 w-full text-sm md:text-base text-gray-700 font-medium shadow-md rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
     
    return (
        // Adicionado pb-20 para dar espaço para o botão fixo no final em telas menores
        <div className="min-h-screen flex flex-col sm:ml-14 p-4 bg-slate-100 pb-20 md:pb-16">
            <AlertDemo content={msgAlert} title="Atenção" visible={visible} setVisible={setVisible} to={rota} />

            {/* Cabeçalho: Data e Botão Voltar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="bg-white p-2 rounded-md shadow-md">
                    <span className="text-xs md:text-lg text-gray-600 font-bold font-sans">
                        Data de cadastro: {dateService.obterDataAtual()}
                    </span>
                </div>
                <Button variant="outline" onClick={() => router.push('/clientes')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
            </div>

            {/* Seção Nome, Pessoa, CNPJ/CPF */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6 items-end">
                {/* Nome */}
                <div className="lg:col-span-5 flex flex-col">
                    <label htmlFor="nome" className={labelClass}>Nome:</label>
                    <input
                        id="nome"
                        className={inputClass}
                        placeholder="Nome completo ou Razão Social"
                        value={nome || ''}
                        onChange={(v)=> setNome(v.target.value)}
                    />
                </div>

                {/* Tipo de Pessoa */}
                <div className="lg:col-span-3 flex flex-col">
                    <label htmlFor="tipoPessoa" className={labelClass}>Pessoa:</label>
                    <SelectPessoa id="tipoPessoa" defaultTipoPessoa={pessoa} onchange={handlePessoaChange} /> 
                    {/* Certifique-se que SelectPessoa use algo como className={inputClass} ou tenha props para estilização */}
                </div>

                {/* CNPJ/CPF */}
                <div className="lg:col-span-4 flex flex-col">
                    <label htmlFor="cnpjCpf" className={labelClass}>{pessoa === 'j' ? 'CNPJ:' : 'CPF:'}</label>
                    <InputMask
                        id="cnpjCpf"
                        mask={maskCnpj}
                        placeholder={placeholderPessoa}
                        value={cnpj || ''}
                        onChange={(v:any)=> setCnpj(v.target.value)} 
                        className={inputClass} // Aplicar a classe de input padrão
                    />
                </div>
            </div>

            {/* Seção IE/RG e Celular */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-end">
                {/* IE/RG */}
                <div className="flex flex-col">
                    <label htmlFor="ieRg" className={labelClass}>{pessoa === 'j' ? 'IE:' : 'RG:'}</label>
                    <input
                        id="ieRg"
                        className={inputClass}
                        placeholder={pessoa === 'j' ? 'Inscrição Estadual' : 'Registro Geral'}
                        value={ie || ''}
                        onChange={(v)=> setIe(v.target.value)}
                    />
                </div>

                {/* Celular */}
                <div className="flex flex-col">
                    <label htmlFor="celular" className={labelClass}>Celular:</label>
                    <InputMask
                        id="celular"
                        mask="(99) 99999-9999"  
                        placeholder="(00) 00000-0000"
                        value={celular || ''}
                        onChange={(v)=> setCelular(String(v.target.value))} 
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Seção Vendedor */}
            <div className="mb-6">
                <label htmlFor="vendedor" className={labelClass}>
                    Vendedor: {codigoVendedor ? `(Cód: ${codigoVendedor})` : ''}
                </label>
                <SelectVendedor id="vendedor" defaultVendedor={codigoVendedor} onChangeVendedor={handleVendedorChange} />
                {/* Certifique-se que SelectVendedor use algo como className={inputClass} ou tenha props para estilização */}
            </div>
            
            {/* Seção Endereço */}
            <div className="mb-6">
                <h2 className="text-lg md:text-xl text-gray-700 font-bold font-sans mb-2">Endereço</h2>
                <hr className="border-gray-300 mb-4" />

                {/* Linha CEP, Estado, Cidade */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
                    <div className="flex flex-col">
                        <label htmlFor="cep" className={labelClass}>CEP:</label>
                        <InputMask
                            id="cep"
                            className={inputClass}
                            placeholder="00000-000"
                            mask="99999-999"
                            value={cep || ''}
                            onChange={(v:any)=> setCep(v.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="estado" className={labelClass}>Estado:</label>
                        <input
                            id="estado"
                            className={inputClass}
                            placeholder="Ex.: PR"
                            value={estado || ''}
                            maxLength={2} // Comum para siglas de estado
                            onChange={(v:any)=> setEstado(v.target.value.toUpperCase())} // Forçar maiúsculas
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="cidade" className={labelClass}>Cidade:</label>
                        <input
                            id="cidade"
                            className={inputClass}
                            placeholder="Ex.: Maringá"
                            value={cidade || ''}
                            onChange={(v)=> setCidade(v.target.value)}
                        />
                    </div>
                </div>

                {/* Linha Endereço, Bairro, Número */}
                {/* Usando grid com colunas de tamanhos diferentes para melhor distribuição em telas maiores */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-end">
                    <div className="flex flex-col lg:col-span-6"> {/* Endereço ocupa mais espaço */}
                        <label htmlFor="endereco" className={labelClass}>Endereço:</label>
                        <input
                            id="endereco"
                            className={inputClass}
                            placeholder="Rua, Avenida, etc."
                            value={endereco || ''}
                            onChange={(v)=> setEndereco(v.target.value)}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-3">
                        <label htmlFor="bairro" className={labelClass}>Bairro:</label>
                        <input
                            id="bairro"
                            className={inputClass}
                            placeholder="Nome do bairro"
                            value={bairro || ''}
                            onChange={(v)=> setBairro(v.target.value)}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-3"> {/* Número pode ser menor */}
                        <label htmlFor="numero" className={labelClass}>Número:</label>
                        <input
                            id="numero"
                            type="text" // Pode ser texto para permitir "S/N"
                            className={inputClass}
                            placeholder="Ex: 123 ou S/N"
                            value={numero || ''}
                            onChange={(v)=> setNumero(v.target.value)}
                        />
                    </div>
                </div>
            </div>

            <hr className="border-gray-300 mt-5 mb-4" />

            {/* Seção Observações */}
            <div className="flex flex-col mb-6">
                <label htmlFor="observacoes" className={labelClass}>Observações:</label>
                <textarea
                    id="observacoes"
                    className={`${inputClass} min-h-[100px]`} // Adiciona altura mínima
                    value={observcoes || ''}
                    onChange={(v)=> setObservcoes(v.target.value)}
                />
            </div>

            {/* Botão Gravar Fixo */}
            {/* Adicionado sm:ml-14 para alinhar com o conteúdo principal se a sidebar estiver presente */}
            <div className="bg-white p-3 fixed bottom-0 left-0 right-0 shadow-md-top sm:ml-14 border-t border-gray-200">
                {/* shadow-md-top é uma customização, pode usar shadow-md e ajustar se necessário */}
                <div className="max-w-7xl mx-auto flex justify-end"> {/* Centraliza conteúdo e alinha botão à direita */}
                    <Button className="bg-black hover:bg-gray-800 flex items-center gap-2 px-4 py-2" onClick={() => gravar()}>
                        <span className="text-white font-bold">Gravar</span>
                        <Save size={20} color="#FFF" />
                    </Button>
                </div>
            </div>
        </div>
    );
}