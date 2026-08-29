import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { ProdutosTributacaoClient } from "../../_components/produtos-tributacao-client";

type Props = { params: { codigo: string } };

export default async function TributacaoProdutoPage({ params }: Props) {
    const api = getServerApi();
    if (!api) redirect("/");

    const cod = Number(params.codigo);

    let dados: any;
    try {
        const result = await api.get<any[]>(`/produto/${cod}`);
        dados = result?.[0];
    } catch {
        dados = undefined;
    }

    if (!dados) notFound();

    return <ProdutosTributacaoClient dadosIniciais={dados} />;
}