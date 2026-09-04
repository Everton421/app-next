'use client';
import { useState, useEffect } from "react";
import { marketplaceApi, MarketplaceAccount, PLATFORM_CONFIG, Platform } from "@/app/services/marketplaceApi";
import { useAuth } from "@/contexts/AuthContext";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Store, ShoppingBag, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SelecionarContaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (conta: MarketplaceAccount) => void;
}

const ICONS = {
    Store,
    ShoppingBag
};

export function SelecionarContaModal({ open, onOpenChange, onSelect }: SelecionarContaModalProps) {
    const { user }: any = useAuth();
    const [contas, setContas] = useState<MarketplaceAccount[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && user?.codigo) {
            fetchContas();
        }
    }, [open, user]);

    async function fetchContas() {
        setIsLoading(true);
        try {
            const accounts = await marketplaceApi.getAccounts(user.codigo, user.token);
            const filtered = accounts.filter((acc: MarketplaceAccount) => 
                acc.platform === 'ML' || acc.platform === 'SHOPEE' || acc.platform === 'MAGAZINE'
            );
            setContas(accounts);
        } catch (error) {
            console.error("Erro ao buscar contas:", error);
            setContas([]);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSelect(conta: MarketplaceAccount) {
        onSelect(conta);
        onOpenChange(false);
    }

    function getPlatformConfig(platform: string) {
        const config = PLATFORM_CONFIG[platform as Platform];
        if (config) return config;
        
        return {
            label: platform,
            color: 'bg-slate-200',
            textColor: 'text-slate-700',
            icon: 'Store' as const,
            logo: undefined as string | undefined
        };
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Selecionar Conta
                    </DialogTitle>
                    <DialogDescription>
                        Escolha qual conta deseja consultar os anúncios.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : contas.length > 0 ? (
                    <div className="grid gap-3 py-4">
                        {contas.map((conta) => {
                            const config = getPlatformConfig(conta.platform);
                            const IconComponent = ICONS[config.icon as keyof typeof ICONS] || Store;

                            return (
                                <button
                                    key={conta.id}
                                    onClick={() => handleSelect(conta)}
                                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        {config.logo ? (
                                            <Image 
                                                src={config.logo} 
                                                alt={config.label}
                                                width={40}
                                                height={40}
                                                className="object-contain rounded-md"
                                            />
                                        ) : (
                                            <div className={cn("p-2 rounded-full", config.color, config.textColor)}>
                                                <IconComponent size={20} />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {conta.integration_name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {config.label} • ID: {conta.ml_user_id}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-blue-500" />
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <Store className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <p>Nenhuma integração encontrada.</p>
                        <p className="text-sm mt-1">Configure uma conta em Configurações.</p>
                        <Button variant="link" className="mt-2" onClick={() => window.location.href = '/marketplaces'}>
                            Ir para Marketplaces
                        </Button>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}