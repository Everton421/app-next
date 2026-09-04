import { getServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DateService } from "@/lib/dateService";
import { PedidosListaClient } from "./_components/pedidos-lista-client";
import type { pedido } from "@/types/pedido";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const api = getServerApi();
  if (!api) redirect("/");

  const dateService = DateService();
  const dataFinal = dateService.obterDataAtual();
  const dataInicial = dateService.obterDataAtualPrimeiroDiaDoMes();

  let pedidos: pedido[] = [];
  try {
    pedidos = await api.get<pedido[]>("/pedidos", {
      data_inicial: dataInicial,
      data_final: dataFinal,
      vendedor: String(api.user.codigo),
      limit: "20",
    });
  } catch {
    pedidos = [];
  }

  return (
    <PedidosListaClient
      pedidosIniciais={pedidos || []}
      dataInicialInicial={dataInicial}
      dataFinalInicial={dataFinal}
      vendedor={api.user.codigo}
    />
  );
}