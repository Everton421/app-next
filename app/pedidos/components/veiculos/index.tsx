import { configApi } from "@/app/services/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";  
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";  
import { useAuth } from "@/contexts/AuthContext";
import { Car } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface VeiculoData {
    codigo: number | string;
    placa: string;
    modelo: string;
    ano: number | string;
}

type props = {
    cliente: clientePedido | undefined,
    setVeiculo:  Dispatch<SetStateAction<VeiculoData | null>>
    codigoPedido: number,
    codigoVeiculo:number | undefined
}

export const Veiculos = ({ cliente, setVeiculo, codigoPedido, codigoVeiculo }:props ) => {

    const [dados, setDados] = useState<VeiculoData[] | null>(null);  
    const [veiculoSelecionado, setVeiculoSelecionado] = useState<VeiculoData | null>(null);  
    const [isLoading, setIsLoading] = useState(false);  
    const [error, setError] = useState<string | null>(null);  

    const api = configApi();
    const { user }: any = useAuth();  

    async function busca() {
        setIsLoading(true);
        setError(null);
        setDados(null);  
        setVeiculoSelecionado(null);  

        let veiculosCliente: VeiculoData[] = [];
        let veiculoPedido: VeiculoData | null = null;

        try {
            const resultCliente = await api.get<VeiculoData[]>(`/veiculos`, {
                headers: { cnpj:  user.cnpj  },
                params: { cliente:   cliente && cliente.codigo    }
            });
            veiculosCliente = resultCliente.data || [];
        } catch (e) {
            console.error('Erro ao tentar buscar veículos do cliente:', e);
            setError('Não foi possível carregar os veículos do cliente.');
        }

        if (codigoPedido && codigoVeiculo !== null && codigoVeiculo !== undefined) {
            try {
                const resultPedido = await api.get<VeiculoData[]>(`/veiculos`, {
                    headers: { cnpj:  user.cnpj },
                    params: { codigo: codigoVeiculo }
                });
                if (resultPedido.data && resultPedido.data.length > 0) {
                    veiculoPedido = resultPedido.data[0];
                    if (!veiculosCliente.some(v => v.codigo === veiculoPedido!.codigo)) {
                        veiculosCliente.unshift(veiculoPedido);  
                    }
                }
            } catch (e) {
                console.error('Erro ao tentar buscar veículo do pedido:', e);
            }
        }

        setDados(veiculosCliente);

        if (veiculoPedido) {
            setVeiculoSelecionado(veiculoPedido);
            setVeiculo(veiculoPedido); 
        } else if (veiculosCliente.length > 0 && !codigoPedido) {
        }


        setIsLoading(false);
    }

    function handleSelectChange(value: string) {
        try {
            const veiculoObj = JSON.parse(value) as VeiculoData;
            setVeiculoSelecionado(veiculoObj);
            setVeiculo(veiculoObj); // Atualiza no componente pai
        } catch (e) {
            console.error("Erro ao parsear valor do select:", e);
            setVeiculoSelecionado(null);
            setVeiculo(null);
        }
    }

    useEffect(() => {
        if (cliente?.codigo) {  
            busca();
        } else {
            setDados(null);
            setVeiculoSelecionado(null);
            setVeiculo(null);
            setError(null);
        }
    }, [cliente]);  


    return (
        <div className="space-y-6 p-4 border rounded-lg bg-gray-50/50 shadow-sm">  

            <div className="space-y-2">
                <label htmlFor="veiculo-select" className="text-base font-semibold text-gray-800">
                    Veículos Associados
                </label>
                <Select
                    value={veiculoSelecionado ? JSON.stringify(veiculoSelecionado) : ""}  
                    onValueChange={handleSelectChange}
                    disabled={isLoading || !dados}  
                >
                    <SelectTrigger id="veiculo-select" className="w-full max-w-sm bg-white data-[placeholder]:text-muted-foreground">  
                        <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um veículo"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">  
                        {isLoading ? (
                             <SelectItem value="loading" disabled className="text-muted-foreground italic">Carregando...</SelectItem>
                        ) : error ? (
                            <SelectItem value="error" disabled className="text-destructive italic">{error}</SelectItem>
                        ) : dados && dados.length > 0 ? (
                            dados.map((i: VeiculoData) => (
                                <SelectItem
                                    className="cursor-pointer hover:bg-gray-100"  
                                  
                                    value={JSON.stringify(i)}
                                    key={i.codigo}
                                >
                                    <span className="font-medium">{i.placa}</span> - <span className="text-sm text-gray-600">{i.modelo} ({i.ano})</span>
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="no-items" disabled className="text-muted-foreground italic">
                                Nenhum veículo encontrado para este cliente.
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {veiculoSelecionado && (
                <div className="w-full max-w-sm">  
                    <Card className="shadow-md">  
                        <CardHeader className="flex flex-row items-center space-x-3 pb-3 pt-4 bg-gray-50 rounded-t-lg">  
                             <Car size={28} className="text-blue-600" />  
                             <CardTitle className="text-lg font-semibold text-gray-800"> 
                                Detalhes do Veículo
                             </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 text-sm space-y-2">  
                            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 items-center">
                                <span className="font-medium text-gray-500 justify-self-end">Código:</span>
                                <span className="font-semibold text-gray-800">{veiculoSelecionado.codigo}</span>

                                <span className="font-medium text-gray-500 justify-self-end">Placa:</span>
                                <span className="font-semibold text-gray-800">{veiculoSelecionado.placa}</span>

                                <span className="font-medium text-gray-500 justify-self-end">Modelo:</span>
                                <span className="font-semibold text-gray-800">{veiculoSelecionado.modelo}</span>

                                <span className="font-medium text-gray-500 justify-self-end">Ano:</span>
                                <span className="font-semibold text-gray-800">{veiculoSelecionado.ano}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

             {!veiculoSelecionado && !isLoading && !error && dados && dados.length > 0 && (
                 <p className="text-sm text-muted-foreground italic px-2">
                     Selecione um veículo na lista acima para ver os detalhes.
                 </p>
             )}

        </div>
    )
}