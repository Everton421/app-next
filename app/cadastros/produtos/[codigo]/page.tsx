import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { ProdutosFormClient } from "../_components/produtos-form-client";

type Props = { params: { codigo: string } };

export default async function EditarProdutoPage({ params }: Props) {
    const api = getServerApi();
    if (!api) redirect("/");

    const cod = Number(params.codigo);

    let dados: any;
    let fotos: any[] = [];
    try {
        [dados, fotos] = await Promise.all([
            api.get(`/produtos/${cod}`),
            api.get<any[]>("/fotos/produto", { codigo: String(cod) }),
        ]);
    } catch {
        dados = undefined;
        fotos = [];
    }

    if (!dados) notFound();

    return <ProdutosFormClient dadosIniciais={dados} fotosIniciais={fotos || []} />;
}