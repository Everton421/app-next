import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/server-api";
import { CadastroListaClient } from "../_components/cadastro-lista-client";
import { servicosColumns } from "./_components/servicos-columns";

type servico = {
  codigo: number;
  aplicacao: string;
  valor: number;
  ativo: "S" | "N";
};

export default async function ServicosPage() {
  const api = getServerApi();
  if (!api) redirect("/");

  let data: servico[] = [];
  try {
    data = await api.get("/servicos/search", { ativo: "S" });
  } catch (e) {
    console.error("Erro ao buscar servicos:", e);
  }

  return (
    <CadastroListaClient
      title="Servicos"
      entityPath="/cadastros/servicos"
      data={data}
      apiEndpoint="/servicos/search"
      searchParam="aplicacao"
      columns={servicosColumns}
    />
  );
}