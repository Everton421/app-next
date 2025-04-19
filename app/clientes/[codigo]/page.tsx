'use client'

import { UseDateFunction } from "@/app/hooks/useDateFunction"
import { Active } from "@/app/pedidos/components/active"
import { configApi } from "@/app/services/api"
import { AlertDemo } from "@/components/alert/alert"
import { ArrowLeft, Check, Delete, Save, ShieldCheck, ShieldClose, X } from "lucide-react"
import { redirect, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react" // Import useCallback
import { SelectPessoa } from "../select"
import { InputMask } from "primereact/inputmask"
import { SelectVendedor } from "../selectVendedor"
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"


export default function Cliente({ params }) {

    const api = configApi()
    const [data, setData] = useState(null); // Inicializar como null
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [msgAlert, setMsgAlert] = useState < string > ('');
    const useDateService = UseDateFunction()

    const [pessoa, setPessoa] = useState < string > ()
    const [maskCnpj, setMaskCnpj] = useState < string > ('')
    const [placeholderPessoa, setPlaceholderPessoa] = useState < string > ("")
    const [cnpj, setCnpj] = useState < string > ();


    const [nome, setNome] = useState < string > ();
    const [ie, setIe] = useState < string > ();
    const [celular, setCelular] = useState < string > ();

    const [cep, setCep] = useState < string > ('');
    const [estado, setEstado] = useState < string > ();
    const [cidade, setCidade] = useState < string > ();
    const [endereco, setEndereco] = useState < string > ();
    const [bairro, setBairro] = useState < string > ();
    const [observacoes, setObservacoes] = useState < string > ();
    const [ativo, setAtivo] = useState < string > ('S');
    const [codigoVendedor, setCodigoVendedor] = useState < number > ();
    const [codigo, setCodigo] = useState();
    const [data_cadastro, setData_cadastro] = useState();
    const [maskCelular, setMaskCelular] = useState();
    const [numero, setNumero] = useState();

    const { user, loading }: any = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/'); // Redireciona para a página de login (ajuste se for outra)
            }
        }
    }, [user, loading, router]);



    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Verificando autenticação...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Redirecionando para login...</p>
            </div>
        );
    }



    useEffect(() => {
        if (!params.codigo) redirect('/clientes');
        async function busca() {
            try {
                let dados = await api.get(`/clientes`,
                    {
                        headers: { cnpj: Number(user.cnpj) },
                        params:{codigo:params.codigo, limit:1}
                    }
                );
                if (dados.data.length > 0) {
                    setData(dados.data[0])
                    // console.log(dados.data)
                }
                if (dados.data[0].cnpj) {
                    setCnpj(dados.data[0].cnpj)
                    if (dados.data[0].cnpj.replace(/\D/g, "").length > 11) {
                        setMaskCnpj("99.999.999/999-99")
                        setPlaceholderPessoa("99.999.999/9999-99")
                        setPessoa('j')
                    }
                    if (dados.data[0].cnpj.replace(/\D/g, "").length === 11) {
                        setMaskCnpj("999.999.999-99")
                        setPlaceholderPessoa("999.999.999-99")
                        setPessoa('f')
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        busca();
    }, []); // Adicionar dependências ao useEffect

    useEffect(() => {
        if (data?.nome !== undefined) setNome(data.nome)
        if (data?.codigo !== undefined) setCodigo(data.codigo);
        if (data?.ie !== undefined) setIe(data.ie);

        if (data?.celular !== undefined) {
            let count = data.celular.replace(/\D/g, "")
            if (count > 10) setMaskCelular("(99) 99999-9999")
            if (count <= 10) setMaskCelular("(99) 9999-9999")

            setCelular(data.celular);
        }
        if (data?.vendedor !== undefined) setCodigoVendedor(data?.vendedor);
        if (data?.cep !== undefined) {
            let count = data.cep.replace(/\D/g, "");
            setCep(data.cep);
        }

        if (data?.estado !== undefined) setEstado(data.estado);
        if (data?.cidade !== undefined) setCidade(data.cidade);
        if (data?.endereco !== undefined) setEndereco(data.endereco);
        if (data?.bairro !== undefined) setBairro(data.bairro);
        if (data?.observacoes !== undefined) setObservacoes(data.observacoes);
        if (data?.ativo !== undefined) setAtivo(data.ativo);
        if (data?.data_cadastro !== undefined) setData_cadastro(data.data_cadastro)
        if (data?.numero !== undefined) setNumero(data?.numero);

        if (data?.vendedor !== undefined) {
            setCodigoVendedor(data?.vendedor);
        }

    }, [data]); // Adicionar dependências ao useEffect


    const handlePessoaChange = (value: string) => {
        setPessoa(value);
    };

    const handleVendedorChange = (value) => {
        setCodigoVendedor(Number(value));
    };
    /////////
    useEffect(() => {
        if (pessoa === 'j') {
            setMaskCnpj("99.999.999/9999-99")
            setPlaceholderPessoa("00.000.000/0000-00")
        }
        if (pessoa === 'f') {
            setMaskCnpj("999.999.999.99")
            setPlaceholderPessoa("000.000.000.00")
        }
    }, [handlePessoaChange]);
    /////////////

    const gravar = async () => {

        if (!data) return;

        const dataParaGravar = {
            ...data,
            cnpj: cnpj,
            ie: ie,
            celular: celular,
            vendedor: codigoVendedor,
            cep: cep,
            estado: estado,
            cidade: cidade,
            endereco: endereco,
            bairro: bairro,
            observacoes: observacoes,
            numero: numero,
            data_recadastro: useDateService.obterDataHoraAtual()
        };

        try {
            let result = await api.put('/cliente', dataParaGravar,
                 {
                    headers: { cnpj: Number(user.cnpj) },

                 }
                );
            if (result.status === 200 && result.data.codigo > 0) {
                console.log(result)
                setVisibleAlert(true);
                setMsgAlert(`Cliente ${data.codigo} Alterado com Sucesso!`);
            }
        } catch (e) {
            console.error(e);
        }

        console.log(dataParaGravar)

    };

    const handleActive = useCallback((param: string) => {
        setData((prevData) => {
            if (!prevData) return prevData; // Evita erros se prevData for null

            return {
                ...prevData,
                ativo: param,
            };
        });
    }, []);



    if (!data) {
        return <div className=" min-h-screen flex flex-col sm:ml-14 p-4 bg-slate-100"  >
            < span className=" text-gray-500 font-bold text-2xl">
                Carregando...
            </span>
        </div>;  
    }


    return (
        <div className="min-h-screen flex flex-col sm:ml-14 p-4 bg-slate-100 space-y-6 pb-20"> {/* Adiciona space-y e padding-bottom */}
            <AlertDemo content={msgAlert} title="titulo" visible={visibleAlert} setVisible={setVisibleAlert} to={'/clientes'} />
            
                <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Detalhes do Cliente
                        </h1>
                        <Button variant="outline" onClick={() => router.push('/clientes')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                        </Button>
                     
              </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 flex-wrap">
                <div className="bg-white p-2 rounded-md shadow-md">
                    <span className="text-lg text-gray-600 font-bold font-sans">
                        Código: {codigo}
                    </span>
                </div>
                <div className="bg-white p-2 rounded-md shadow-md">
                    <span className="text-lg text-gray-600 font-bold font-sans">
                        Data Cadastro: {data_cadastro}
                    </span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Grupo Nome */}
                <div className="w-full lg:w-1/2 flex flex-col gap-1">
                    <label htmlFor="nome" className="text-lg text-gray-600 font-bold font-sans">
                        Nome:
                    </label>
                    <input
                        id="nome"
                        className="p-2 w-full text-lg font-bold shadow-md rounded-md" // w-full
                        placeholder="Nome do Cliente"
                        value={nome} // Use value para controle
                        onChange={(v) => setNome(v.target.value)}
                    />
                </div>

                {/* Grupo Pessoa e CNPJ/CPF */}
                <div className="w-full lg:w-1/2 flex flex-col sm:flex-row sm:items-end flex-wrap gap-2 sm:gap-4">
                    {/* Pessoa */}
                    <div className="flex flex-col gap-1 flex-shrink-0"> {/* flex-shrink-0 para evitar encolher demais */}
                      <label className="text-lg text-gray-600 font-bold font-sans">
                            Pessoa:
                      </label>
                      {/* Adicione w-full ou min-w para o select se necessário */}
                      <SelectPessoa defaultTipoPessoa={pessoa} onchange={handlePessoaChange} />
                    </div>

                    {/* CNPJ/CPF */}
                    <div className="flex flex-col gap-1 flex-grow"> {/* flex-grow para ocupar espaço */}
                      <label htmlFor="cnpj" className="text-lg text-gray-600 font-bold font-sans">
                        CNPJ/CPF:
                      </label>
                       <InputMask
                            id="cnpj"
                            value={cnpj}
                            mask={maskCnpj}
                            placeholder={placeholderPessoa}
                            onChange={(e) => setCnpj(e.target.value)}
                            // w-full para ocupar espaço no flex-grow, p-2 etc.
                            className="p-2 text-lg w-full text-gray-600 font-bold font-sans shadow-md rounded-md"
                        />
                    </div>
                </div>
           </div>

            {/* --- Seção IE/RG e Celular --- */}
            {/* Alterado para flex-col por padrão, md:flex-row para telas médias, adicionado gap */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Grupo IE/RG */}
                <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <label htmlFor="ie" className="text-lg text-gray-600 font-bold font-sans">
                        IE/RG:
                    </label>
                    <input
                        id="ie"
                        className="p-2 w-full text-lg text-gray-600 font-bold font-sans shadow-md rounded-md" // w-full
                        value={ie} // Use value
                        onChange={(v) => setIe(v.target.value)}
                        placeholder="Inscrição Estadual ou RG"
                    />
                </div>

                {/* Grupo Celular */}
                <div className="w-full md:w-1/2 flex flex-col gap-1">
                    <label htmlFor="celular" className="text-lg text-gray-600 font-bold font-sans">
                        Celular:
                    </label>
                    <InputMask
                        id="celular"
                        // value={data?.celular} // Pode usar o estado 'celular' diretamente se for controlado
                        value={celular}
                        mask={maskCelular}
                        placeholder="(99) 99999-9999"
                        onChange={(v) => setCelular(v.target.value)}
                        className="p-2 w-full text-lg text-gray-600 font-bold font-sans shadow-md rounded-md" // w-full
                    />
                </div>
            </div>

            {/* --- Seção Vendedor --- */}
            {/* Usando flex-col ou flex-row com items-center para alinhar label e select */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-lg text-gray-600 font-bold font-sans flex-shrink-0"> {/* flex-shrink-0 para não encolher */}
                    Vendedor: {/* {codigoVendedor} Removido daqui para clareza, o Select mostra */}
                </label>
                {/* Adicionar classes ao SelectVendedor se ele não for responsivo por padrão */}
                <SelectVendedor defaultVendedor={codigoVendedor} onChangeVendedor={handleVendedorChange} />
            </div>

            {/* --- Seção Endereço --- */}
            <div className="w-full space-y-4"> {/* Agrupa os campos de endereço com espaço */}
                <div>
                  <span className="text-xl text-gray-700 font-bold font-sans"> {/* Aumentado um pouco */}
                    Endereço
                  </span>
                  <hr className="border-gray-400 mt-1" /> {/* Ajuste na cor e margem */}
                </div>

                {/* Linha CEP, Estado, Cidade */}
                {/* flex-col por padrão, md:flex-row, usa flex-1 para distribuir espaço */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex-1 flex flex-col gap-1"> {/* flex-1 */}
                        <label htmlFor="cep" className="text-lg text-gray-600 font-bold font-sans">Cep:</label>
                        <InputMask // MUDADO PARA INPUTMASK CASO CEP TENHA MÁSCARA, senão use input normal
                            id="cep"
                            mask="99999-999" // Adicione a máscara apropriada
                            className="p-2 w-full text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                            placeholder="00000-000"
                            onChange={(v) => setCep(v.target.value)}
                            value={cep}
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1"> {/* flex-1 */}
                        <label htmlFor="estado" className="text-lg text-gray-600 font-bold font-sans">Estado:</label>
                        <input
                            id="estado"
                            className="p-2 w-full text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                            placeholder="UF"
                            maxLength={2} // Limita estado a 2 chars
                            value={estado} // Use value
                            onChange={(v) => setEstado(v.target.value.toUpperCase())} // Converte para maiúsculo
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1"> {/* flex-1 */}
                        <label htmlFor="cidade" className="text-lg text-gray-600 font-bold font-sans">Cidade:</label>
                        <input
                            id="cidade"
                            className="p-2 w-full text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                            placeholder="Nome da Cidade"
                            value={cidade} // Use value
                            onChange={(v) => setCidade(v.target.value)}
                        />
                    </div>
                </div>

                {/* Linha Endereço, Bairro, Número */}
                {/* flex-col por padrão, lg:flex-row */}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    {/* Endereço - Ocupa mais espaço */}
                    <div className="w-full lg:flex-[2] flex flex-col gap-1"> {/* lg:flex-[2] ou lg:w-1/2 */}
                        <label htmlFor="endereco" className="text-lg text-gray-600 font-bold font-sans">Endereço:</label>
                        <input
                            id="endereco"
                            className="p-2 w-full text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                            placeholder="Rua, Avenida, etc."
                            value={endereco} // Use value
                            onChange={(v) => setEndereco(v.target.value)}
                        />
                    </div>
                     {/* Bairro */}
                     <div className="w-full lg:flex-1 flex flex-col gap-1"> {/* lg:flex-1 ou lg:w-1/4 */}
                        <label htmlFor="bairro" className="text-lg text-gray-600 font-bold font-sans">Bairro:</label>
                        <input
                            id="bairro"
                            className="p-2 w-full text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                            placeholder="Nome do Bairro"
                            value={bairro} // Use value
                            onChange={(v) => setBairro(v.target.value)}
                        />
                    </div>
                    {/* Número */}
                    <div className="w-full lg:w-1/4 flex flex-col gap-1"> {/* lg:w-1/4 ou largura fixa pequena */}
                        <label htmlFor="numero" className="text-lg text-gray-600 font-bold font-sans">Número:</label>
                        <input
                            id="numero"
                            type="text" // Mantem como texto para S/N etc.
                            className="p-2 w-full text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                            placeholder="Ex: 123 ou S/N"
                            value={numero} // Use value
                            onChange={(v) => setNumero(v.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* --- Seção Observações --- */}
            <div className="flex flex-col gap-1">
                <label htmlFor="observacoes" className="text-lg text-gray-600 font-bold font-sans">
                    Observações:
                </label>
                <textarea
                    id="observacoes"
                    className="w-full rounded-md shadow-md p-2 text-lg" // w-full, adiciona p-2 e text-lg
                    rows={4} // Define uma altura inicial
                    value={observacoes} // Use value
                    onChange={(e) => setObservacoes(e.target.value)}
                />
            </div>

            <Active active={data?.ativo} handleActive={handleActive} />

            {/* --- Barra Inferior Fixa --- */}
            {/* Mantida como estava, geralmente funciona bem */}
            <div className="bg-white p-3 sm:ml-14 fixed bottom-0 left-0 right-0 rounded-t-xl shadow-lg border-t border-gray-200"> {/* Ajuste no padding, rounded-t, shadow, border */}
                {/* Centraliza o botão */}
                <div className="w-full flex justify-center sm:justify-end"> {/* Centraliza mobile, alinha direita sm+ */}
                    <button className="bg-black flex items-center rounded-xl gap-2 p-2 px-4 hover:bg-gray-800 transition-colors" onClick={() => gravar()}> {/* Padding e hover */}
                        <span className="text-white font-bold text-lg">Gravar</span> {/* Texto um pouco maior */}
                        <Save size={22} color="#FFF" /> {/* Tamanho do ícone */}
                    </button>
                </div>
            </div>
        </div>
        // --- FIM DAS ALTERAÇÕES DE ESTILO ---
    );
}