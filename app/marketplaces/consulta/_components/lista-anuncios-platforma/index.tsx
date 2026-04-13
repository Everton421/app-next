'use client';
import { useState, useEffect } from "react";
import { marketplaceApi, MarketplaceAnunciosResponse, MarketplaceAccount, PLATFORM_CONFIG } from "@/app/services/marketplaceApi";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
                <div className="space-y-3">
                    <p className="text-sm text-slate-500">
                        {buscaTermo 
                            ? `${anunciosFiltrados.length} de ${totalEncontrado} resultados`
                            : `${totalEncontrado} anúncio(s) encontrado(s)`}
                    </p>

                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead className="w-16">Img</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead className="text-right">Preço</TableHead>
                                    <TableHead className="text-center w-24">Estoque</TableHead>
                                    <TableHead className="w-14"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {anunciosFiltrados.map((anuncio) => (
                                    <TableRow 
                                        key={anuncio.id} 
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <TableCell>
                                            <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden">
                                                {anuncio.thumbnail ? (
                                                    <img
                                                        src={anuncio.thumbnail}
                                                        alt={anuncio.title}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <Package className="h-6 w-6 text-slate-300" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-xs font-mono text-slate-400 mb-0.5">
                                                {anuncio.id}
                                            </p>
                                            <p 
                                                className="text-sm font-medium text-slate-700 line-clamp-2 max-w-md"
                                                title={anuncio.title}
                                            >
                                                {anuncio.title}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-lg font-bold text-blue-700">
                                                {formatCurrency(anuncio.price)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={cn(
                                                "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium min-w-[60px]",
                                                anuncio.quantity > 0 
                                                    ? "bg-emerald-100 text-emerald-700" 
                                                    : "bg-red-100 text-red-700"
                                            )}>
                                                {anuncio.quantity}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {anuncio.permalink ? (
                                                <Button 
                                                    asChild 
                                                    variant="ghost" 
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Link 
                                                        href={anuncio.permalink} 
                                                        target="_blank"
                                                        title={`Ver no ${platformConfig.label}`}
                                                    >
                                                        <ExternalLink size={16} />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-slate-300">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}