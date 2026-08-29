'use client';

import { Active } from "@/app/pedidos/components/active";
import { configApi } from "@/app/services/api";
import { AlertDemo } from "@/components/alert/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SelectCliente } from "../_components/selectCliente";

interface veiculo {
    codigo?: number;
    modelo: string;
    placa: string;
    marca: string;
    ano: string;
    combustivel: string;
    cor?: string;
    cliente: number;
    ativo?: string;
    id?: string;
}

export function VeiculosFormClient({
    dadosIniciais,
    idInicial,
}: {
    dadosIniciais: veiculo | null;
    idInicial?: string;
}) {
    const api = configApi();
    const { user }: any = useAuth();
    const router = useRouter();

    const isEdit = Boolean(dadosIniciais?.codigo);
    const [id, setId] = useState<string>(dadosIniciais?.id ?? idInicial ?? "");

    const [data, setData] = useState<veiculo>(() =>
        dadosIniciais
            ? { ...dadosIniciais }
            : {
                  modelo: "",
                  placa: "",
                  marca: "",
                  ano: "",
                  combustivel: "",
                  cor: "",
                  cliente: 0,
              }
    );

    const [msgAlert, setMsgAlert] = useState<string>("");
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (field: keyof veiculo, value: string | number) => {
        setData((prev) => {
            if (!prev) return prev;
            return { ...prev, [field]: value };
        });
    };

    const handleClientChange = (cliente: any) => {
        setData((prev) => {
            if (!prev) return prev;
            return { ...prev, cliente: cliente?.codigo };
        });
    };

    const handleActive = useCallback((param: "S" | "N") => {
        setData((prev) => {
            if (!prev) return prev;
            return { ...prev, ativo: param };
        });
    }, []);

    async function gravar() {
        if (!user) return;

        setIsSaving(true);
        try {
            let result;
            if (isEdit) {
                result = await api.put("/veiculos", { ...data, id: String(id) }, { headers: { token: user.token } });
                if (result.status === 200) {
                    setVisibleAlert(true);
                    setMsgAlert(`Veículo ${data?.modelo} atualizado com Sucesso!`);
                }
            } else {
                const aux: any = {
                    id: String(id),
                    ano: String(data.ano),
                    cliente: Number(data.cliente),
                    combustivel: data.combustivel,
                    marca: String(data.marca),
                    modelo: String(data.modelo),
                    placa: String(data.placa),
                    cor: String(data.cor),
                };
                result = await api.post("/veiculos", aux, { headers: { token: user.token } });
                if (result.status === 200) {
                    setVisibleAlert(true);
                    setMsgAlert(`Veículo ${aux.modelo} cadastrado com Sucesso!`);
                }
            }
        } catch (e: any) {
            console.error("Erro ao gravar Veículo:", e);
            setMsgAlert(e?.response?.data?.message || `Erro ao gravar Veículo.`);
            setVisibleAlert(true);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col sm:ml-56 p-4 w-full h-full justify-center items-center bg-slate-100">
            <AlertDemo
                content={msgAlert}
                title="Aviso"
                visible={visibleAlert}
                setVisible={setVisibleAlert}
                to={"/cadastros/veiculos"}
            />

            <div className="w-full md:w-5/6 p-2 mt-22 min-h-screen rounded-lg bg-white shadow-md">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-md md:text-3xl font-bold text-gray-800">{isEdit ? "Detalhes do Veículo" : "Detalhes do Veículo"}</h1>
                    <Button variant="outline" onClick={() => router.push("/cadastros/veiculos")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                </div>

                <div className="m-2">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Detalhes Principais</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-600">ID:</Label>
                                <Input
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    className="mt-1"
                                    placeholder="Preenchido com o último código + 1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Modelo:</Label>
                                <Input
                                    value={data?.modelo ?? ""}
                                    className="mt-1"
                                    onChange={(e) => handleInputChange("modelo", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Placa:</Label>
                                <Input
                                    value={data?.placa ?? ""}
                                    onChange={(e) => handleInputChange("placa", e.target.value)}
                                    className="mt-1"
                                    placeholder="ABC1D34"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Marca:</Label>
                                <Input
                                    type="text"
                                    value={data?.marca ?? ""}
                                    onChange={(e) => handleInputChange("marca", e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Ano:</Label>
                                <Input
                                    placeholder="2000"
                                    value={data?.ano ?? ""}
                                    onChange={(e) => handleInputChange("ano", e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            {!isEdit && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Cor:</Label>
                                    <Input
                                        placeholder="Verde"
                                        value={data?.cor ?? ""}
                                        onChange={(e) => handleInputChange("cor", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            )}
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Combustível:</Label>
                                <Input
                                    placeholder="Gasolina"
                                    value={data?.combustivel ?? ""}
                                    onChange={(e) => handleInputChange("combustivel", e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <SelectCliente codigoCliente={data?.cliente || 0} selectCliente={handleClientChange} />
                            </div>

                            {isEdit && (
                                <div className="md:col-span-2 pt-4">
                                    <Label className="text-sm font-medium text-gray-600 mb-2 block">
                                        Status: {data?.ativo}
                                    </Label>
                                    <Active active={data?.ativo} handleActive={handleActive} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md p-3 z-10 sm:ml-56">
                <div className="w-full max-w-7xl mx-auto flex justify-end">
                    <Button onClick={gravar} disabled={isSaving} size="lg">
                        <Save className="mr-2 h-5 w-5" />
                        {isSaving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Salvar"}
                    </Button>
                </div>
            </div>
        </div>
    );
}