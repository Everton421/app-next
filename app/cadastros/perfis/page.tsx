import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/server-api";
import { CadastroListaClient } from "../_components/cadastro-lista-client";

type perfil = {
  codigo: number;
  nome: string;
  id?: number;
  ativo?: string;
};

export default async function PerfisPage() {
  const api = getServerApi();
  if (!api) redirect("/");

  let data: perfil[] = [];
  try {
    data = await api.get("/bulk/perfis");
  } catch (e) {
    console.error("Erro ao buscar perfis:", e);
  }

  const mappedData = data.map((p) => ({
    ...p,
    ativo: p.ativo ?? "S",
  }));

  return (
    <CadastroListaClient
      title="Perfis de Usuario"
      entityPath="/cadastros/perfis"
      data={mappedData}
      apiEndpoint="/bulk/perfis"
      emptyMessage="Nenhum perfil encontrado"
      columns={[
        { key: "codigo", label: "Codigo", width: "10%" },
        { key: "nome", label: "Nome", width: "75%" },
      ]}
    />
  );
}
