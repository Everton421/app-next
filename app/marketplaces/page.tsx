'use client'
import { configApi } from "@/app/services/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
    ArrowLeft, 
    Store, 
    ShoppingBag, 
    ExternalLink, 
    AlertCircle, 
    PackageSearch,
    Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ThreeDot } from 'react-loading-indicators';
import Image from "next/image";
import Link from "next/link";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/carousel';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertDemo } from "@/components/alert/alert";
import { ModalAnuncio } from "@/app/produtos/components/modal-anuncio";
import { SelectProdutoModal } from "./_components/select-produto-modal";

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

export default function Anuncios() {
    const router = useRouter();
    const api = configApi();
    const { user, loading }: any = useAuth();
    
    const [data, setData] = useState<Anuncio[] | null>(null);
    const [msgAlert, setMsgAlert] = useState('');
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [showSelectProdutoModal, setShowSelectProdutoModal] = useState(false);
    const [showAnuncioModal, setShowAnuncioModal] = useState(false);
    const [selectedProduto, setSelectedProduto] = useState<any>(null);
    const [selectedFotos, setSelectedFotos] = useState<FotoProduto[]>([]);

    async function busca() {
        if (!user) {
            return;
        }
        
        setIsLoading(true);

        try {
            const resultdata = await api.get(`/ml/anuncios`, {
                headers: { token: user.token },
            });

            if (resultdata.status === 200 && resultdata.data) {
                setData(resultdata.data);
            } else {
                setData([]);
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

    useEffect(() => {
        busca();
    }, [user, router, loading]);

    const groupedAds = useMemo(() => {
        if (!data || data.length === 0) return {};

        return data.reduce((groups, ad) => {
            const key = ad.plataforma ? ad.plataforma.toUpperCase() : 'DEFAULT';
            
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(ad);
            return groups;
        }, {} as Record<string, Anuncio[]>);
    }, [data]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleSelectProduto = (produto: Produto, fotos: FotoProduto[]) => {
        setSelectedProduto(produto);
        setSelectedFotos(fotos);
        setShowAnuncioModal(true);
    };

    const handleAnuncioSuccess = () => {
        setMsgAlert("Anúncio criado com sucesso!");
        setVisibleAlert(true);
        busca();
    };

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-100">
                <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col sm:ml-56 bg-slate-100">
            <SelectProdutoModal 
                open={showSelectProdutoModal}
                onOpenChange={setShowSelectProdutoModal}
                onSelect={handleSelectProduto}
            />

            <ModalAnuncio 
                open={showAnuncioModal}
                onOpenChange={setShowAnuncioModal}
                data={selectedProduto}
                fotos={selectedFotos}
                onSuccess={handleAnuncioSuccess}
            />

            <div className="w-full bg-white border-b border-gray-200 p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-800">
                        Gestão de Anúncios 
                    </h1>
                </div>   
                <div className="flex gap-2">
                    <Button 
                        className='bg-[#185FED] gap-2'
                        onClick={() => setShowSelectProdutoModal(true)}
                    > 
                        <Plus className="h-4 w-4" />
                        Criar Anúncio
                    </Button>
                    <Button 
                        type="button"
                        variant="outline"
                        className="shadow-sm"
                        onClick={() => router.push('/home')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                </div>
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                
                <AlertDemo content={msgAlert} title="Aviso" visible={visibleAlert} setVisible={setVisibleAlert} />

                {!isLoading && data && data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
                        <PackageSearch className="h-16 w-16 text-slate-300 mb-4"/>
                        <h3 className="text-lg font-semibold text-slate-600">Nenhum anúncio encontrado</h3>
                        <p className="text-slate-400 mb-4">Comece anunciando seus produtos nos marketplaces.</p>
                        <Button 
                            className='bg-[#185FED] gap-2'
                            onClick={() => setShowSelectProdutoModal(true)}
                        > 
                            <Plus className="h-4 w-4" />
                            Criar Primeiro Anúncio
                        </Button>
                    </div>
                )}

                {Object.entries(groupedAds).map(([platformKey, platformAds]) => {
                    const config = PLATFORM_CONFIG[platformKey] || PLATFORM_CONFIG['DEFAULT'];
                    const Icon = config.icon;

                    return (
                        <div key={platformKey} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            
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
                                    <span className="text-sm font-normal text-slate-500">
                                        ({platformAds.length} {platformAds.length === 1 ? 'anúncio' : 'anúncios'})
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6">
                                <Carousel opts={{ align: "start", loop: false }} className="w-full">
                                    <CarouselContent className="-ml-4">
                                        {platformAds.map((ad) => (
                                            <CarouselItem key={ad.id} className="pl-4 basis-4/5 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                                <Card className="h-full flex flex-col group hover:border-blue-300 transition-all duration-300">
                                                    
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
                                                        
                                                        <div className="absolute top-2 right-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                ad.ativo === 'S' 
                                                                    ? 'bg-green-100 text-green-700' 
                                                                    : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                {ad.ativo === 'S' ? 'Ativo' : 'Pausado'}
                                                            </span>
                                                        </div>
                                                    </div>

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
