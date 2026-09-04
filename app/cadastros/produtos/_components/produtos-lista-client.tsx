'use client'

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CadastroListaClient, type CadastroColumn } from "../../_components/cadastro-lista-client";
import { ProdutosExtraFilters } from "./produtos-extra-filters";

type produto = {
  codigo: number;
  descricao: string;
  preco: number;
  estoque: number;
  ativo: "S" | "N";
  fotos?: { link: string }[];
};

const columns: CadastroColumn<produto>[] = [
  {
    key: "fotos",
    label: "Foto",
    width: "80px",
    render: (item) =>
      item.fotos && item.fotos.length > 0 ? (
        <Image
          alt={item.descricao}
          width={60}
          height={60}
          src={item.fotos[0].link}
          className="rounded-lg object-cover shadow-sm border border-gray-200"
          unoptimized
        />
      ) : (
        <div className="w-[60px] h-[60px] bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
          <span className="text-gray-400 text-xs">Sem foto</span>
        </div>
      ),
  },
  { key: "codigo", label: "Codigo", width: "80px" },
  { key: "descricao", label: "Descricao", width: "50%", className: "text-left" },
  {
    key: "preco",
    label: "Preco",
    width: "100px",
    className: "text-left",
    render: (item) => <>R$ {Number(item.preco)?.toFixed(2) || "0.00"}</>,
  },
  { key: "estoque", label: "Estoque", width: "100px", className: "text-center" },
];

export function ProdutosListaClient({ data }: { data: produto[] }) {
  const router = useRouter();
  const [marcaFiltro, setMarcaFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  return (
    <CadastroListaClient
      title="Produtos"
      entityPath="/cadastros/produtos"
      data={data}
      apiEndpoint="/produtos/search"
      columns={columns}
      extraFilterValues={{ marca: marcaFiltro, categoria: categoriaFiltro }}
      extraFilters={
        <ProdutosExtraFilters
          marcaFiltro={marcaFiltro}
          setMarcaFiltro={setMarcaFiltro}
          categoriaFiltro={categoriaFiltro}
          setCategoriaFiltro={setCategoriaFiltro}
        />
      }
      onBeforeSearch={(params) => {
        if (marcaFiltro) params.marca = marcaFiltro;
        if (categoriaFiltro) params.categoria = categoriaFiltro;
        return params;
      }}
    />
  );
}
