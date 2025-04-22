'use client'

import { UseDateFunction } from "@/app/hooks/useDateFunction"
import { configApi } from "@/app/services/api"
import { useEffect, useState, useCallback } from "react" // Import useCallback
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"
import { Input } from "@/components/ui/input";
import {   Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { DateService } from "@/app/services/dateService";
import { AlertDemo } from "@/components/alert/alert";


type marca = {
    codigo?:number
    descricao:string
    data_cadastro:string
    data_recadastro:string
}

export default function NovaMarca() {

    const api = configApi()
    const [data, setData] = useState<marca | null >(null); // Inicializar como null
    const [dados, setDados] = useState<marca| null > (null); // Inicializar como null
    
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [msgAlert, setMsgAlert] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false); // Add saving state
    const [isLoading, setIsLoading] = useState(true); // Add loading state for initial fetch

    const { user, loading }: any = useAuth();
    const router = useRouter();
    const dateService =  DateService(); 

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/'); // Redireciona para a página de login (ajuste se for outra)
            }
        }
    }, [user, loading, router]);



    useEffect(()=>{
        let aux:marca = { 
            descricao:'',
            data_cadastro: dateService.obterDataAtual(),
            data_recadastro: dateService.obterDataHoraAtual()
        }
        setDados(aux);
    },[])
   

 async  function gravar(){
    if (!dados) return;

    setIsSaving(true);

        try {
            let result = await api.post('/offline/marcas', dados ,{
                headers:{ cnpj:  user.cnpj }
            });
            if (result.status === 200 && result.data.codigo > 0) {
                console.log(result)
                setVisibleAlert(true);
                setMsgAlert(`marca: ${dados?.descricao} cadastrada com Sucesso!`);
            }
        } catch(e) {
            console.error("Erro ao gravar marca:", e);
            setMsgAlert(`Erro ao gravar marca ${data?.descricao}.`);
            setVisibleAlert(true);
        } finally {
             setIsSaving(false);  
        }
              
    
     }
    

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
   
     function handleDescricao(descricao:string){
        setDados((prev)=> {
            return { ...prev , descricao:descricao };
             });
     }

    return (
        <div className="min-h-screen flex flex-col sm:ml-14 p-4 bg-slate-100 space-y-6 pb-20"> {/* Adiciona space-y e padding-bottom */}
            
                             <AlertDemo content={msgAlert} title="Aviso" visible={visibleAlert} setVisible={setVisibleAlert} to={'/marcas'}/>
            
              <div className="w-full max-w-screen-2xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 flex flex-col flex-1">
                    

                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Nova Marca
                        </h1>
                        <Button variant="outline" onClick={() => router.push('/marcas')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                        </Button>
                    </div>

                   {/* Use Card for grouping - optional but nice */}
                   <Card>
                        <CardHeader>
                            <CardTitle>Detalhes da Marca</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {/* Código Display */}
                            <div  >
                                <Label className="text-sm font-medium text-gray-600">Código:</Label>
                                <p className="text-lg font-semibold text-gray-900 mt-1">{data?.codigo}</p>
                            </div>

                            {/* Aplicação Input */}
                            <div>
                                <Label
                                // htmlFor="aplicacao"
                                  className="text-sm font-medium text-gray-600">Descricão:</Label>
                                <Input
                                    id="aplicacao"
                                    onChange={(e)=> handleDescricao(e.target.value)}
                                     defaultValue={dados?.descricao}
                                    className="mt-1 text-base"
                                    placeholder="Descrição da Marca"
                                />
                            </div>

                        </CardContent>
                    </Card>

                <div className="fixed bottom-0 left-0 right-0 border-t bg-background shadow-md p-3 z-10 sm:ml-14 bg-white">
                     <div className="max-w-3xl mx-auto flex justify-end">
                         <Button
                           onClick={gravar}
                           disabled={isSaving    }
                           size="lg"

                          >
                             <Save className="mr-2 h-4 w-4" />
                             {   isSaving ? 'Salvando...' : 'Salvar Alterações'  }
                            </Button>
                        </div>
                    </div>
               </div>
        </div>

        // --- FIM DAS ALTERAÇÕES DE ESTILO ---
    );
}