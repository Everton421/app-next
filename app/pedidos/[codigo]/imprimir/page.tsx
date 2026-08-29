import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { ImprimirActions } from "../../_components/imprimir-actions";
import type { pedido } from "@/types/pedido";

export const dynamic = "force-dynamic";

type Props = { params: { codigo: string } };

export default async function ImprimirPedidoPage({ params }: Props) {
  const api = getServerApi();
  if (!api) redirect("/");

  const codigo = String(Number(params.codigo));

  let pedidoData: pedido | undefined;
  try {
    const headers: Record<string, string> = {};
    if (api.user.vendedor) {
      headers.vendedor = String(api.user.vendedor);
    }
    const result = await api.get<pedido[]>("/pedido", { codigo }, headers);
    pedidoData = result?.[0];
  } catch {
    pedidoData = undefined;
  }

  if (!pedidoData) notFound();

  return (
    <div className="p-4 print:p-0 max-w-2xl mx-auto font-sans">
      <ImprimirActions />

      {/* --- Conteúdo do Pedido para Impressão --- */}
      <div className="border border-gray-300 p-4 rounded">
        <div className="flex justify-between">
          <h1 className="text-base font-bold mb-4 text-center">Pedido #{pedidoData.id && pedidoData.id}</h1>
          <h1 className="text-base font-bold mb-4 text-center">Código externo #{pedidoData.id_externo && pedidoData.id_externo}</h1>
        </div>

        <div className="grid grid-cols-2 gap-x-4 mb-4">
          <div><strong>Cliente:</strong> {pedidoData.cliente?.nome}</div>
          <div><strong>Data:</strong> {pedidoData.data_cadastro}</div>
          <div><strong>Endereco:</strong> {pedidoData.cliente?.endereco}</div>
          <div><strong>Numero:</strong> {pedidoData.cliente?.numero}</div>
          <div><strong>Celular:</strong> {pedidoData.cliente?.celular}</div>

          <div><strong>Vendedor:</strong> {pedidoData.vendedor}</div>
        </div>

        <hr className="my-4" />

        <h2 className="text-xl font-semibold mb-2">Produtos </h2>
        <table className="w-full text-sm border-collapse border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1 text-left">Cód.</th>
              <th className="border border-gray-300 p-1 text-left">Descrição</th>
              <th className="border border-gray-300 p-1 text-right">Qtd.</th>
              <th className="border border-gray-300 p-1 text-right">Vlr. Unit.</th>
              <th className="border border-gray-300 p-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedidoData.produtos &&
              pedidoData.produtos?.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-1">{item.codigo}</td>
                  <td className="border border-gray-300 p-1">{item.descricao}</td>
                  <td className="border border-gray-300 p-1 text-right">{item.quantidade}</td>
                  <td className="border border-gray-300 p-1 text-right">R$ {item.preco?.toFixed(2)}</td>
                  <td className="border border-gray-300 p-1 text-right">R$ {item.total?.toFixed(2)}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <hr className="my-4" />
        {pedidoData.servicos && pedidoData.servicos.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Serviços </h2>
            <table className="w-full text-sm border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-1 text-left">Cód.</th>
                  <th className="border border-gray-300 p-1 text-left">Descrição</th>
                  <th className="border border-gray-300 p-1 text-right">Qtd.</th>
                  <th className="border border-gray-300 p-1 text-right">Vlr. Unit.</th>
                  <th className="border border-gray-300 p-1 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedidoData.servicos?.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-1">{item.codigo}</td>
                    <td className="border border-gray-300 p-1">{item.aplicacao}</td>
                    <td className="border border-gray-300 p-1 text-right">{item.quantidade}</td>
                    <td className="border border-gray-300 p-1 text-right">R$ {item.valor?.toFixed(2)}</td>
                    <td className="border border-gray-300 p-1 text-right">R$ {item.total?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <hr className="my-4" />
        {pedidoData.parcelas && pedidoData.parcelas.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-2">Parcelas </h2>
            <table className="w-full text-sm border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-1 text-left">Parcela</th>
                  <th className="border border-gray-300 p-1 text-right">Valor.</th>
                  <th className="border border-gray-300 p-1 text-right">Vencimento</th>
                </tr>
              </thead>
              <tbody>
                {pedidoData.parcelas?.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-1">{item.parcela}</td>
                    <td className="border border-gray-300 p-1 text-right">R$ {item.valor?.toFixed(2)}</td>
                    <td className="border border-gray-300 p-1 text-right">R$ {item.vencimento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {pedidoData.observacoes && (
          <div className="mb-4">
            <h3 className="font-semibold">Observações:</h3>
            <p className="text-sm whitespace-pre-wrap">{pedidoData.observacoes}</p>
          </div>
        )}

        <div className="text-right font-bold text-lg">
          Total Geral: R$ {pedidoData.total_geral?.toFixed(2)}
        </div>

      </div>
    </div>
  );
}