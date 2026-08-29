import { getServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { IntegracoesClient } from "./_components/integracoes-client";

export const dynamic = "force-dynamic";

export default async function Integracoes() {
    const api = getServerApi();
    if (!api) {
        redirect("/");
    }

    let integrations: any[] = [];
    try {
        const data = await api.get<any[]>("/ml/accounts/" + api.user.codigo);
        integrations = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erro ao buscar integrações", error);
        integrations = [];
    }

    return <IntegracoesClient integrationsInicial={integrations} />;
}