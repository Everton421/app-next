import { getServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { CaracteristicasClient } from "./_components/caracteristicas-client";

export const dynamic = "force-dynamic";

export default async function Caracteristicas() {
    const api = getServerApi();
    if (!api) {
        redirect("/");
    }

    let dadosIniciais: any[] = [];
    try {
        const data = await api.get<any[]>("/caracteristicas/search", { descricao: "", ativo: "S" });
        dadosIniciais = Array.isArray(data) ? data : [];
    } catch (e) {
        console.error(e);
        dadosIniciais = [];
    }

    return <CaracteristicasClient dadosIniciais={dadosIniciais} />;
}