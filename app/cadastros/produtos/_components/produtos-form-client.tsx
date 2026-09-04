'use client';

import { UseDateFunction } from "@/app/hooks/useDateFunction";
import { Active } from "@/app/pedidos/components/active";
import { configApi } from "@/app/services/api";
import { AlertDemo } from "@/components/alert/alert";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ChartCandlestick, Flag, Save, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ModalAnuncio } from "@/app/marketplaces/_components/modal-anuncio";
import SelectCategorias from "../components/selectCategorias";
import SelectMarca from "../components/selectMarcas";

interface Produto {
    id?: string;
    codigo?: number;
    descricao: string;
    preco: number;
    estoque: number;
    sku?: string | null;
    num_fabricante?: string | null;
    class_fiscal?: string | null;
    ncm?: string | null;
    observacoes1?: string | null;
    observacoes2?: string | null;
    observacoes3?: string | null;
    ativo: "S" | "N";
    data_recadastro?: string;
    data_cadastro?: string;
    cst?: string;
    grupo?: any;
    marca?: any;
    num_original?: string;
    origem?: string | number;
    tipo?: number;
}

interface FotoProduto {
    sequencia: number;
    link: string;
}

export function ProdutosFormClient({
    dadosIniciais,
    fotosIniciais,
    idInicial,
}: {
    dadosIniciais: Produto | null;
    fotosIniciais: FotoProduto[];
    idInicial?: string;
}) {
    const api = configApi();
    const useDateService = UseDateFunction();
    const { user }: any = useAuth();
    const router = useRouter();

    const isEdit = Boolean(dadosIniciais?.codigo);
    const [id, setId] = useState<string>(dadosIniciais?.id ?? (idInicial || uuidv4()));

    const [data, setData] = useState<any>(() =>
        dadosIniciais
            ? { ...dadosIniciais }
            : {
                  id,
                  ativo: "S",
                  class_fiscal: "0000.00.00",
                  cst: "00",
                  data_cadastro: useDateService.obterDataAtual(),
                  data_recadastro: useDateService.obterDataHoraAtual(),
                  descricao: "",
                  estoque: 0,
                  grupo: 0,
                  marca: 0,
                  num_fabricante: "",
                  num_original: "",
                  observacoes1: "",
                  observacoes2: "",
                  observacoes3: "",
                  origem: 0,
                  preco: 0,
                  sku: "",
                  tipo: 0,
              }
    );
    const [fotos, setFotos] = useState<FotoProduto[]>(fotosIniciais || []);
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [msgAlert, setMsgAlert] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [showMlModal, setShowMlModal] = useState(false);

    const handleInputChange = (field: keyof Produto, value: string | number) => {
        setData((prevData: any) => {
            if (!prevData) return null;
            return { ...prevData, [field]: value };
        });
    };

    const handleCategory = (categoria: any) => {
        setData((prevData: any) => {
            if (!prevData) return null;
            return { ...prevData, grupo: categoria };
        });
    };

    const handleMarca = (marca: any) => {
        setData((prevData: any) => {
            if (!prevData) return null;
            return { ...prevData, marca };
        });
    };

    const handleActive = useCallback((param: "S" | "N") => {
        setData((prevData: any) => {
            if (!prevData) return prevData;
            return { ...prevData, ativo: param };
        });
    }, []);

    async function gravar() {
        if (!data) return;
        if (!user) return;

        setIsSaving(true);

        const dataParaGravar = isEdit
            ? { ...data, id, data_recadastro: useDateService.obterDataHoraAtual() }
            : { ...data, id };

        try {
            const result = isEdit
                ? await api.put("/produtos", dataParaGravar, { headers: { token: user.token } })
                : await api.post("/produtos", dataParaGravar, { headers: { token: user.token } });

            if (result.status === 200 && result.data?.codigo > 0) {
                setVisibleAlert(true);
                setMsgAlert(
                    isEdit
                        ? `Produto ${result.data.codigo} Alterado com Sucesso!`
                        : `Produto ${data?.descricao} cadastrado com Sucesso!`
                );
            }
        } catch (e: any) {
            console.error("Erro ao gravar produto:", e);
            setMsgAlert(
                isEdit
                    ? `Erro ao salvar alterações do produto ${data?.codigo}. ${e?.response?.data?.msg ?? ""}`
                    : `Erro ao salvar alterações do produto ${data?.codigo}.`
            );
            setVisibleAlert(true);
        } finally {
            setIsSaving(false);
        }
    }

    const handleOpenMlModal = () => {
        if (!data) return;
        setShowMlModal(true);
    };

    return (
        <div className="h-screen flex flex-col sm:ml-56 p-4 w-full justify-center items-center bg-slate-100">
            <ScrollArea className="flex-1 w-full max-w-screen-2xl bg-white rounded-lg shadow-md mb-20">
                <AlertDemo
                    content={msgAlert}
                    title="Aviso"
                    visible={visibleAlert}
                    setVisible={setVisibleAlert}
                    to={"/cadastros/produtos"}
                />

                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 pb-24">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-xl md:text-4xl font-bold font-sans text-gray-800">
                            {isEdit ? "Detalhes do Produto" : "Novo Produto"}
                        </h1>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => router.push("/cadastros/produtos")}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                            </Button>
                            {isEdit && data?.codigo && (
                                <>
                                    <Button variant="outline" onClick={() => router.push(`/cadastros/produtos/${data.codigo}/tributacao`)}>
                                        <ChartCandlestick className="mr-2 h-4 w-4" />
                                        Tributação
                                    </Button>
                                    <Button variant="outline" onClick={() => router.push(`/cadastros/produtos/${data.codigo}/anuncios`)}>
                                        <Flag className="mr-2 h-4 w-4" />
                                        Anúncios
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-4 md:p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-2 justify-between">
                                <div className="flex items-center gap-2">
                                    {data?.codigo && (
                                        <>
                                            <Label htmlFor="codigo" className="text-xs md:text-lg font-semibold text-gray-700">
                                                Código:
                                            </Label>
                                            <span id="codigo" className="text-xs md:text-lg font-bold text-gray-900">
                                                {data.codigo}
                                            </span>
                                        </>
                                    )}
                                    <Label htmlFor="id" className="text-xs md:text-lg font-semibold text-gray-700">
                                        ID:
                                    </Label>
                                    <Input
                                        id="id"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        className="h-8 w-32 text-xs md:text-sm font-bold text-gray-700"
                                        placeholder="Último código + 1"
                                    />
                                </div>

                                {isEdit && data?.data_cadastro && (
                                    <div>
                                        <Label htmlFor="codigo" className="text-xs md:text-lg font-semibold text-gray-700">
                                            Data cadastro:
                                        </Label>
                                        <span id="codigo" className="text-xs md:text-lg font-bold text-gray-900">
                                            {new Date(data.data_cadastro).toLocaleDateString("pt-br", {
                                                year: "numeric",
                                                month: "numeric",
                                                day: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="descricao" className="text-base font-medium text-gray-600 mb-1 block">
                                    Descrição:
                                </Label>
                                <Input
                                    id="descricao"
                                    value={data?.descricao || ""}
                                    className="text-base"
                                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg">Imagens</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center p-4 min-h-[200px]">
                                {fotos.length > 0 ? (
                                    <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-xs">
                                        <CarouselContent>
                                            {fotos.map((foto) => (
                                                <CarouselItem key={foto.sequencia}>
                                                    <img
                                                        className="object-contain aspect-square w-full h-auto rounded-md"
                                                        src={String(foto.link)}
                                                        alt={`Produto ${data?.codigo} - Imagem ${foto?.sequencia}`}
                                                        onError={(e) => {
                                                            e.currentTarget.src = "/placeholder-image.png";
                                                        }}
                                                    />
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                                    </Carousel>
                                ) : (
                                    <div className="text-center text-gray-500">Nenhuma foto encontrada.</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Detalhes Principais</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                                <div>
                                    <Label htmlFor="preco" className="text-sm font-medium text-gray-600">
                                        Preço (R$):
                                    </Label>
                                    <Input
                                        id="preco"
                                        type="number"
                                        step="0.01"
                                        value={data?.preco ?? ""}
                                        onChange={(e) => handleInputChange("preco", Number(e.target.value))}
                                        className="mt-1"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="estoque" className="text-sm font-medium text-gray-600">
                                        Estoque:
                                    </Label>
                                    <Input
                                        id="estoque"
                                        type="number"
                                        step="1"
                                        value={data?.estoque ?? ""}
                                        onChange={(e) => handleInputChange("estoque", Number(e.target.value))}
                                        className="mt-1"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sku" className="text-sm font-medium text-gray-600">
                                        SKU:
                                    </Label>
                                    <Input
                                        id="sku"
                                        value={data?.sku || ""}
                                        onChange={(e) => handleInputChange("sku", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="gtin" className="text-sm font-medium text-gray-600">
                                        GTIN / Nº Fabricante:
                                    </Label>
                                    <Input
                                        id="gtin"
                                        value={data?.num_fabricante || ""}
                                        onChange={(e) => handleInputChange("num_fabricante", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ncm" className="text-sm font-medium text-gray-600">
                                        NCM / Class. Fiscal:
                                    </Label>
                                    <Input
                                        id="ncm"
                                        value={data?.class_fiscal || ""}
                                        onChange={(e) => handleInputChange("class_fiscal", e.target.value)}
                                        className="mt-1"
                                        maxLength={10}
                                        placeholder="00000000"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="categoria" className="text-sm font-medium text-gray-600">
                                        Categoria: {data?.grupo && data?.grupo.descricao}
                                    </Label>
                                    <SelectCategorias
                                        setCodigoCategoria={handleCategory}
                                        codigoCategoria={data?.grupo ? data?.grupo.codigo : null}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="marca" className="text-sm font-medium text-gray-600">
                                        Marca: {data?.marca && data?.marca.descricao}
                                    </Label>
                                    <SelectMarca setMarca={handleMarca} codigoMarca={data?.marca ? data?.marca.codigo : null} />
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <Label className="text-sm font-medium text-gray-600 mb-2 block">Status:</Label>
                                    <Active active={data?.ativo} handleActive={handleActive} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Observações</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 p-4">
                            <div>
                                <Label htmlFor="obs1" className="text-sm font-medium text-gray-600">
                                    Observação 1:
                                </Label>
                                <Textarea
                                    id="obs1"
                                    value={data?.observacoes1 || ""}
                                    onChange={(e) => handleInputChange("observacoes1", e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="obs2" className="text-sm font-medium text-gray-600">
                                    Observação 2:
                                </Label>
                                <Textarea
                                    id="obs2"
                                    value={data?.observacoes2 || ""}
                                    onChange={(e) => handleInputChange("observacoes2", e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="obs3" className="text-sm font-medium text-gray-600">
                                    Observação 3:
                                </Label>
                                <Textarea
                                    id="obs3"
                                    value={data?.observacoes3 || ""}
                                    onChange={(e) => handleInputChange("observacoes3", e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md p-3 z-10 sm:ml-56">
                <div className="w-full max-w-7xl mx-auto flex justify-between">
                    {isEdit && data?.codigo && (
                        <Button
                            className="bg-[#185FED] gap-2"
                            onClick={handleOpenMlModal}
                            disabled={isSaving}
                        >
                            <Store className="h-4 w-4" />
                            Anunciar Produto
                        </Button>
                    )}
                    <div className="flex justify-end w-full">
                        <Button onClick={gravar} disabled={isSaving} size="lg">
                            <Save className="mr-2 h-5 w-5" />
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </div>
            </div>

            {isEdit && (
                <ModalAnuncio
                    open={showMlModal}
                    onOpenChange={setShowMlModal}
                    data={data}
                    fotos={fotos}
                    onSuccess={() => {
                        setMsgAlert("Integração concluída!");
                        setVisibleAlert(true);
                    }}
                />
            )}
        </div>
    );
}