'use client';

import { configApi } from "@/app/services/api";
import { DateService } from "@/app/services/dateService";
import { AlertDemo } from "@/components/alert/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type categoria = {
    codigo?: number;
    id?: string;
    descricao?: string;
    data_cadastro?: string;
    data_recadastro?: string;
};

export function CategoriasFormClient({
    dadosIniciais,
    idInicial,
}: {
    dadosIniciais: categoria | null;
    idInicial?: string;
}) {
    const api = configApi();
    const dateService = DateService();
    const { user }: any = useAuth();
    const router = useRouter();

    const isEdit = Boolean(dadosIniciais?.codigo);

    const [data, setData] = useState<categoria>(() =>
        dadosIniciais
            ? { ...dadosIniciais }
            : {
                  id: idInicial ?? "",
                  descricao: "",
                  data_cadastro: dateService.obterDataAtual(),
                  data_recadastro: dateService.obterDataHoraAtual(),
              }
    );

    const [visibleAlert, setVisibleAlert] = useState(false);
    const [msgAlert, setMsgAlert] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    async function gravar() {
        if (!data) return;
        if (!user) return;

        setIsSaving(true);
        try {
            const result = isEdit
                ? await api.put("/next/categorias", data, { headers: { token: user.token } })
                : await api.post("/offline/categorias", data, { headers: { token: user.token } });

            if (result.status === 200 && result.data?.codigo > 0) {
                setVisibleAlert(true);
                setMsgAlert(`Categoria ${data?.descricao} ${isEdit ? "alterada" : "cadastrada"} com Sucesso!`);
            }
        } catch (e: any) {
            console.error("Erro ao gravar categoria:", e);
            setMsgAlert(`Erro ao ${isEdit ? "salvar alterações da" : "gravar"} Categoria ${data?.codigo ?? ""}.`);
            setVisibleAlert(true);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col sm:ml-56 p-4 bg-slate-100 space-y-6 pb-20">
            <AlertDemo
                content={msgAlert}
                title="Aviso"
                visible={visibleAlert}
                setVisible={setVisibleAlert}
                to={"/cadastros/categorias"}
            />

            <div className="w-full max-w-screen-2xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-sm md:text-2xl font-bold text-gray-800">
                        {isEdit ? "Editar Categoria" : "Nova Categoria"}
                    </h1>
                    <Button variant="outline" onClick={() => router.push("/cadastros/categorias")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes da Categoria</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {isEdit && (
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Código:</Label>
                                <p className="text-lg font-semibold text-gray-900 mt-1">{data.codigo}</p>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="id" className="text-sm font-medium text-gray-600">ID:</Label>
                            <Input
                                id="id"
                                value={data.id ?? ""}
                                onChange={(e) => setData((prev) => ({ ...prev, id: e.target.value }))}
                                className="mt-1 text-base"
                                placeholder="Preenchido com o último código + 1"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-gray-600">Descrição:</Label>
                            <Input
                                value={data.descricao ?? ""}
                                onChange={(e) => setData((prev) => ({ ...prev, descricao: e.target.value }))}
                                className="mt-1 text-base"
                                placeholder="Descrição da categoria"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="fixed bottom-0 left-0 right-0 border-t bg-background shadow-md p-3 z-10 sm:ml-56 bg-white">
                    <div className="max-w-3xl mx-auto flex justify-end">
                        <Button onClick={gravar} disabled={isSaving} size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}