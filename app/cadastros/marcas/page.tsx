import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/server-api";
import { CadastroListaClient } from "../_components/cadastro-lista-client";

type marca = {
  codigo: number;
  descricao: string;
  ativo: "S" | "N";
};

export default async function MarcasPage() {
  const api = getServerApi();
  if (!api) redirect("/");

  let data: marca[] = [];
  try {
    data = await api.get("/marcas/search", { ativo: "S" });
  } catch (e) {
    console.error("Erro ao buscar marcas:", e);
  }

  return (
    <CadastroListaClient
      title="Marcas"
      entityPath="/cadastros/marcas"
      data={data}
      apiEndpoint="/marcas/search"
      columns={[
        { key: "codigo", label: "Codigo", width: "10%" },
        { key: "descricao", label: "Descricao", width: "75%" },
      ]}
    />
  );
}
