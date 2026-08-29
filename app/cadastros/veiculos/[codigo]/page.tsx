import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { VeiculosFormClient } from "../_components/veiculos-form-client";

type Props = { params: { codigo: string } };

export default async function EditarVeiculoPage({ params }: Props) {
    const api = getServerApi();
    if (!api) redirect("/");

    let dados: any;
    try {
        const result = await api.get<any[]>("/veiculos/search", { codigo: params.codigo });
        dados = result?.[0];
    } catch {
        dados = undefined;
    }

    if (!dados) notFound();

    return <VeiculosFormClient dadosIniciais={dados} />;
}