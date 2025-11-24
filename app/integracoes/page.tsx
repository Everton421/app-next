'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Importe o Input
import { Label } from "@/components/ui/label"; // Importe o Label
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from "@/components/ui/dialog"; // Importe os componentes de Dialog
import { CirclePlus, Loader2, Save } from "lucide-react";
import Image from "next/image";
import { configApi } from "../services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner"; // Sugestão: Use toast para feedback (opcional)

export default function Integracoes() {
    const api = configApi();
    const { user }: any = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Estados de carregamento e controle
    const [isRedirecting, setIsRedirecting] = useState(false); // Loading do botão conectar
    const [isSaving, setIsSaving] = useState(false); // Loading do botão salvar nome

    // Estados do Modal de Finalização
    const [showNameModal, setShowNameModal] = useState(false);
    const [tempToken, setTempToken] = useState("");
    const [integrationName, setIntegrationName] = useState("");

    // --- EFEITO: Monitora a URL ---
    useEffect(() => {
        // 1. Verifica se voltou com o token temporário (fluxo novo)
        const tokenData = searchParams.get('data');
            console.log(tokenData )
        if (tokenData) {
            setTempToken(tokenData);
            setShowNameModal(true); // Abre o modal automaticamente
            // Limpa a URL visualmente mas mantém o estado
            // window.history.replaceState(null, '', '/integracoes'); 
        }

        // 2. Verifica mensagens de erro antigas ou genéricas
        const status = searchParams.get('status');
        if (status === 'error') {
            toast.success("Houve um erro na integração. Tente novamente.")

            router.replace('/integracoes');
        }

    }, [searchParams, router]);

    // --- FUNÇÃO 1: Inicia o fluxo (vai pro ML) ---
    async function handleConnectML() {
        setIsRedirecting(true);
        try {
            const result = await api.post(`/ml/integrations/getCode`, {}, {
                params: { vendedor: user.codigo },
                headers: { token: user.token },
            });

            const externalUrl = result.data.uri;
            if (externalUrl) {
                window.location.href = externalUrl;
            } else {
                setIsRedirecting(false);
            }
        } catch (e) {
            console.log(e);
            setIsRedirecting(false);
            alert("Erro ao iniciar integração.");
        }
    }

    // --- FUNÇÃO 2: Finaliza o fluxo (Envia nome + token para o backend) ---
    async function handleFinalizeIntegration() {
        if (!integrationName.trim()) {
            toast.success("Por favor, digite um nome para a integração.")
            return;
        }

        setIsSaving(true);
        try {
            // Chama a rota que cria o registro na tabela principal
            await api.post('/ml/integrations/finalizeIntegration', {
                integrationName: integrationName,
                tempToken: tempToken
            }, {
                headers: { token: user.token }
            });

            // Sucesso!
            toast.success("Integração concluída com sucesso!")
            setShowNameModal(false);
            setIntegrationName("");
            setTempToken("");
            
            // Limpa a URL completamente
            router.replace('/integracoes');
            
            // Opcional: Recarregar a lista de integrações se tiver
            // window.location.reload(); 

        } catch (error) {
            console.error(error);
            alert("Erro ao salvar a integração.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main className="sm:ml-14 p-4 bg-slate-100 min-h-screen h-full">
            
            {/* Botão de Conectar */}
            <Button
                variant='outline'
                className="w-auto h-auto gap-2"
                onClick={() => handleConnectML()}
                disabled={isRedirecting}
            >
                {isRedirecting ? (
                    <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                ) : (
                    <>
                        <Image
                            src="/images/ML-logo.png"
                            alt="Logo Mercado Livre"
                            width={100}
                            height={100}
                        />
                        <CirclePlus className="m-3 mr-2 h-4 w-4" />
                    </>
                )}
            </Button>

            {/* --- MODAL PARA NOMEAR A INTEGRAÇÃO --- */}
            <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Integração Conectada!</DialogTitle>
                        <DialogDescription>
                            A conta do Mercado Livre foi autorizada. <br/>
                            Defina um nome para identificar esta conta no seu ERP.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex flex-col gap-4 py-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="name">Nome da Loja / Apelido</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Loja Oficial, Outlet, Conta João..."
                                value={integrationName}
                                onChange={(e) => setIntegrationName(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-end">
                        {/* Botão Cancelar (opcional) */}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowNameModal(false);
                                router.replace('/integracoes'); // Limpa URL se cancelar
                            }}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>

                        {/* Botão Salvar */}
                        <Button 
                            type="button" 
                            onClick={handleFinalizeIntegration}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Concluir
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </main>
    )
}