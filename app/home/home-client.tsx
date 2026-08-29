'use client'

import { ClipboardList, DollarSign, Package, PlusCircle, Users, TrendingUp, UserPlus, X, Check, CheckCheck, ClipboardCheck, ClipboardPenLine, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";
import { ThreeDot } from "react-loading-indicators";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartOverView } from "@/components/chart";
import { cn } from "@/lib/utils";

type VendasPorDia = {
    date: string;
    total: number;
}

type PedidoRecente = {
    id: string;
    id_externo: string;
    cliente: { nome: string };
    valor_total: number;
    situacao: 'EA' | 'RE' | 'AI' | 'FP' | 'FI';
}

export type DashboardData = {
    faturamentoTotal: number;
    totalPedidos: number;
    ticketMedio: number;
    novosClientes: number;
    vendasPorDia: VendasPorDia[];
    pedidosRecentes: PedidoRecente[];
}

const KpiCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendValue
}: {
    title: string;
    value: string;
    icon: React.ElementType;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}) => (
    <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {(description || trendValue) && (
                <div className="mt-1 flex items-center gap-2">
                    {trend && trendValue && (
                        <span className={cn(
                            "flex items-center text-xs font-medium",
                            trend === 'up' ? "text-emerald-600" : trend === 'down' ? "text-red-600" : "text-muted-foreground"
                        )}>
                            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
                            {trendValue}
                        </span>
                    )}
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            )}
        </CardContent>
    </Card>
)

const StatusBadge = ({ situacao }: { situacao: string }) => {
    const statusConfig: Record<string, { icon: React.ElementType; bg: string; label: string }> = {
        'RE': { icon: X, bg: 'bg-red-100 text-red-700', label: 'Rejeitado' },
        'EA': { icon: Check, bg: 'bg-emerald-100 text-emerald-700', label: 'Aprovado' },
        'AI': { icon: CheckCheck, bg: 'bg-blue-100 text-blue-700', label: 'Em Análise' },
        'FI': { icon: ClipboardCheck, bg: 'bg-orange-100 text-orange-700', label: 'Finalizado' },
        'FP': { icon: ClipboardPenLine, bg: 'bg-sky-100 text-sky-700', label: 'Faturado' },
    };

    const config = statusConfig[situacao] || statusConfig['EA'];
    const Icon = config.icon;

    return (
        <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", config.bg)}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </div>
    );
};

export function HomeClient({ user, initialData }: { user: { nome: string }; initialData: DashboardData | null }) {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-secondary/30 sm:ml-56">
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                Olá, {user.nome}
                            </h1>
                            <p className="text-muted-foreground">
                                Confira o resumo das suas vendas hoje
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={() => router.push('/pedidos/novo')} className="gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Novo Pedido
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/cadastros/clientes')} className="gap-2">
                                <Users className="h-4 w-4" />
                                Clientes
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/cadastros/produtos')} className="gap-2">
                                <Package className="h-4 w-4" />
                                Produtos
                            </Button>
                        </div>
                    </div>
                </div>

                {initialData ? (
                    <div className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <KpiCard
                                title="Faturamento Total"
                                value={initialData.faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                icon={DollarSign}
                                trend="up"
                                trendValue="+12.5%"
                                description="vs mês anterior"
                            />
                            <KpiCard
                                title="Pedidos Realizados"
                                value={initialData.totalPedidos.toString()}
                                icon={ClipboardList}
                                trend="up"
                                trendValue="+8.2%"
                                description="vs mês anterior"
                            />
                            <KpiCard
                                title="Ticket Médio"
                                value={initialData.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                icon={TrendingUp}
                                trend="neutral"
                                trendValue="+2.1%"
                                description="vs mês anterior"
                            />
                            <KpiCard
                                title="Novos Clientes"
                                value={initialData.novosClientes.toString()}
                                icon={UserPlus}
                                trend="up"
                                trendValue="+15.3%"
                                description="vs mês anterior"
                            />
                        </div>

                        {/* Charts and Recent Orders */}
                        <div className="grid gap-6 lg:grid-cols-7">
                            {/* Chart */}
                            <Card className="lg:col-span-4">
                                <CardHeader>
                                    <CardTitle>Visão Geral das Vendas</CardTitle>
                                    <CardDescription>
                                        Vendas diárias no período selecionado
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartOverView />
                                </CardContent>
                            </Card>

                            {/* Recent Orders */}
                            <Card className="lg:col-span-3">
                                <CardHeader>
                                    <CardTitle>Pedidos Recentes</CardTitle>
                                    <CardDescription>
                                        Os últimos pedidos realizados
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {initialData.pedidosRecentes.length === 0 ? (
                                            <p className="text-center text-sm text-muted-foreground py-8">
                                                Nenhum pedido recente encontrado
                                            </p>
                                        ) : (
                                            initialData.pedidosRecentes.map((pedido) => (
                                                <div
                                                    key={pedido.id}
                                                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">
                                                            {pedido.cliente.nome}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-muted-foreground">
                                                                #{pedido.id}
                                                            </span>
                                                            {pedido.id_externo && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    Ext: {pedido.id_externo}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="font-semibold">
                                                            {pedido.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </span>
                                                        <StatusBadge situacao={pedido.situacao} />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <Card className="p-12">
                        <div className="text-center">
                            <p className="text-muted-foreground">
                                Não foi possível carregar os dados do dashboard.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => window.location.reload()}
                            >
                                Tentar novamente
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </main>
    );
}
