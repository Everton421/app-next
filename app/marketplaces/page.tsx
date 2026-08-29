import { getServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { AnunciosClient } from "./_components/anuncios-client";

export const dynamic = "force-dynamic";

export default async function AnunciosPage() {
    const api = getServerApi();
    if (!api) {
        redirect("/");
    }

    let anuncios: unknown[] = [];
    try {
        const data = await api.get<unknown[]>("/ml/app/anuncios");
        anuncios = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erro ao buscar anuncios:", error);
        anuncios = [];
    }

    return <AnunciosClient anunciosIniciais={anuncios as any[]} />;
}