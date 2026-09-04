import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { MarcasFormClient } from "../_components/marcas-form-client";

type Props = { params: { codigo: string } };

export default async function EditarMarcaPage({ params }: Props) {
    const api = getServerApi();
    if (!api) redirect("/");

    let dados: any;
    try {
        const result = await api.get<any[]>("/marcas", { codigo: params.codigo });
        dados = result?.[0];
    } catch {
        dados = undefined;
    }

    if (!dados) notFound();

    return <MarcasFormClient dadosIniciais={dados} />;
}