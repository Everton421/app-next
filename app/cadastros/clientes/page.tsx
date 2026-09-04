import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/server-api";
import { CadastroListaClient } from "../_components/cadastro-lista-client";
import { clientesColumns } from "./_components/clientes-columns";

type cliente = {
  codigo: number;
  nome: string;
  cnpj: string;
  celular: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  ativo: "S" | "N";
};

export default async function ClientesPage() {
  const api = getServerApi();
  if (!api) redirect("/");

  let data: cliente[] = [];
  try {
    data = await api.get("/clientes/search", { ativo: "S" });
  } catch (e) {
    console.error("Erro ao buscar clientes:", e);
  }

  return (
    <CadastroListaClient
      title="Clientes"
      entityPath="/cadastros/clientes"
      data={data}
      apiEndpoint="/clientes/search"
      searchParam="nome"
      columns={clientesColumns}
    />
  );
}