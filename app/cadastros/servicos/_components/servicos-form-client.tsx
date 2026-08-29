'use client';

import { UseDateFunction } from "@/app/hooks/useDateFunction";
import { Active } from "@/app/pedidos/components/active";
import { configApi } from "@/app/services/api";
import { AlertDemo } from "@/components/alert/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { basicServico } from "@/types/servico";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function ServicosFormClient({
    dadosIniciais,
    idInicial,
}: {
    dadosIniciais: basicServico | null;
    idInicial?: string;
}) {
    const api = configApi();
    const useDateService = UseDateFunction();
    const { user }: any = useAuth();
    const router = useRouter();

    const isEdit = Boolean(dadosIniciais?.codigo);
    const [id, setId] = useState<string>(dadosIniciais?.id ?? idInicial ?? "");

    const [aplicacao, setAplicacao] = useState<string>(dadosIniciais?.aplicacao || "");
    const [valor, setValor] = useState<number | undefined>(dadosIniciais?.valor);
    const [ativo, setAtivo] = useState<"S" | "N">(dadosIniciais?.ativo || "S");

    const [visibleAlert, setVisibleAlert] = useState(false);
    const [msgAlert, setMsgAlert] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    const handleActive = useCallback((param: "S" | "N") => {
        setAtivo(param);
    }, []);

    async function gravar() {
        if (isEdit && !dadosIniciais) return;
        if (!user) return;

        setIsSaving(true);

        const dadosParaGravar: Partial<basicServico> = isEdit
            ? {
                  codigo: dadosIniciais?.codigo,
                  id,
                  aplicacao,
                  valor,
                  data_recadastro: useDateService.obterDataHoraAtual(),
                  tipo_serv: dadosIniciais?.tipo_serv,
                  ativo,
              }
            : {
                  id,
                  aplicacao,
                  valor,
                  data_recadastro: useDateService.obterDataHoraAtual(),
                  tipo_serv: 0,
              };

        try {
            const result = isEdit
                ? await api.put("/servicos", dadosParaGravar, { headers: { token: user.token } })
                : await api.post("/servicos", dadosParaGravar, { headers: { token: user.token } });

            if (isEdit && result.status === 200 && result.data?.codigo > 0) {
                setVisibleAlert(true);
                setMsgAlert(`Serviço ${result.data.codigo} Alterado com Sucesso!`);
            } else if (!isEdit && result.status === 201 && result.data?.codigo > 0) {
                setVisibleAlert(true);
                setMsgAlert(`Serviço ${result.data.codigo} Registrado com Sucesso!`);
            } else {
                throw new Error(result.data?.message || `Erro ao salvar Serviço. Status: ${result.status}`);
            }
        } catch (error: any) {
            console.error("Erro ao gravar serviço:", error);
            setMsgAlert(error.message || `Erro ao salvar Serviço.`);
            setVisibleAlert(true);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="h-screen flex flex-col sm:ml-56 bg-slate-100 overflow-hidden">
            <div className="w-full max-w-screen-2xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 flex flex-col flex-1">
                <AlertDemo
                    content={msgAlert}
                    title="Aviso"
                    visible={visibleAlert}
                    setVisible={setVisibleAlert}
                    to={"/cadastros/servicos"}
                />

                <ScrollArea className="flex-1 p-4 md:p-6">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-24">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-bold text-gray-800">
                                {isEdit ? "Editar Serviço" : "Novo Serviço"}
                            </h1>
                            <Button variant="outline" onClick={() => router.push("/cadastros/servicos")}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                            </Button>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Detalhes do Serviço</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {isEdit && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Código:</Label>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">{dadosIniciais?.codigo}</p>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="id" className="text-sm font-medium text-gray-600">
                                        ID:
                                    </Label>
                                    <Input
                                        id="id"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        className="mt-1 text-base"
                                        placeholder={isEdit ? "ID do serviço" : "Preenchido com o último código + 1"}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="aplicacao" className="text-sm font-medium text-gray-600">
                                        Aplicação:
                                    </Label>
                                    <Input
                                        id="aplicacao"
                                        value={aplicacao}
                                        onChange={(e) => setAplicacao(e.target.value)}
                                        className="mt-1 text-base"
                                        placeholder="Descrição do serviço"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="valor" className="text-sm font-medium text-gray-600">
                                        Valor (R$):
                                    </Label>
                                    <Input
                                        id="valor"
                                        type="number"
                                        step="0.01"
                                        value={valor ?? ""}
                                        onChange={(e) => setValor(e.target.value === "" ? undefined : Number(e.target.value))}
                                        className="mt-1 text-base"
                                        placeholder="0.00"
                                    />
                                </div>

                                {isEdit && (
                                    <Active active={ativo} handleActive={handleActive} />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>

                <div className="fixed bottom-0 left-0 right-0 border-t bg-background shadow-md p-3 z-10 sm:ml-56 bg-white">
                    <div className="max-w-3xl mx-auto flex justify-end">
                        <Button onClick={gravar} disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}