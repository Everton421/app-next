import { getServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { ConsultaClient } from "./_components/consulta-client";

export const dynamic = "force-dynamic";

export default async function ConsultaAnunciosPage() {
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

    return <ConsultaClient contasIniciais={contas} />;
}