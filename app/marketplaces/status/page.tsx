import { getServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { StatusClient } from "./_components/status-client";

export const dynamic = "force-dynamic";

export default async function MarketplaceStatusPage() {
    const api = getServerApi();
    if (!api) {
        redirect("/");
    }

    let contas: any[] = [];
    try {
        const data = await api.get<any[]>("/ml/accounts/" + api.user.codigo);
        contas = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erro ao buscar contas:", error);
        contas = [];
    }

    const mlContas = contas.filter((acc: any) => acc.platform === 'ML');

    let statusInicial: any = null;
    if (mlContas.length === 1) {
        try {
            statusInicial = await api.get<any>(
                "/ml/tools/status_vendedor",
                undefined,
                { ml_user_id: String(mlContas[0].ml_user_id) }
            );
        } catch (error) {
            console.error("Erro ao buscar status da conta:", error);
            statusInicial = null;
        }
    }

    return <StatusClient contasIniciais={contas} statusInicial={statusInicial} />;
}