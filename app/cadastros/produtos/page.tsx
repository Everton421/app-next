import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/server-api";
import { ProdutosListaClient } from "./_components/produtos-lista-client";

type produto = {
  codigo: number;
  descricao: string;
  preco: number;
  estoque: number;
  ativo: "S" | "N";
  fotos?: { link: string }[];
};

export default async function ProdutosPage() {
  const api = getServerApi();
  if (!api) redirect("/");

  let data: produto[] = [];
  try {
    data = await api.get("/produtos/search", { ativo: "S" });
  } catch (e) {
    console.error("Erro ao buscar produtos:", e);
  }

  return <ProdutosListaClient data={data} />;
}
