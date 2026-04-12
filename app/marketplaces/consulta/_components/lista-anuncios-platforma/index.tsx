'use client';
import { useState, useEffect } from "react";
import { marketplaceApi, MarketplaceAnunciosResponse, MarketplaceAccount, PLATFORM_CONFIG } from "@/app/services/marketplaceApi";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Store, ShoppingBag, Search, ExternalLink, Package, Loader2, RefreshCw
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MLAnuncioItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    permalink: string;
    thumbnail: string;
}

interface ListaAnunciosPlataformaProps {
    conta: MarketplaceAccount;
    onTrocarConta: () => void;
}

const ICONS = {
    Store,
    ShoppingBag
};

export function ListaAnunciosPlataforma({ conta, onTrocarConta }: ListaAnunciosPlataformaProps) {
    const { user }: any = useAuth();
    const [anuncios, setAnuncios] = useState<MLAnuncioItem[]>([]);
    const [totalEncontrado, setTotalEncontrado] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [buscaTermo, setBuscaTermo] = useState("");
    const [anunciosFiltrados, setAnunciosFiltrados] = useState<MLAnuncioItem[]>([]);

    const platformConfig = PLATFORM_CONFIG[conta.platform] || {
        label: conta.platform,
        color: 'bg-slate-200',
        textColor: 'text-slate-700',
        icon: 'Store'
    };

    const getIconComponent = () => {
        return ICONS[platformConfig.icon as keyof typeof ICONS] || Store;
    };

    const IconComponent = getIconComponent();

    useEffect(() => {
        if (user?.token && conta.ml_user_id) {
            fetchAnuncios();
        }
    }, [user, conta]);

    useEffect(() => {
        if (buscaTermo.trim() === "") {
            setAnunciosFiltrados(anuncios);
        } else {
            const termo = buscaTermo.toLowerCase();
            const filtered = anuncios.filter(item => 
                item.title.toLowerCase().includes(termo) ||
                item.id.toLowerCase().includes(termo)
            );
            setAnunciosFiltrados(filtered);
        }
    }, [buscaTermo, anuncios]);

    async function fetchAnuncios() {
        setIsLoading(true);
        try {
            const result = await marketplaceApi.getAnunciosML(
                user.token, 
                conta.ml_user_id
            );
            setAnuncios(result.items || []);
            setTotalEncontrado(result.total_found || 0);
            setAnunciosFiltrados(result.items || []);
        } catch (error) {
            console.error("Erro ao buscar anúncios:", error);
            setAnuncios([]);
            setAnunciosFiltrados([]);
        } finally {
            setIsLoading(false);
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {platformConfig.logo ? (
                            <Image 
                                src={platformConfig.logo}
                                alt={platformConfig.label}
                                width={48}
                                height={48}
                                className="object-contain rounded-md"
                            />
                        ) : (
                            <div className={cn("p-3 rounded-full", platformConfig.color, platformConfig.textColor)}>
                                <IconComponent size={24} />
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                {platformConfig.label}
                            </h2>
                            <p className="text-sm text-slate-500">
                                Conta: {conta.integration_name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={onTrocarConta}
                        >
                            Trocar Conta
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={fetchAnuncios}
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Busca */}
                <div className="mt-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por título ou código..."
                            value={buscaTermo}
                            onChange={(e) => setBuscaTermo(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Resultados */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-slate-200">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-slate-500">Carregando anúncios...</p>
                </div>
            ) : anunciosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
                    <Package className="h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600">
                        {buscaTermo ? "Nenhum resultado encontrado" : "Nenhum anúncio encontrado"}
                    </h3>
                    <p className="text-slate-400">
                        {buscaTermo 
                            ? "Tente buscar com outros termos."
                            : "Esta conta não possui anúncios publicados."}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-sm text-slate-500">
                        {buscaTermo 
                            ? `${anunciosFiltrados.length} de ${totalEncontrado} resultados`
                            : `${totalEncontrado} anúncio(s) encontrado(s)`}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {anunciosFiltrados.map((anuncio) => (
                            <Card 
                                key={anuncio.id} 
                                className="overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="relative aspect-square bg-slate-50 flex items-center justify-center">
                                    {anuncio.thumbnail ? (
                                        <img
                                            src={anuncio.thumbnail}
                                            alt={anuncio.title}
                                            className="object-contain w-full h-full p-2"
                                        />
                                    ) : (
                                        <Package className="h-12 w-12 text-slate-300" />
                                    )}
                                </div>

                                <CardContent className="p-4">
                                    <p className="text-xs font-mono text-slate-400 mb-1">
                                        {anuncio.id}
                                    </p>
                                    <h4 
                                        className="text-sm font-medium text-slate-700 line-clamp-2 leading-tight min-h-[40px]"
                                        title={anuncio.title}
                                    >
                                        {anuncio.title}
                                    </h4>
                                    
                                    <div className="mt-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-bold text-blue-700">
                                                {formatCurrency(anuncio.price)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Estoque: {anuncio.quantity}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-3 pt-0">
                                    {anuncio.permalink ? (
                                        <Button 
                                            asChild 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full text-xs gap-2 hover:text-blue-600 hover:border-blue-300"
                                        >
                                            <Link 
                                                href={anuncio.permalink} 
                                                target="_blank"
                                            >
                                                Ver no {platformConfig.label}
                                                <ExternalLink size={12} />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full text-xs text-slate-400" 
                                            disabled
                                        >
                                            Sem link
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}