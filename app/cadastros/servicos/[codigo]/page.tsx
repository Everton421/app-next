import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { ServicosFormClient } from "../_components/servicos-form-client";
import { basicServico } from "@/types/servico";

type Props = { params: { codigo: string } };

export default async function EditarServicoPage({ params }: Props) {
    const api = getServerApi();
    if (!api) redirect("/");

    let dados: basicServico | undefined;
    try {
        dados = await api.get<basicServico>("/servicos/search", { codigo: params.codigo });
    } catch {
        dados = undefined;
    }

    if (!dados) notFound();

    return <ServicosFormClient dadosIniciais={dados} />;
}