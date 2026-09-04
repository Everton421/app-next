'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceAccount } from "@/app/services/marketplaceApi";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Loader2, Download, Package } from "lucide-react";
import { SelecionarContaModal } from "./selecionar-conta-modal";
import { ListaAnunciosPlataforma } from "./lista-anuncios-platforma";
///import { ListaAnunciosImportados } from "./_components/lista-anuncios-importados";

export function ConsultaClient({ contasIniciais }: { contasIniciais: MarketplaceAccount[] }) {
    const router = useRouter();

    const filteredIniciais = contasIniciais.filter((acc: MarketplaceAccount) =>
        acc.platform === 'ML' || acc.platform === 'SHOPEE' || acc.platform === 'MAGAZINE'
    );

    const [contaSelecionada, setContaSelecionada] = useState<MarketplaceAccount | null>(
        filteredIniciais.length === 1 ? filteredIniciais[0] : null
    );
    const [showSelecionarConta, setShowSelecionarConta] = useState(filteredIniciais.length > 1);
    const [refreshKey, setRefreshKey] = useState(0);

    function handleSelecionarConta(conta: MarketplaceAccount) {
        setContaSelecionada(conta);
    }

    function handleTrocarConta() {
        setShowSelecionarConta(true);
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
                    <Tabs defaultValue="marketplace" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="marketplace" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Anúncios Marketplace
                            </TabsTrigger>
                            <TabsTrigger value="importados" className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Anúncios Importados
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="marketplace">
                            <ListaAnunciosPlataforma
                                conta={contaSelecionada}
                                onTrocarConta={handleTrocarConta}
                                onImportSuccess={() => setRefreshKey(k => k + 1)}
                            />
                        </TabsContent>

                        <TabsContent value="importados">
                            {/**  <ListaAnunciosImportados
                                conta={contaSelecionada}
                                onTrocarConta={handleTrocarConta}
                                refreshKey={refreshKey}
                            />*/}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}