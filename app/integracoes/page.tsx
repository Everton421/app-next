'use client'
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from "@/components/ui/dialog";
import { CirclePlus, Loader2, Save, Trash2, Calendar, Store, LogOut } from "lucide-react";
import Image from "next/image";
import { configApi } from "../services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 
import { ThreeDot } from "react-loading-indicators";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// 1. Definição da Interface dos dados que vêm do banco
interface IMlIntegration {
    id: number;
    ml_user_id: number;
    integration_name: string;
    created_at: string;
    // Adicione outros campos se vierem da API
}

export default function Integracoes() {
    const api = configApi();
    const { user }: any = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(true);

    // Estados do Modal
    const [showNameModal, setShowNameModal] = useState(false);
    const [tempToken, setTempToken] = useState("");
    const [integrationName, setIntegrationName] = useState("");

    // Estado da Lista (Tipado)
    const [dataIntegration, setDataIntegration] = useState<IMlIntegration[]>([]);

    // --- BUSCAR INTEGRAÇÕES ---
    // Envolvemos no useCallback para poder chamar novamente após salvar
    const getIntegrations = useCallback(async () => {
        if (!user || !user.codigo) return;
        
        try {
            const result = await api.get(`/ml/accounts/${user.codigo}`, {
                headers: { token: user.token }
            });
            if (result.data) {
                setDataIntegration(result.data);
            }
        } catch (error) {
            console.error("Erro ao buscar integrações", error);
        } finally {
            setIsLoadingList(false);
        }
    }, [api, user]);

    // --- EFEITO: Carrega lista ao iniciar ---
    useEffect(() => {
        getIntegrations();
    }, [getIntegrations]);

    // --- EFEITO: Monitora a URL (Callback do ML) ---
    useEffect(() => {
        const tokenData = searchParams.get('data');
        if (tokenData) {
            setTempToken(tokenData);
            setShowNameModal(true);
        }

        const status = searchParams.get('status');
        if (status === 'error') {
            toast.error("Houve um erro na integração. Tente novamente.");
            router.replace('/integracoes');
        }
    }, [searchParams, router]);


    // --- FUNÇÃO 1: Inicia o fluxo ---
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
            toast.error("Erro ao iniciar integração.");
        }
    }

    // --- FUNÇÃO 2: Finaliza o fluxo ---
    async function handleFinalizeIntegration() {
        if (!integrationName.trim()) {
            toast.warning("Por favor, digite um nome para a integração.");
            return;
        }

        setIsSaving(true);
        try {
            await api.post('/ml/integrations/finalizeIntegration', {
                integrationName: integrationName,
                tempToken: tempToken
            }, {
                headers: { token: user.token }
            });

            toast.success("Integração concluída com sucesso!");
            
            // Limpa estados e modal
            setShowNameModal(false);
            setIntegrationName("");
            setTempToken("");
            router.replace('/integracoes');
            
            // ATUALIZA A LISTA IMEDIATAMENTE
            getIntegrations(); 

        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar a integração.");
        } finally {
            setIsSaving(false);
        }
    }

     // URL oficial de Logout do Mercado Livre
    const ML_LOGOUT_URL = "https://www.mercadolivre.com/jms/mlb/lgz/logout";

    // Nova função: Logout + Auth
    async function handleSwitchAccountAndConnect() {
        setIsRedirecting(true);

        // 1. Abre uma popup/aba para fazer o logout no domínio do ML
        const logoutWindow = window.open(ML_LOGOUT_URL, "ml_logout", "width=500,height=600");

        // 2. Espera um tempo para o logout processar (2 segundos costuma ser suficiente)
        setTimeout(async () => {
            // Fecha a janela de logout (opcional, as vezes o navegador bloqueia fechar via script)
            if (logoutWindow) logoutWindow.close();

            // 3. Agora iniciamos o fluxo normal, o ML vai pedir login pois o cookie morreu
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
                toast.error("Erro ao iniciar integração.");
            }
        }, 2000); // 2000ms = 2 segundos
    }

    return (
        <main className="sm:ml-14 p-6 bg-slate-50 min-h-screen">
            
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* CABEÇALHO DA PÁGINA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Integrações</h1>
                        <p className="text-slate-500">Gerencie suas conexões com Marketplaces</p>
                    </div>
                    
                    {/* Botão de Conectar */}
                 
                </div>
                  <div className="flex gap-2">
                        {/* Botão Principal (Fluxo Rápido) */}
                        <Button
                            className="bg-[#ffe600] text-slate-900 hover:bg-[#e6cf00] font-medium"
                            onClick={() => handleConnectML()} // Chama o método normal
                            disabled={isRedirecting}
                        >
                            {isRedirecting ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Image
                                        src="/images/ML-logo.png"
                                        alt="ML"
                                        width={24}
                                        height={24}
                                        className="mr-2 object-contain"
                                    />
                                    Nova Integração
                                </>
                            )}
                        </Button>

                        {/* Dropdown para Opções Extras */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" disabled={isRedirecting}>
                                    <CirclePlus className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleConnectML()}>
                                    Conectar conta atual (Navegador)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSwitchAccountAndConnect()} className="text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Trocar de conta e conectar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                {/* LISTA DE LOJAS (GRID) */}
                <div>
                    <h2 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                        <Store className="h-5 w-5" /> Lojas Vinculadas
                    </h2>

                    {isLoadingList ? (
                        <div className="flex justify-center p-10">
                                    <ThreeDot color='#185FED'/>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  ">
                            {dataIntegration && dataIntegration.length > 0 ? (
                                dataIntegration.map((item) => (
                                    <Card key={item.id} className="border-l-4 border-l-[#ffe600] hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-slate-100 p-2 rounded-full">
                                                        <Image
                                                            src="/images/ML-logo.png"
                                                            alt="Logo Mercado Livre"
                                                            width={50}
                                                            height={50}
                                                        />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base font-bold text-slate-800">
                                                            {item.integration_name}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs">
                                                            ID ML: {item.ml_user_id}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                {/* Badge de Status (Pode adicionar lógica se tiver campo ativo/inativo) */}
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Ativo
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    Conectado em: {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                            
                                            {/* Espaço para botões de ação futuros (Configurar, Excluir) */}
                                            <div className="mt-4 flex justify-end">
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center p-10 bg-white rounded-lg border border-dashed border-slate-300">
                                    <Store className="h-12 w-12 text-slate-300 mb-2" />
                                    <p className="text-slate-500">Nenhuma loja vinculada encontrada.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL (DIALOG) MANTIDO --- */}
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
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowNameModal(false);
                                router.replace('/integracoes');
                            }}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>

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