'use client';

import { UseDateFunction } from "@/app/hooks/useDateFunction";
import { configApi } from "@/app/services/api";
import { AlertDemo } from "@/components/alert/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SelectTipoIpi } from "../components/select-tipo-ipi";

export function ProdutosTributacaoClient({ dadosIniciais }: { dadosIniciais: any }) {
    const api = configApi();
    const useDateService = UseDateFunction();
    const { user }: any = useAuth();
    const router = useRouter();

    const [data, setData] = useState<any>({ ...dadosIniciais });
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [msgAlert, setMsgAlert] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    async function gravar() {
        if (!data) return;
        if (!user) return;

        setIsSaving(true);
        const dataParaGravar = { ...data, data_recadastro: useDateService.obterDataHoraAtual() };

        try {
            const result = await api.put("/produto", dataParaGravar, { headers: { token: user.token } });
            if (result.status === 200 && result.data?.codigo > 0) {
                setVisibleAlert(true);
                setMsgAlert(`Produto ${data.codigo} Alterado com Sucesso!`);
            }
        } catch (e: any) {
            console.error("Erro ao gravar produto:", e);
            setMsgAlert(`Erro ao salvar alterações do produto ${data.codigo}. ${e?.response?.data?.msg ?? ""}`);
            setVisibleAlert(true);
        } finally {
            setIsSaving(false);
        }
    }

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
                        <h1 className="text-xl md:text-4xl font-bold font-sans text-gray-800">Tributação</h1>
                        <Button variant="outline" onClick={() => router.push(`/cadastros/produtos/${data.codigo}`)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-4 md:p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-2 justify-between">
                                <div>
                                    <Label htmlFor="codigo" className="text-xs md:text-lg font-semibold text-gray-700">
                                        Código:
                                    </Label>
                                    <span id="codigo" className="text-xs md:text-lg font-bold text-gray-900">
                                        {data.codigo}
                                    </span>
                                </div>
                                {data?.data_cadastro && (
                                    <div>
                                        <Label htmlFor="dataCadastro" className="text-xs md:text-lg font-semibold text-gray-700">
                                            Cadastrado:
                                        </Label>
                                        <span id="dataCadastro" className="text-xs md:text-lg font-bold text-gray-900">
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
                                <Label htmlFor="descricao" className="text-base font-medium text-gray-600">
                                    {data.descricao || ""}
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader />
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                                <div>
                                    <SelectTipoIpi />
                                    <Input
                                        id="preco"
                                        type="number"
                                        step="0.01"
                                        value={data.preco ?? ""}
                                        onChange={(e) =>
                                            setData((prev: any) =>
                                                prev ? { ...prev, preco: Number(e.target.value) } : prev
                                            )
                                        }
                                        className="mt-1"
                                        placeholder="0.00"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ScrollArea>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md p-3 z-10 sm:ml-56">
                <div className="w-full max-w-7xl mx-auto flex justify-end">
                    <Button onClick={gravar} disabled={isSaving} size="lg">
                        <Save className="mr-2 h-5 w-5" />
                        {isSaving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </div>
        </div>
    );
}