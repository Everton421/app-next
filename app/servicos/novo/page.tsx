



'use client';

import { UseDateFunction } from "@/app/hooks/useDateFunction";
// Assuming Active component exists and is styled appropriately
import { Active } from "@/app/pedidos/components/active";
import { configApi } from "@/app/services/api";
import { AlertDemo } from "@/components/alert/alert";
// Import Shadcn UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Optional but good for structure
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { useAuth } from "@/contexts/AuthContext";
import { Save, ArrowLeft } from "lucide-react"; // Add ArrowLeft if you want a back button
import { useRouter } from "next/navigation"; // Use router for navigation
import { useCallback, useEffect, useState } from "react";
import { basicServico } from "../types/servico";  


export default function NovoServico() {  

    const [data, setData] = useState<basicServico | null>(null);  
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [msgAlert, setMsgAlert] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);  
    const [isSaving, setIsSaving] = useState(false);  

    const [aplicacao, setAplicacao] = useState<string>('');
    const [valor, setValor] = useState<number | undefined>(undefined);  

    const api = configApi();
    const useDateService = UseDateFunction();
    const { user }: any = useAuth();  
    const router = useRouter();  
    
 
    async function gravar() {
     //   if (!data || isSaving) return;  

        setIsSaving(true);
        const dadosParaGravar: Partial<basicServico> = {  
            aplicacao: aplicacao,
            valor: valor,
            data_recadastro: useDateService.obterDataHoraAtual(),
             tipo_serv: 0,  
        };


        console.log("Enviando para API:", dadosParaGravar);  

        try {
            const result = await api.post('/servico', dadosParaGravar, {
                headers: { token:  user.token  },
            });
            console.log(result);
            if (result.status === 200 && result.data?.codigo > 0) {  
                console.log(result);
                setVisibleAlert(true);
                setMsgAlert(`Serviço ${result.data.codigo} Registrado com Sucesso!`);
            } else {
                 throw new Error(result.data?.message || `Erro ao salvar Serviço. Status: ${result.status}`);
            }
        } catch (error: any) {
            console.error("Erro ao gravar serviço:", error);
            setMsgAlert(error.message || `Erro ao Registrar serviço.`);
            setVisibleAlert(true);
        } finally {
            setIsSaving(false);
        }
    }



    const handleActive = useCallback((newStatus: 'S' | 'N') => {
         console.log("Status change requested (implement if needed):", newStatus);
    }, []);

 


    return (
        <div className="h-screen flex flex-col sm:ml-14 bg-slate-100 overflow-hidden">
     <div className="w-full max-w-screen-2xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 flex flex-col flex-1">

            <AlertDemo content={msgAlert} title="Aviso" visible={visibleAlert} setVisible={setVisibleAlert} to={'/servicos'} />

            <ScrollArea className="flex-1 p-4 md:p-6">

                <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-24"> {/* Added pb-24 for footer space */}

                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Editar Serviço
                        </h1>
                        <Button variant="outline" onClick={() => router.push('/servicos')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes do Serviço</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Código:</Label>
                                <p className="text-lg font-semibold text-gray-900 mt-1">{data?.codigo}</p>
                            </div>

                            <div>
                                <Label htmlFor="aplicacao" className="text-sm font-medium text-gray-600">Aplicação:</Label>
                                <Input
                                    id="aplicacao"
                                    value={aplicacao}
                                    onChange={(e) => setAplicacao(e.target.value)}
                                    className="mt-1 text-base"
                                    placeholder="Descrição do serviço"
                                />
                            </div>

                            {/* Valor Input */}
                            <div>
                                <Label htmlFor="valor" className="text-sm font-medium text-gray-600">Valor (R$):</Label>
                                <Input
                                    id="valor"
                                    type="number"
                                    step="0.01"
                                    value={valor ?? ''} // Use empty string for input value if undefined
                                    onChange={(e) => setValor(e.target.value === '' ? undefined : Number(e.target.value))} // Handle empty input for undefined state
                                    className="mt-1 text-base"
                                    placeholder="0.00"
                                />
                            </div>

                        </CardContent>
                    </Card>

                </div>
            </ScrollArea>

            {/* Fixed Bottom Bar - Aligned with sm:ml-14 */}
            <div className="fixed bottom-0 left-0 right-0 border-t bg-background shadow-md p-3 z-10 sm:ml-14 bg-white">
                {/* Inner container matching content max-width */}
                <div className="max-w-3xl mx-auto flex justify-end">
                    <Button onClick={gravar} 
                    //disabled={isSaving || isLoading}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </div>
            </div>

        </div>
    );
}



  