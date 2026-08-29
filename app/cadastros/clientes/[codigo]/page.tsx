import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { ClientesFormClient } from "../_components/clientes-form-client";

type Props = { params: { codigo: string } };

export default async function EditarClientePage({ params }: Props) {
    const api = getServerApi();
    if (!api) redirect("/");

    let dados: any;
    try {
        dados = await api.get(`/clientes/${Number(params.codigo)}`);
    } catch {
        dados = undefined;
    }

    if (!dados) notFound();

    return <ClientesFormClient dadosIniciais={dados} />;
}