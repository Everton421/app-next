'use client'
import { useState, useEffect } from "react";
import { configApi } from "@/app/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Package, Loader2, X } from "lucide-react";
import { ThreeDot } from 'react-loading-indicators';

interface Produto {
    codigo: number;
    descricao: string;
    preco: number;
    estoque: number;
    ativo: 'S' | 'N';
    marca?: { descricao: string };
}

interface FotoProduto {
    sequencia: number;
    link: string;
}

interface SelectProdutoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (produto: any, fotos: FotoProduto[]) => void;
}

export const SelectProdutoModal = ({ open, onOpenChange, onSelect }: SelectProdutoModalProps) => {
    const api = configApi();
    const { user }: any = useAuth();

    const [searchTerm, setSearchTerm] = useState("");
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
    const [fotos, setFotos] = useState<FotoProduto[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);

    useEffect(() => {
        if (open) {
            setSearchTerm("");
            setProdutos([]);
            setSelectedProduct(null);
            setFotos([]);
        }
    }, [open]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length >= 1 && user?.token) {
                buscarProdutos(searchTerm);
            } else {
                setProdutos([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, user]);

    async function buscarProdutos(term: string) {
        setIsLoading(true);
        try {
            const result = await api.get(`/produtos/search`, {
                headers: { token: user.token },
                params: { descricao: term, ativo: 'S' }
            });
            setProdutos(result.data || []);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            setProdutos([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSelectProduto(produto: Produto) {
        setSelectedProduct(produto);
        setLoadingPhotos(true);
        
        try {
            const [produtoRes, fotosRes] = await Promise.all([
                api.get(`/produtos/${produto.codigo}`, {
                    headers: { token: user.token }
                }),
                api.get(`/fotos/produto`, {
                    headers: { token: user.token },
                    params: { codigo: produto.codigo }
                })
            ]);
            
            const produtoCompleto = produtoRes.data;
            const fotosData = fotosRes.data || [];
            console.log("Fotos: ",fotosData )
            setLoadingPhotos(false);
            onSelect(produtoCompleto, fotosData);
            onOpenChange(false);
        } catch (error) {
            console.error("Erro ao buscar dados do produto:", error);
            setLoadingPhotos(false);
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-blue-800">
                        <Package className="h-5 w-5" />
                        Selecionar Produto
                    </DialogTitle>
                    <DialogDescription>
                        Busque e selecione o produto que deseja anunciar.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por código ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10"
                        autoFocus
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="mt-4 min-h-[300px] max-h-[400px] flex flex-col overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center flex-1">
                            <ThreeDot variant="pulsate" color="#2563eb" size="small" text="" textColor="" />
                        </div>
                    ) : produtos.length > 0 ? (
                        <ScrollArea className="flex-1">
                            <div className="space-y-2 pr-4">
                                {produtos.map((produto) => (
                                    <button
                                        key={produto.codigo}
                                        onClick={() => handleSelectProduto(produto)}
                                        className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                                        disabled={loadingPhotos && selectedProduct?.codigo === produto.codigo}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-100 p-2 rounded-md">
                                                <Package className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 line-clamp-1">
                                                    {produto.descricao}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Código: {produto.codigo}
                                                    {produto.marca?.descricao && ` • ${produto.marca.descricao}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-blue-700">
                                                {formatCurrency(produto.preco)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Estoque: {produto.estoque}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : searchTerm.length >= 1 ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
                            <Search className="h-10 w-10 text-slate-300 mb-2" />
                            <p>Nenhum produto encontrado</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
                            <Search className="h-10 w-10 text-slate-300 mb-2" />
                            <p>Digite para buscar produtos</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
