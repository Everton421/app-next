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
import { Store, Loader2, UploadCloud, AlertTriangle } from "lucide-react";
import { toast } from "sonner"; // Recomendo usar toast, ou troque por alert()

// Tipagens (Idealmente ficariam em um arquivo types.ts)
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
    // ... outros campos
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
    
    const [mlTitle, setMlTitle] = useState("");
    const [mlPrice, setMlPrice] = useState("");
    const [mlStock, setMlStock] = useState("");
    const [mlListingType, setMlListingType] = useState("gold_special");
    const [mlCondition, setMlCondition] = useState("new");
    
    // Estados da Categoria e Atributos
    const [categoryId, setCategoryId] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [requiredAttrs, setRequiredAttrs] = useState<any[]>([]);
    const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

    // --- EFEITO 1: Inicializa os dados quando o modal abre ---
    useEffect(() => {
        if (open && data) {
            setMlTitle(data.descricao || "");
            setMlPrice(String(data.preco || ""));
            setMlStock(String(data.estoque || ""));
            setMlCondition("new");
            // Limpa estados anteriores
            setCategoryId("");
            setCategoryName("");
            setRequiredAttrs([]);
            setDynamicValues({});
            
            // Inicia predição
            guessCategory(data.descricao);
        }
    }, [open, data]);

    useEffect(() => {
   //     async get
        if (open && data) {
            const resultApiIntegration = await api.get(`/ml/accounts/${user.codigo}`)
        }

    }, [open, data]);


    // --- FUNÇÃO: Prever Categoria ---
    async function guessCategory(title: string) {
        if (!title) return;
        setPredicting(true);
        try {
            const response = await api.post('/ml/tools/predict-category', { title }, {
                headers: { token: user.token }
            });
            
            if (response.data && response.data.category_id) {
                setCategoryId(response.data.category_id);
                setCategoryName(response.data.category_name);
                
                if (response.data.required_attributes) {
                    setRequiredAttrs(response.data.required_attributes);
                } else {
                    setRequiredAttrs([]);
                }
            }
        } catch (error) {
            console.error("Erro ao prever categoria", error);
            toast.error("Erro ao identificar categoria automaticamente.");
        } finally {
            setPredicting(false);
        }
    }

    // --- FUNÇÃO: Enviar ---
    const handlePublishToML = async () => {
        if (!categoryId) {
            toast.warning("Categoria não identificada. Verifique o título.");
            return;
        }

        // Validação dos campos dinâmicos
        for (const attr of requiredAttrs) {
            if (!dynamicValues[attr.id]) {
                toast.warning(`O campo "${attr.name}" é obrigatório.`);
                return;
            }
        }

        setMlLoading(true);
        try {
            const pictureUrls = fotos.map(f => f.link);

            // Prepara atributos dinâmicos
            const attributesToSend = Object.entries(dynamicValues).map(([id, value]) => ({
                id, value_name: value
            }));

            // Adiciona atributos fixos se não estiverem na lista
            // (Nota: O backend deve tratar a prioridade, mas mandamos aqui por garantia)
            if (!dynamicValues['BRAND']) attributesToSend.push({ id: 'BRAND', value_name: data?.marca?.descricao || "Genérica" });
            if (!dynamicValues['MODEL']) attributesToSend.push({ id: 'MODEL', value_name: "Padrão" });
            if (data?.num_fabricante) attributesToSend.push({ id: 'GTIN', value_name: data.num_fabricante });

            const payload = {
                title: mlTitle,
                price: Number(mlPrice),
                available_quantity: Number(mlStock),
                category_id: categoryId,
                listing_type_id: mlListingType,
                condition: mlCondition,
                description: `Produto: ${mlTitle}\n\n${data?.observacoes1 || ''}\n${data?.observacoes2 || ''}`,
                pictures: pictureUrls.length > 0 ? pictureUrls : ["https://via.placeholder.com/500"], // ML exige foto
                attributes: attributesToSend
            };

            await api.post('/ml/items/publish', payload, { // Ajuste para sua rota correta
                headers: { token: user.token }
            });

            toast.success("Produto enviado para o Mercado Livre com sucesso!");
            onOpenChange(false); // Fecha o modal
            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error(error);
            const erroMsg = error.response?.data?.msg || "Erro desconhecido ao publicar.";
            toast.error(`Erro no Mercado Livre: ${erroMsg}`);
        } finally {
            setMlLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
               <div>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-blue-800">
                        <Store className="h-5 w-5" /> Publicar no Mercado Livre
                    </DialogTitle>
                    <DialogDescription>
                        Revise os dados antes de criar o anúncio.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    
                    {/* Fotos e Título */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Carrossel Pequeno */}
                        <div className="w-full md:w-1/3 flex justify-center bg-slate-50 rounded-md p-2">
                            {fotos.length > 0 ? (
                                <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-[150px]">
                                    <CarouselContent>
                                        {fotos.map((foto) => (
                                            <CarouselItem key={foto.sequencia}>
                                                <img
                                                    className="object-contain aspect-square w-full h-auto rounded-md"
                                                    src={String(foto.link)}
                                                    alt="Foto"
                                                    onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}
                                                />
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

                        {/* Título e Categoria */}
                        <div className="w-full md:w-2/3 space-y-3">
                            <div>
                                <Label htmlFor="ml-title">Título do Anúncio</Label>
                                <Input 
                                    id="ml-title" 
                                    value={mlTitle} 
                                    onChange={(e) => setMlTitle(e.target.value)}
                                    maxLength={60} 
                                />
                                <div className="flex justify-between text-xs mt-1">
                                    <span className={mlTitle.length > 60 ? "text-red-500" : "text-gray-400"}>
                                        {mlTitle.length}/60
                                    </span>
                                    {predicting ? (
                                        <span className="flex items-center gap-1 text-blue-600"><Loader2 className="h-3 w-3 animate-spin"/> Detectando categoria...</span>
                                    ) : (
                                        <span className="text-green-600 font-medium truncate max-w-[200px]" title={categoryName}>
                                            {categoryName || "Categoria não detectada"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preço e Estoque */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="ml-price">Preço (R$)</Label>
                            <Input 
                                id="ml-price" 
                                type="number" 
                                value={mlPrice} 
                                onChange={(e) => setMlPrice(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="ml-stock">Estoque ML</Label>
                            <Input 
                                id="ml-stock" 
                                type="number" 
                                value={mlStock} 
                                onChange={(e) => setMlStock(e.target.value)} 
                            />
                        </div>
                    </div>

                    {/* Configurações ML */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Tipo de Anúncio</Label>
                            <Select value={mlListingType} onValueChange={setMlListingType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gold_special">Clássico</SelectItem>
                                    <SelectItem value="gold_pro">Premium (Sem Juros)</SelectItem>
                                    <SelectItem value="free">Grátis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Condição</Label>
                            <Select value={mlCondition} onValueChange={setMlCondition}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">Novo</SelectItem>
                                    <SelectItem value="used">Usado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Atributos Obrigatórios */}
                    {requiredAttrs.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 space-y-3">
                            <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> 
                                Dados Técnicos Obrigatórios
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {requiredAttrs.map((attr) => (
                                    <div key={attr.id} className="space-y-1">
                                        <Label htmlFor={attr.id} className="text-xs font-semibold text-gray-700">
                                            {attr.name} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id={attr.id}
                                            placeholder={attr.hint || `Digite...`}
                                            value={dynamicValues[attr.id] || ""}
                                            onChange={(e) => {
                                                setDynamicValues(prev => ({
                                                    ...prev,
                                                    [attr.id]: e.target.value
                                                }));
                                            }}
                                            className="bg-white h-8 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mlLoading}>
                        Cancelar
                    </Button>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handlePublishToML} 
                        disabled={mlLoading || !categoryId || predicting}
                    >
                        {mlLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" /> Confirmar Envio
                            </>
                        )}
                    </Button>
                </DialogFooter>
               </div>
            </DialogContent>
        </Dialog>
    );
}