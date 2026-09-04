'use client'

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Store, ChevronRight, Download } from "lucide-react";
import { marketplaceApi, MarketplaceAccount, PLATFORM_CONFIG, Platform } from "@/app/services/marketplaceApi";
import { SelecionarContaModal } from "@/app/marketplaces/consulta/_components/selecionar-conta-modal";
import { toast } from "sonner";
import Image from "next/image";
import { DateService } from "@/lib/dateService";

interface ImportarPedidosDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ImportarPedidosDialog({ open, onOpenChange, onSuccess }: ImportarPedidosDialogProps) {
    const { user }: any = useAuth();
    const [conta, setConta] = useState<MarketplaceAccount | null>(null);
    const [showSelecionarConta, setShowSelecionarConta] = useState(false);
    const [dateCreatedFrom, setDateCreatedFrom] = useState("");
    const [dateCreatedTo, setDateCreatedTo] = useState("");
    const [importando, setImportando] = useState(false);

    function handleOpenChange(value: boolean) {
        if (importando) return;
        if (value) {
            const dateService = DateService();
            setDateCreatedFrom(dateService.obterDataAtualPrimeiroDiaDoMes());
            setDateCreatedTo(dateService.obterDataAtual());
        }
        onOpenChange(value);
    }

    function handleSelecionarConta(contaSelecionada: MarketplaceAccount) {
        setConta(contaSelecionada);
    }

    function getPlatformConfig(platform: string) {
        return PLATFORM_CONFIG[platform as Platform] || {
            label: platform,
            color: 'bg-slate-200',
            textColor: 'text-slate-700',
            icon: 'Store' as const,
            logo: undefined as string | undefined
        };
    }

    async function handleImportar() {

        if (!user?.token) return;
        if (!conta) {
            toast.warning("Selecione uma conta do marketplace.");
            return;
        }
        if (!dateCreatedFrom || !dateCreatedTo) {
            toast.warning("Informe o período (data de criação) para a consulta.");
            return;
        }
        if (dateCreatedFrom > dateCreatedTo) {
            toast.warning("A data inicial não pode ser maior que a data final.");
            return;
        }

        setImportando(true);
        try {
            const result = await marketplaceApi.syncOrders(
                user.token,
                conta.ml_user_id,
                dateCreatedFrom,
                dateCreatedTo
            );
          
            if (result.success) {
                if (result.erros && result.erros.length > 0) {
                    toast.success(`${result.processados ?? 0} pedido(s) importado(s), ${result.erros.length} com erro.`);
                } else {
                    toast.success(`${result.processados ?? 0} pedido(s) importado(s) com sucesso.`);
                }
                onSuccess();
                handleOpenChange(false);
            } else {
                toast.error(result.message || "Falha ao importar pedidos.");
            }
        } catch (error: any) {
            console.error("Erro ao importar pedidos:", error);
            const message = error?.response?.data?.message || "Não foi possível importar os pedidos. Tente novamente.";
            toast.error(message);
        } finally {
            setImportando(false);
        }
    }

    const config = conta ? getPlatformConfig(conta.platform) : null;

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-blue-600" />
                            Importar Pedidos do Marketplace
                        </DialogTitle>
                        <DialogDescription>
                            Selecione a conta e o período para importar os pedidos.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div>
                            <Label className="text-sm font-semibold text-slate-700">Conta</Label>
                            {conta ? (
                                <div className="mt-2 flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        {config?.logo ? (
                                            <Image
                                                src={config.logo}
                                                alt={config.label}
                                                width={32}
                                                height={32}
                                                className="object-contain rounded-md"
                                            />
                                        ) : (
                                            <Store className="h-5 w-5 text-slate-500" />
                                        )}
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">
                                                {conta.integration_name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {config?.label} • ID: {conta.ml_user_id}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSelecionarConta(true)}
                                    >
                                        Trocar
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-2 w-full justify-between"
                                    onClick={() => setShowSelecionarConta(true)}
                                >
                                    <span>Selecionar conta</span>
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">Data criação (de)</Label>
                                <Input
                                    type="date"
                                    value={dateCreatedFrom}
                                    onChange={(e) => setDateCreatedFrom(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">Data criação (até)</Label>
                                <Input
                                    type="date"
                                    value={dateCreatedTo}
                                    onChange={(e) => setDateCreatedTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleImportar} disabled={importando}>
                            {importando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {importando ? "Importando..." : "Importar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SelecionarContaModal
                open={showSelecionarConta}
                onOpenChange={setShowSelecionarConta}
                onSelect={handleSelecionarConta}
            />
        </>
    );
}