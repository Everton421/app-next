'use client'

import type { CadastroColumn } from "../../_components/cadastro-lista-client";

type servico = {
  codigo: number;
  aplicacao: string;
  valor: number;
  ativo: "S" | "N";
};

export const servicosColumns: CadastroColumn<servico>[] = [
  { key: "codigo", label: "Codigo", width: "10%" },
  { key: "aplicacao", label: "Aplicacao", width: "65%" },
  {
    key: "valor",
    label: "Valor",
    width: "15%",
    render: (item: servico) => (
      <>R$ {Number(item.valor)?.toFixed(2) ?? "0.00"}</>
    ),
  },
];