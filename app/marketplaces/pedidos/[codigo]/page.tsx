import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { EditarPedidoClient } from "../_components/editar-pedido-client";
import type { pedido } from "@/types/pedido";

export const dynamic = "force-dynamic";

type Props = { params: { codigo: string } };

export default async function EditarPedidoPage({ params }: Props) {
    const api = getServerApi();
    if (!api) redirect("/");

    const codigo_pedido = Number(params.codigo);

    let pedidoInicial: pedido | undefined;
    try {
        const headers: Record<string, string> = {};
        if (api.user.vendedor) {
            headers.vendedor = String(api.user.vendedor);
        }
        const result = await api.get<pedido[]>("/pedido", { codigo: String(codigo_pedido) }, headers);
        pedidoInicial = result?.[0];
    } catch {
        pedidoInicial = undefined;
    }

    if (!pedidoInicial) notFound();

    return <EditarPedidoClient pedidoInicial={pedidoInicial as any} codigoPedido={codigo_pedido} />;
}