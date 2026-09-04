import { getServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { DateService } from "@/lib/dateService";
import { NovoPedidoClient } from "../_components/novo-pedido-client";
import type { pedido, parcela } from "@/types/pedido";

export const dynamic = "force-dynamic";

export default async function NovoPedidoPage() {
    const api = getServerApi();
    if (!api) redirect("/");
    const user = api.user;

    const dateService = DateService();
    const codigoNovo = Number(`${Date.now()}${user.codigo}`);
    const dataCadastro = dateService.obterDataAtual();
    const dataRecadastro = dateService.obterDataHoraAtual();
    const parcelaGerada: parcela[] = [{ pedido: codigoNovo, parcela: 1, valor: 0, vencimento: dataCadastro }];

    let newId = "0";
    try {
        const arr = await api.get<any[]>("/pedidos", {
            vendedor: String(user.codigo),
            data: "0000-00-00 00:00:00",
        });
        if (Array.isArray(arr) && arr.length > 0) {
            const arrID = arr.map((i: any) => parseInt(String(i.id).split("-")[0] || "0", 10));
            newId = String(Math.max(...arrID) + 1).padStart(10, "0") + "-" + user.codigo;
        }
    } catch {
        newId = "0";
    }

    const dadosOrcamentoInicial: pedido = {
        codigo: codigoNovo,
        id: newId,
        id_externo: "0",
        codigo_cliente: 0,
        total_geral: 0,
        descontos: 0,
        observacoes: "",
        quantidade_parcelas: parcelaGerada.length,
        vendedor: user.codigo,
        situacao: "EA",
        tipo: 1,
        total_produtos: 0,
        total_servicos: 0,
        produtos: [],
        servicos: [],
        formas_Pagamento: 0,
        parcelas: parcelaGerada,
        veiculo: 0,
        contato: "",
        data_cadastro: dataCadastro,
        data_recadastro: dataRecadastro,
    };

    return <NovoPedidoClient dadosOrcamentoInicial={dadosOrcamentoInicial} initialNewId={newId} />;
}