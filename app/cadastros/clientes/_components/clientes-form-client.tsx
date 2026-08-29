'use client';

import { Active } from "@/app/pedidos/components/active";
import { configApi } from "@/app/services/api";
import { DateService } from "@/app/services/dateService";
import { AlertDemo } from "@/components/alert/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InputMask } from "primereact/inputmask";
import { SelectPessoa } from "../select";
import { SelectVendedor } from "../selectVendedor";

interface ICliente {
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
}

export function ClientesFormClient({
    dadosIniciais,
    idInicial,
}: {
    dadosIniciais: ICliente | null;
    idInicial?: string;
}) {
    const api = configApi();
    const dateService = DateService();
    const { user }: any = useAuth();
    const router = useRouter();

    const isEdit = Boolean(dadosIniciais?.codigo);

    const [id, setId] = useState<string>(dadosIniciais?.id ? String(dadosIniciais.id) : idInicial ?? "");

    const initPessoa = () => {
        if (dadosIniciais?.cnpj) {
            const numeros = dadosIniciais.cnpj.replace(/\D/g, "");
            return numeros.length > 11 ? "j" : "f";
        }
        return "f";
    };
    const [pessoa, setPessoa] = useState<string>(initPessoa);
    const [maskCnpj, setMaskCnpj] = useState<string>(initPessoa() === "j" ? "99.999.999/9999-99" : "999.999.999-99");
    const [placeholderPessoa, setPlaceholderPessoa] = useState<string>(initPessoa() === "j" ? "00.000.000/0000-00" : "000.000.000-00");

    const initCelular = dadosIniciais?.celular || "";
    const [maskCelular, setMaskCelular] = useState<string>(
        initCelular.replace(/\D/g, "").length > 10 ? "(99) 99999-9999" : "(99) 9999-9999"
    );

    const [nome, setNome] = useState<string>(dadosIniciais?.nome || "");
    const [cnpj, setCnpj] = useState<string>(dadosIniciais?.cnpj || "");
    const [ie, setIe] = useState<string>(dadosIniciais?.ie || "");
    const [celular, setCelular] = useState<string>(initCelular);
    const [cep, setCep] = useState<string>(dadosIniciais?.cep || "");
    const [estado, setEstado] = useState<string>(dadosIniciais?.estado || "");
    const [cidade, setCidade] = useState<string>(dadosIniciais?.cidade || "");
    const [endereco, setEndereco] = useState<string>(dadosIniciais?.endereco || "");
    const [bairro, setBairro] = useState<string>(dadosIniciais?.bairro || "");
    const [numero, setNumero] = useState<string>(dadosIniciais?.numero || "");
    const [observacoes, setObservacoes] = useState<string>(dadosIniciais?.observacoes || "");
    const [ativo, setAtivo] = useState<string>(dadosIniciais?.ativo || "S");
    const [codigoVendedor, setCodigoVendedor] = useState<number | undefined>(
        dadosIniciais?.vendedor ?? undefined
    );

    const [visible, setVisible] = useState(false);
    const [msgAlert, setMsgAlert] = useState<string>("");
    const [rota, setRota] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    function alertMsg(msg: string) {
        setMsgAlert(msg);
        setVisible(true);
    }

    const handlePessoaChange = (value: string) => {
        setPessoa(value);
        if (value === "j") {
            setMaskCnpj("99.999.999/9999-99");
            setPlaceholderPessoa("00.000.000/0000-00");
        } else {
            setMaskCnpj("999.999.999-99");
            setPlaceholderPessoa("000.000.000-00");
        }
        if (!isEdit) setCnpj("");
    };

    const handleVendedorChange = (value: any) => {
        setCodigoVendedor(Number(value));
    };

    const handleActiveChange = (value: string) => {
        setAtivo(value);
    };

    async function gravar() {
        if (!user) return;

        if (!isEdit) {
            if (!cep) return alertMsg("é necessario informar o cep para gravar!");
            if (!cidade) return alertMsg("é necessario informar a cidade para gravar!");
            if (!nome) return alertMsg("é necessario informar o nome para gravar!");
            if (!cnpj) return alertMsg("é necessario informar o cnpj para gravar!");
            if (!celular) return alertMsg("é necessario informar o celular para gravar!");
            if (!endereco) return alertMsg("é necessario informar o endereco para gravar!");
            if (!bairro) return alertMsg("é necessario informar o bairro para gravar!");
            if (!estado) return alertMsg("é necessario informar o estado para gravar!");
            if (!numero) return alertMsg("é necessario informar o numero para gravar!");
        }

        setIsSaving(true);

        const dados = isEdit
            ? {
                  ...(dadosIniciais as ICliente),
                  id: Number(id) || 0,
                  nome,
                  cnpj,
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
              }
            : {
                  id: Number(id) || 0,
                  cep,
                  cidade,
                  estado,
                  bairro,
                  endereco,
                  celular,
                  cnpj,
                  nome,
                  ativo,
                  numero,
                  data_cadastro: dateService.obterDataAtual(),
                  data_recadastro: dateService.obterDataHoraAtual(),
              };

        try {
            const result = await api.post("/cliente", dados, { headers: { token: user.token } });

            if (result.status === 200 && !result.data.erro) {
                setVisible(true);
                setMsgAlert("Cliente cadastrado com sucesso!");
                setRota("/clientes");
            } else if (result.status === 200 && result.data.erro) {
                setVisible(true);
                setMsgAlert(result.data.msg);
            } else if (result.status !== 200) {
                setVisible(true);
                setMsgAlert("Ocorreu um erro ao tentar gravar o cliente. Status: " + result.status);
            }
        } catch (e: any) {
            console.error(e);
            const errorMsg = e.response?.data?.msg || e.message || "Ocorreu um erro desconhecido ao tentar gravar o cliente!";
            setVisible(true);
            setMsgAlert(errorMsg);
        } finally {
            setIsSaving(false);
        }
    }

    const labelClass = "block text-sm md:text-base text-gray-700 font-semibold mb-1";
    const inputClass =
        "p-2 w-full text-sm md:text-base text-gray-700 font-medium shadow-md rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 read-only:bg-gray-100 read-only:cursor-not-allowed";

    return (
        <div className="min-h-screen flex flex-col sm:ml-56 p-4 bg-slate-100 pb-20 md:pb-16">
            <AlertDemo content={msgAlert} title="Atenção" visible={visible} setVisible={setVisible} to={rota || undefined} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                {isEdit ? (
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Editar Cliente</h1>
                ) : (
                    <div className="bg-white p-2 rounded-md shadow-md">
                        <span className="text-xs md:text-lg text-gray-600 font-bold font-sans">
                            Data de cadastro: {dateService.obterDataAtual()}
                        </span>
                    </div>
                )}
                <Button variant="outline" onClick={() => router.push("/cadastros/clientes")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
            </div>

            {isEdit && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-3 rounded-md shadow">
                        <span className={labelClass}>Código:</span>
                        <p className="text-gray-900 font-medium">{dadosIniciais?.codigo || "N/A"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow">
                        <span className={labelClass}>Data Cadastro:</span>
                        <p className="text-gray-900 font-medium">{dadosIniciais?.data_cadastro || "N/A"}</p>
                    </div>
                </div>
            )}

            <div className="mb-6 items-end">
                <div className="flex flex-col">
                    <label htmlFor="id" className={labelClass}>ID:</label>
                    <input
                        id="id"
                        className={inputClass}
                        placeholder="Preenchido com o último código + 1"
                        value={id || ""}
                        onChange={(e) => setId(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6 items-end">
                <div className="lg:col-span-5 flex flex-col">
                    <label htmlFor="nome" className={labelClass}>
                        {isEdit ? "Nome / Razão Social:" : "Nome:"}
                    </label>
                    <input
                        id="nome"
                        className={inputClass}
                        placeholder="Nome completo ou Razão Social"
                        value={nome || ""}
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>

                <div className="lg:col-span-3 flex flex-col">
                    <label htmlFor="tipoPessoa" className={labelClass}>Pessoa:</label>
                    <SelectPessoa id="tipoPessoa" defaultTipoPessoa={pessoa} onchange={handlePessoaChange} className={inputClass} />
                </div>

                <div className="lg:col-span-4 flex flex-col">
                    <label htmlFor="cnpjCpf" className={labelClass}>{pessoa === "j" ? "CNPJ:" : "CPF:"}</label>
                    <InputMask
                        id="cnpjCpf"
                        mask={maskCnpj}
                        placeholder={placeholderPessoa}
                        value={cnpj || ""}
                        onChange={(v: any) => setCnpj(v.target.value)}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-end">
                <div className="flex flex-col">
                    <label htmlFor="ieRg" className={labelClass}>{pessoa === "j" ? "IE:" : "RG:"}</label>
                    <input
                        id="ieRg"
                        className={inputClass}
                        placeholder={pessoa === "j" ? "Inscrição Estadual" : "Registro Geral"}
                        value={ie || ""}
                        onChange={(e) => setIe(e.target.value)}
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="celular" className={labelClass}>Celular:</label>
                    <InputMask
                        id="celular"
                        mask={maskCelular}
                        placeholder="(00) 00000-0000"
                        value={celular || ""}
                        onChange={(e: any) => setCelular(e.target.value)}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="vendedor" className={labelClass}>
                    Vendedor: {codigoVendedor ? `(Cód: ${codigoVendedor})` : ""}
                </label>
                <SelectVendedor id="vendedor" defaultVendedor={codigoVendedor} onChangeVendedor={handleVendedorChange} className={inputClass} />
            </div>

            <div className="mb-6">
                <h2 className="text-lg md:text-xl text-gray-700 font-bold font-sans mb-2">Endereço</h2>
                <hr className="border-gray-300 mb-4" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
                    <div className="flex flex-col">
                        <label htmlFor="cep" className={labelClass}>CEP:</label>
                        <InputMask
                            id="cep"
                            className={inputClass}
                            placeholder="00000-000"
                            mask="99999-999"
                            value={cep || ""}
                            onChange={(v: any) => setCep(v.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="estado" className={labelClass}>Estado:</label>
                        <input
                            id="estado"
                            className={inputClass}
                            placeholder="Ex.: PR"
                            value={estado || ""}
                            maxLength={2}
                            onChange={(e) => setEstado(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="cidade" className={labelClass}>Cidade:</label>
                        <input
                            id="cidade"
                            className={inputClass}
                            placeholder="Ex.: Maringá"
                            value={cidade || ""}
                            onChange={(e) => setCidade(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-end">
                    <div className="flex flex-col lg:col-span-6">
                        <label htmlFor="endereco" className={labelClass}>Endereço:</label>
                        <input
                            id="endereco"
                            className={inputClass}
                            placeholder="Rua, Avenida, etc."
                            value={endereco || ""}
                            onChange={(e) => setEndereco(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-3">
                        <label htmlFor="bairro" className={labelClass}>Bairro:</label>
                        <input
                            id="bairro"
                            className={inputClass}
                            placeholder="Nome do bairro"
                            value={bairro || ""}
                            onChange={(e) => setBairro(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-3">
                        <label htmlFor="numero" className={labelClass}>Número:</label>
                        <input
                            id="numero"
                            type="text"
                            className={inputClass}
                            placeholder="Ex: 123 ou S/N"
                            value={numero || ""}
                            onChange={(e) => setNumero(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <hr className="border-gray-300 mt-5 mb-4" />

            <div className="flex flex-col mb-6">
                <label htmlFor="observacoes" className={labelClass}>Observações:</label>
                <textarea
                    id="observacoes"
                    className={`${inputClass} min-h-[100px]`}
                    value={observacoes || ""}
                    onChange={(e) => setObservacoes(e.target.value)}
                />
            </div>

            {isEdit && (
                <div className="mb-6">
                    <label className={labelClass}>Status do Cliente:</label>
                    <div className="mt-1"><Active active={ativo} handleActive={handleActiveChange} /></div>
                </div>
            )}

            <div className="bg-white p-3 fixed bottom-0 left-0 right-0 shadow-md-top sm:ml-56 border-t border-gray-200">
                <div className="max-w-7xl mx-auto flex justify-end">
                    <Button
                        className="bg-black hover:bg-gray-800 flex items-center gap-2 px-4 py-2 disabled:opacity-50"
                        onClick={gravar}
                        disabled={isSaving}
                    >
                        <Save size={20} color="#FFF" />
                        <span className="text-white font-bold">{isSaving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Gravar"}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}