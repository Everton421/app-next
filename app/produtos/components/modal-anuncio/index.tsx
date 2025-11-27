'use client'
import { useState, useEffect } from "react";
import { configApi } from "@/app/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { 
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/carousel";
import { Store, Loader2, UploadCloud, AlertTriangle, ChevronRight, User } from "lucide-react";
import { toast } from "sonner"; 
import Image from "next/image";
import { Card } from "@/components/ui/card"; // Importe o Card se tiver, ou use div com borda

// Tipagens
interface MlAccount {
    id: number;
    ml_user_id: number;
    integration_name: string;
}

interface FotoProduto {
    sequencia: number;
    link: string;
}

interface Produto {
    codigo: number;
    descricao: string;
    preco: number;
    estoque: number;
    marca: { descricao: string };
    num_fabricante?: string | null;
    observacoes1?: string | null;
    observacoes2?: string | null;
}

interface ModalAnuncioProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: Produto | null;
    fotos: FotoProduto[];
    onSuccess?: () => void;
}

export const ModalAnuncio = ({ open, onOpenChange, data, fotos, onSuccess }: ModalAnuncioProps) => {
    const api = configApi();
    const { user }: any = useAuth();

    // Estados do Formulário ML
    const [mlLoading, setMlLoading] = useState(false);
    const [predicting, setPredicting] = useState(false);
    
    // Estados do Produto para Envio
    const [mlTitle, setMlTitle] = useState("");
    const [mlPrice, setMlPrice] = useState("");
    const [mlStock, setMlStock] = useState("");
    const [mlListingType, setMlListingType] = useState("gold_special");
    const [mlCondition, setMlCondition] = useState("new");
    
    // Estados da Categoria
    const [categoryId, setCategoryId] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [requiredAttrs, setRequiredAttrs] = useState<any[]>([]);
    const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

    // Estados de Seleção de Conta
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [dataAccounts, setDataAccounts] = useState<MlAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<MlAccount | null>(null);

    // --- EFEITO 1: Carregar Contas ao Abrir ---
    useEffect(() => {
        if (open && user?.codigo) {
            fetchAccounts();
        }
        
        // Resetar seleção ao fechar/abrir
        if (!open) {
            setSelectedAccount(null);
        }
    }, [open, user]);

    // --- EFEITO 2: Inicializa dados do produto quando o modal abre ---
    useEffect(() => {
        if (open && data) {
            setMlTitle(data.descricao || "");
            setMlPrice(String(data.preco || ""));
            setMlStock(String(data.estoque || ""));
            setMlCondition("new");
            
            setCategoryId("");
            setCategoryName("");
            setRequiredAttrs([]);
            setDynamicValues({});
            
            guessCategory(data.descricao);
        }
    }, [open, data]);

    async function fetchAccounts() {
        try {
            setLoadingAccounts(true);
            const result = await api.get(`/ml/accounts/${user.codigo}`, {
                headers: { token: user.token }
            });
            
            const accounts = result.data || [];
            setDataAccounts(accounts);

            // SE TIVER SÓ UMA CONTA, JÁ SELECIONA AUTOMATICO
            if (accounts.length === 1) {
                setSelectedAccount(accounts[0]);
            }

        } catch (e) {
            console.error("Erro ao buscar integrações", e);
            toast.error("Erro ao carregar contas vinculadas.");
        } finally {
            setLoadingAccounts(false);
        }
    }

    // --- FUNÇÃO: Prever Categoria ---
    async function guessCategory(title: string) {
        if (!title) return;
        setPredicting(true);
        try {
            const response = await api.post('/ml/tools/predict-category', { title }, {
                headers: { token: user.token }
            });
            
            if (response.data?.category_id) {
                setCategoryId(response.data.category_id);
                setCategoryName(response.data.category_name);
                setRequiredAttrs(response.data.required_attributes || []);
            }
        } catch (error) {
            console.error("Erro ao prever categoria", error);
        } finally {
            setPredicting(false);
        }
    }

    // --- FUNÇÃO: Enviar ---
    const handlePublishToML = async () => {
        if (!selectedAccount) {
            toast.warning("Selecione uma conta para publicar.");
            return;
        }

        if (!categoryId) {
            toast.warning("Categoria não identificada. Verifique o título.");
            return;
        }

        for (const attr of requiredAttrs) {
            if (!dynamicValues[attr.id]) {
                toast.warning(`O campo "${attr.name}" é obrigatório.`);
                return;
            }
        }

        setMlLoading(true);
        try {
            const pictureUrls = fotos.map(f => f.link);

            const attributesToSend = Object.entries(dynamicValues).map(([id, value]) => ({
                id, value_name: value
            }));

            // Adiciona atributos fixos
            if (!dynamicValues['BRAND']) attributesToSend.push({ id: 'BRAND', value_name: data?.marca?.descricao || "Genérica" });
            if (!dynamicValues['MODEL']) attributesToSend.push({ id: 'MODEL', value_name: "Padrão" });
            if (data?.num_fabricante) attributesToSend.push({ id: 'GTIN', value_name: data.num_fabricante });

            const payload = {
                // ENVIA O ID DA CONTA SELECIONADA
                selected_ml_user_id: selectedAccount.ml_user_id, 
                
                title: mlTitle,
                price: Number(mlPrice),
                available_quantity: Number(mlStock),
                category_id: categoryId,
                listing_type_id: mlListingType,
                condition: mlCondition,
                description: `Produto: ${mlTitle}\n\n${data?.observacoes1 || ''}\n${data?.observacoes2 || ''}`,
                pictures: pictureUrls.length > 0 ? pictureUrls : ["https://http2.mlstatic.com/D_NQ_NP_964047-MLA44034285816_112020-O.jpg"], 
                attributes: attributesToSend
            };

            await api.post('/ml/items/publish', payload, {
                headers: { token: user.token }
            });

            toast.success(`Anúncio enviado para ${selectedAccount.integration_name}!`);
            onOpenChange(false);
            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error(error);
            const erroMsg = error.response?.data?.msg || "Erro desconhecido ao publicar.";
            toast.error(`Erro: ${erroMsg}`);
        } finally {
            setMlLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto transition-all">
                
                {/* --- HEADER COMUM --- */}
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-blue-800">
                        <Store className="h-5 w-5" /> 
                        {selectedAccount ? "Configurar Anúncio" : "Selecionar Loja"}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedAccount 
                            ? `Publicando na conta: ${selectedAccount.integration_name}`
                            : "Escolha em qual conta do Mercado Livre deseja anunciar."
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* --- ESTADO 1: CARREGANDO CONTAS --- */}
                {loadingAccounts && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600"/>
                    </div>
                )}

                {/* --- ESTADO 2: SELEÇÃO DE CONTA --- */}
                {!loadingAccounts && !selectedAccount && (
                    <div className="grid gap-3 py-4">
                        {dataAccounts.length > 0 ? (
                            dataAccounts.map((account) => (
                                <button
                                    key={account.id}
                                    onClick={() => setSelectedAccount(account)}
                                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-400 p-2 rounded-full">
                                            <Image src="/images/ML-logo.png" alt="ML" width={70} height={70} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{account.integration_name}</p>
                                            <p className="text-xs text-slate-500">ID: {account.ml_user_id}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-blue-500" />
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-6 text-slate-500">
                                Nenhuma integração encontrada. <br/>
                                <Button variant="link" onClick={() => window.location.href = '/integracoes'}>
                                    Configurar Integração
                                </Button>
                            </div>
                        )}
                        <DialogFooter>
                             <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        </DialogFooter>
                    </div>
                )}

                {/* --- ESTADO 3: FORMULÁRIO DE EDIÇÃO --- */}
                {!loadingAccounts && selectedAccount && (
                    <div className="grid gap-6 py-4 animate-in fade-in zoom-in duration-300">
                        
                        {/* Barra de Trocar Conta (Se tiver mais de uma) */}
                        {dataAccounts.length > 1 && (
                            <div className="flex justify-between items-center bg-slate-100 px-3 py-2 rounded text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-500"/>
                                    <span className="font-medium">{selectedAccount.integration_name}</span>
                                </div>
                                <Button variant="link" size="sm" onClick={() => setSelectedAccount(null)} className="h-auto p-0">
                                    Trocar
                                </Button>
                            </div>
                        )}

                        {/* ... RESTANTE DO SEU FORMULÁRIO (Fotos, Título, Preço, etc) ... */}
                        
                        <div className="flex flex-col md:flex-row gap-4">
                             {/* Carrossel de Fotos */}
                            <div className="w-full md:w-1/3 flex justify-center bg-slate-50 rounded-md p-2">
                                {fotos.length > 0 ? (
                                    <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-[150px]">
                                        <CarouselContent>
                                            {fotos.map((foto) => (
                                                <CarouselItem key={foto.sequencia}>
                                                    <img className="object-contain aspect-square w-full h-auto rounded-md" src={String(foto.link)} alt="Foto" />
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="-left-4" />
                                        <CarouselNext className="-right-4" />
                                    </Carousel>
                                ) : (
                                    <div className="text-xs text-gray-400 flex items-center justify-center h-24">Sem fotos</div>
                                )}
                            </div>

                            {/* Inputs Principais */}
                            <div className="w-full md:w-2/3 space-y-3">
                                <div>
                                    <Label htmlFor="ml-title">Título do Anúncio</Label>
                                    <Input id="ml-title" value={mlTitle} onChange={(e) => setMlTitle(e.target.value)} maxLength={60} />
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-gray-400">{mlTitle.length}/60</span>
                                        {predicting ? (
                                            <span className="flex items-center gap-1 text-blue-600"><Loader2 className="h-3 w-3 animate-spin"/> Detectando...</span>
                                        ) : (
                                            <span className="text-green-600 font-medium truncate max-w-[200px]">{categoryName}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Campos Preço/Estoque */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="ml-price">Preço</Label>
                                <Input id="ml-price" type="number" value={mlPrice} onChange={(e) => setMlPrice(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="ml-stock">Estoque ML</Label>
                                <Input id="ml-stock" type="number" value={mlStock} onChange={(e) => setMlStock(e.target.value)} />
                            </div>
                        </div>

                        {/* Tipo de Anuncio */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Tipo</Label>
                                <Select value={mlListingType} onValueChange={setMlListingType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gold_special">Clássico</SelectItem>
                                        <SelectItem value="gold_pro">Premium</SelectItem>
                                        <SelectItem value="free">Grátis</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Condição</Label>
                                <Select value={mlCondition} onValueChange={setMlCondition}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">Novo</SelectItem>
                                        <SelectItem value="used">Usado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Campos Dinâmicos */}
                        {requiredAttrs.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 space-y-3">
                                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Obrigatórios
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {requiredAttrs.map((attr) => (
                                        <div key={attr.id} className="space-y-1">
                                            <Label className="text-xs font-semibold">{attr.name} *</Label>
                                            <Input 
                                                className="bg-white h-8 text-sm"
                                                value={dynamicValues[attr.id] || ""}
                                                onChange={(e) => setDynamicValues(prev => ({...prev, [attr.id]: e.target.value}))}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handlePublishToML} disabled={mlLoading || !categoryId}>
                                {mlLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2 h-4 w-4" />}
                                Publicar
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}