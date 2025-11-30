'use client'
import { UseDateFunction } from "@/app/hooks/useDateFunction";
import { configApi } from "@/app/services/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
    ArrowLeft, 
    Store, 
    ShoppingBag, 
    ExternalLink, 
    AlertCircle, 
    PackageSearch 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ThreeDot } from 'react-loading-indicators'; // Mantendo seu padrão de loading
import Image from "next/image";
import Link from "next/link";

 
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/carousel'; // Assuming correct path

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDemo } from "@/components/alert/alert"; // Seu componente de alerta

// --- 1. CONFIGURAÇÃO VISUAL DAS PLATAFORMAS ---
const PLATFORM_CONFIG: Record<string, { label: string, color: string, icon: any, logo?: string }> = {
    'ML': {
        label: 'Mercado Livre',
        color: 'bg-[#ffe600] text-slate-900',
        icon: Store,
        logo: '/images/ML-logo.png' 
    },
    'SHOPEE': {
        label: 'Shopee',
        color: 'bg-[#ee4d2d] text-white',
        icon: ShoppingBag,
        logo: '/images/shopee-logo.png'
    },
    'DEFAULT': {
        label: 'Marketplace',
        color: 'bg-slate-200 text-slate-700',
        icon: Store
    }
};

// Tipagem do Anúncio (Baseada no seu JSON)
interface Anuncio {
    id: number;
    plataforma: string;
    titulo: string;
    preco: number;
    estoque: number;
    thumbnail: string | null;
    ativo: 'S' | 'N';
    link: string | null;
    id_externo: string | null;
}

export default function Anuncios({ params }: { params: { codigo: string } }) {
    const router = useRouter();
    const api = configApi();
    const { user, loading }: any = useAuth();
    
    // Estados
    const [data, setData] = useState<Anuncio[] | null>(null);
    const [msgAlert, setMsgAlert] = useState('');
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- BUSCA DE DADOS ---
    useEffect(() => {
        async function busca() {
            if (!loading && !user?.token) {
                router.push('/login');
                return;
            }
            
            setIsLoading(true);

            try {
                const resultdata = await api.get(`/ml/anuncios`, {
                    headers: { token: user.token },
                    params: { codigo_produto: Number(params.codigo) }
                });

                if (resultdata.status === 200 && resultdata.data) {
                    setData(resultdata.data);
                } else {
                    setData([]); // Array vazio para não quebrar o map
                }

            } catch (error) {
                console.error("Erro ao buscar dados dos anuncios:", error);
                setMsgAlert("Erro ao carregar dados dos anuncios.");
                setVisibleAlert(true);
                setData(null);
            } finally {
                setIsLoading(false);
            }
        }
        busca();
    }, [params.codigo, user, router, loading]); // Adicionei loading e api nas dependencias

    // --- 2. LÓGICA DE AGRUPAMENTO (HOOK USEMEMO) ---
    const groupedAds = useMemo(() => {
        if (!data || data.length === 0) return {};

        return data.reduce((groups, ad) => {
            // Se vier null ou undefined, joga para "OUTROS"
            const key = ad.plataforma ? ad.plataforma.toUpperCase() : 'DEFAULT';
            
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(ad);
            return groups;
        }, {} as Record<string, Anuncio[]>);
    }, [data]);

    // Helper de Moeda
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };


    // --- RENDERIZAÇÃO ---

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-100">
                <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col sm:ml-14 bg-slate-100">
            
            {/* Header Fixo / Topo */}
            <div className="w-full bg-white border-b border-gray-200 p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/produtos/${params.codigo}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <h1 className="text-xl font-bold text-slate-800">
                        Gestão de Anúncios <span className="text-slate-400 text-sm font-normal">| Produto {params.codigo}</span>
                    </h1>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                
                <AlertDemo content={msgAlert} title="Aviso" visible={visibleAlert} setVisible={setVisibleAlert} />

                {/* Caso não tenha anúncios */}
                {!isLoading && data && data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
                        <PackageSearch className="h-16 w-16 text-slate-300 mb-4"/>
                        <h3 className="text-lg font-semibold text-slate-600">Nenhum anúncio encontrado</h3>
                        <p className="text-slate-400">Este produto ainda não foi publicado em nenhum marketplace.</p>
                        <Button className="mt-4" onClick={() => router.push(`/produtos/${params.codigo}`)}>
                            Voltar e Anunciar
                        </Button>
                    </div>
                )}

                {/* Loop pelas Plataformas */}
                {Object.entries(groupedAds).map(([platformKey, platformAds]) => {
                    const config = PLATFORM_CONFIG[platformKey] || PLATFORM_CONFIG['DEFAULT'];
                    const Icon = config.icon;

                    return (
                        <div key={platformKey} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            
                            {/* Barra de Título da Plataforma */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                {config.logo ? (
                                    <Image 
                                        src={config.logo} 
                                        alt={config.label} 
                                        width={32} height={32} 
                                        className="object-contain"
                                    />
                                ) : (
                                    <div className={`p-2 rounded-full ${config.color}`}>
                                        <Icon size={20} />
                                    </div>
                                )}
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                    {config.label}
                                    { //<Badge variant="secondary" className="ml-2">
                                        <>{platformAds.length} </>
                                       //</Badge>
                                        }
                                </h2>
                            </div>

                            {/* Área do Carrossel */}
                            <div className="p-6">
                                <Carousel opts={{ align: "start", loop: false }} className="w-full">
                                    <CarouselContent className="-ml-4">
                                        {platformAds.map((ad) => (
                                            <CarouselItem key={ad.id}  className="pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                                <Card className="h-full flex flex-col group hover:border-blue-300 transition-all duration-300">
                                                    
                                                    {/* Imagem */}
                                                    <div className="relative aspect-square w-full bg-white p-4 border-b flex items-center justify-center overflow-hidden rounded-t-lg">
                                                        {ad.thumbnail ? (
                                                            <img 
                                                                src={ad.thumbnail} 
                                                                alt={ad.titulo}
                                                                className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <Store className="h-10 w-10 text-slate-200" />
                                                        )}
                                                        
                                                        {/* Status Badge */}
                                                        <div className="absolute top-2 right-2">
                                                            { 
                                                            //<Badge className={ad.ativo === 'S' ? "bg-green-500 hover:bg-green-600" : "bg-slate-400 hover:bg-slate-500"}>
                                                              <>   {ad.ativo === 'S' ? 'Ativo' : 'Pausado'}</> 
                                                            //</Badge>
                                                            }
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <CardContent className="p-4 flex-1 flex flex-col gap-2">
                                                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                                            {ad.id_externo || `Ref: ${ad.id}`}
                                                        </span>
                                                        <h4 className="text-sm font-medium text-slate-700 line-clamp-2 leading-tight min-h-[40px]" title={ad.titulo}>
                                                            {ad.titulo}
                                                        </h4>
                                                        
                                                        <div className="mt-auto pt-2">
                                                            <p className="text-lg font-bold text-blue-700">
                                                                {formatCurrency(ad.preco)}
                                                            </p>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                                <PackageSearch size={12}/> Estoque: {ad.estoque}
                                                            </p>
                                                        </div>
                                                    </CardContent>

                                                    {/* Ações */}
                                                    <CardFooter className="p-3 pt-0">
                                                        {ad.link ? (
                                                            <Button asChild variant="outline" size="sm" className="w-full text-xs gap-2 hover:text-blue-600 hover:border-blue-200">
                                                                <Link href={ad.link} target="_blank">
                                                                    Ver Anúncio <ExternalLink size={12}/>
                                                                </Link>
                                                            </Button>
                                                        ) : (
                                                            <Button variant="ghost" size="sm" className="w-full text-xs text-slate-400" disabled>
                                                                Sem Link <AlertCircle size={12}/>
                                                            </Button>
                                                        )}
                                                    </CardFooter>
                                                </Card>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}