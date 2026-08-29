import { getServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { ProdutosFormClient } from "../_components/produtos-form-client";

export const dynamic = "force-dynamic";

export default async function NovoProdutoPage() {
    const api = getServerApi();
    if (!api) redirect("/");

    let idInicial = "";
    try {
        const data = await api.get<any>("/produtos/last-codigo");
        const ultimoCodigo = Number(
            data?.codigo ?? data?.ultimo ?? data?.last ?? (typeof data === "number" ? data : 0) ?? 0
        );
        idInicial = String((Number.isFinite(ultimoCodigo) ? ultimoCodigo : 0) + 1);
    } catch (e) {
        console.error("Erro ao buscar último código de produto:", e);
    }

    return <ProdutosFormClient dadosIniciais={null} fotosIniciais={[]} idInicial={idInicial} />;
}