import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/server-api";
import { CadastroListaClient } from "../_components/cadastro-lista-client";

type categoria = {
  codigo: number;
  descricao: string;
  ativo: "S" | "N";
};

export default async function CategoriasPage() {
  const api = getServerApi();
  if (!api) redirect("/");

  let data: categoria[] = [];
  try {
    data = await api.get("/categorias/search", { ativo: "S" });
  } catch (e) {
    console.error("Erro ao buscar categorias:", e);
  }

  return (
    <CadastroListaClient
      title="Categorias"
      entityPath="/cadastros/categorias"
      data={data}
      apiEndpoint="/categorias/search"
      columns={[
        { key: "codigo", label: "Codigo", width: "10%" },
        { key: "descricao", label: "Descricao", width: "75%" },
      ]}
    />
  );
}
