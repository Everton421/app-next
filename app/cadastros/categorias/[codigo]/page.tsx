import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { CategoriasFormClient } from "../_components/categorias-form-client";

type Props = { params: { codigo: string } };

export default async function EditarCategoriaPage({ params }: Props) {
    const api = getServerApi();
    if (!api) redirect("/");

    let dados: any;
    try {
        const result = await api.get<any[]>("/categorias", { codigo: params.codigo });
        dados = result?.[0];
    } catch {
        dados = undefined;
    }

    if (!dados) notFound();

    return <CategoriasFormClient dadosIniciais={dados} />;
}