import { redirect } from "next/navigation";
import { HomeClient, type DashboardData } from "./home-client";
import { DateService } from "@/lib/dateService";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type PedidoRecenteRaw = {
  id: string;
  id_externo: string;
  nome: string;
  total_geral: string;
  situacao: string;
};

type VendaPorDiaRaw = {
  data_cadastro: string;
  total: string;
};

type TotaisRaw = {
  total_faturado?: string;
  quantidade_pedidos?: string;
  media_pedidos?: string;
  novos_clientes?: string;
};

export default async function Home() {
  const { getServerApi } = await import("@/lib/server-api");
  const api = getServerApi();

  if (!api) redirect("/");

  const user = api.user;
  const dateService = DateService();
  const params = new URLSearchParams({ vendedor: String(user.codigo) });

  let dashboardData: DashboardData | null = null;

  try {
    const [totais, vendasPorDia, pedidosRecentes]: [TotaisRaw[], VendaPorDiaRaw[], PedidoRecenteRaw[]] = await Promise.all([
      api.get<TotaisRaw[]>("/pedidos/totais", Object.fromEntries(params)),
      api.get<VendaPorDiaRaw[]>("/pedidos/totais-por-data", Object.fromEntries(params)),
      api.get<PedidoRecenteRaw[]>("/pedidos/ultimos", Object.fromEntries(params)),
    ]);

    const primeiro = totais[0] || {};

    dashboardData = {
      faturamentoTotal: parseFloat(primeiro.total_faturado || "0"),
      totalPedidos: parseInt(primeiro.quantidade_pedidos || "0"),
      ticketMedio: parseFloat(primeiro.media_pedidos || "0"),
      novosClientes: parseInt(primeiro.novos_clientes || "0"),
      vendasPorDia: vendasPorDia.map((venda) => ({
        date: dateService.formatarData(venda.data_cadastro),
        total: parseFloat(venda.total),
      })),
      pedidosRecentes: pedidosRecentes.map((pedido) => ({
        id: pedido.id,
        id_externo: pedido.id_externo,
        cliente: { nome: pedido.nome || "Cliente não identificado" },
        valor_total: parseFloat(pedido.total_geral),
        situacao: pedido.situacao as DashboardData["pedidosRecentes"][number]["situacao"],
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
  }

  return (
    <HomeClient
      user={{ nome: user.nome }}
      initialData={dashboardData}
    />
  );
}
