'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { marketplaceApi, MarketplaceAccount } from "@/app/services/marketplaceApi";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { ThreeDot } from "react-loading-indicators";
import { SelecionarContaModal } from "./_components/selecionar-conta-modal";
import { ListaAnunciosPlataforma } from "./_components/lista-anuncios-platforma";

export default function ConsultaAnunciosPage() {
    const router = useRouter();
    const { user, loading: authLoading }: any = useAuth();

    const [contaSelecionada, setContaSelecionada] = useState<MarketplaceAccount | null>(null);
    const [showSelecionarConta, setShowSelecionarConta] = useState(false);
    const [loadingContas, setLoadingContas] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.codigo) {
            buscarContaInicial();
        }
    }, [user]);

    async function buscarContaInicial() {
        setLoadingContas(true);
        try {
            const accounts = await marketplaceApi.getAccounts(user.codigo, user.token);
            const filtered = accounts.filter((acc: MarketplaceAccount) => 
                acc.platform === 'ML' || acc.platform === 'SHOPEE' || acc.platform === 'MAGAZINE'
            );

            if (filtered.length === 1) {
                setContaSelecionada(filtered[0]);
            } else if (filtered.length > 1) {
                setShowSelecionarConta(true);
            }
        } catch (error) {
            console.error("Erro ao buscar contas:", error);
        } finally {
            setLoadingContas(false);
        }
    }

    function handleSelecionarConta(conta: MarketplaceAccount) {
        setContaSelecionada(conta);
    }

    function handleTrocarConta() {
        setShowSelecionarConta(true);
    }

    if (authLoading || loadingContas) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-100">
                <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col sm:ml-56 bg-slate-100">
            <SelecionarContaModal
                open={showSelecionarConta}
                onOpenChange={setShowSelecionarConta}
                onSelect={handleSelecionarConta}
            />

            {/* Header */}
            <div className="w-full bg-white border-b border-gray-200 p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-600" />
                        Consultar Anúncios
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button 
                        type="button"
                        variant="outline"
                        className="shadow-sm"
                        onClick={() => router.push('/marketplaces')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> 
                        Voltar
                    </Button>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                {!contaSelecionada ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
                        <Search className="h-16 w-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600">
                            Selecione uma conta
                        </h3>
                        <p className="text-slate-400 mb-4">
                            Escolha qual conta deseja consultar os anúncios.
                        </p>
                        <Button 
                            className="bg-blue-600"
                            onClick={() => setShowSelecionarConta(true)}
                        >
                            Selecionar Conta
                        </Button>
                    </div>
                ) : (
                    <ListaAnunciosPlataforma
                        conta={contaSelecionada}
                        onTrocarConta={handleTrocarConta}
                    />
                )}
            </div>
        </div>
    );
}