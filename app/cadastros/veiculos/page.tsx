import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/server-api";
import { CadastroListaClient } from "../_components/cadastro-lista-client";
import { veiculosColumns, veiculosOnBeforeSearch } from "./_components/veiculos-config";

type veiculo = {
  codigo: number;
  modelo: string;
  marca: string;
  placa: string;
  ano: string;
  ativo: "S" | "N";
};

export default async function VeiculosPage() {
  const api = getServerApi();
  if (!api) redirect("/");

  let data: veiculo[] = [];
  try {
    data = await api.get("/veiculos/search", { ativo: "S" });
  } catch (e) {
    console.error("Erro ao buscar veiculos:", e);
  }

  return (
    <CadastroListaClient
      title="Veiculos"
      entityPath="/cadastros/veiculos"
      data={data}
      apiEndpoint="/veiculos/search"
      searchParam="modelo"
      columns={veiculosColumns}
      onBeforeSearch={veiculosOnBeforeSearch}
    />
  );
}