'use client'

import type { CadastroColumn } from "../../_components/cadastro-lista-client";

type veiculo = {
  codigo: number;
  modelo: string;
  marca: string;
  placa: string;
  ano: string;
  ativo: "S" | "N";
};

export const veiculosColumns: CadastroColumn<veiculo>[] = [
  { key: "codigo", label: "Codigo", width: "5%" },
  { key: "modelo", label: "Modelo", width: "40%" },
  { key: "marca", label: "Marca", width: "15%", hiddenOnMobile: true },
  { key: "placa", label: "Placa", width: "15%" },
  { key: "ano", label: "Ano", width: "15%", hiddenOnMobile: true },
];

export function veiculosOnBeforeSearch(
  params: Record<string, any>,
  searchTerm: string
): Record<string, any> {
  if (searchTerm) {
    return {
      ...params,
      modelo: searchTerm,
      placa: searchTerm,
      marca: searchTerm,
      codigo: searchTerm,
    };
  }
  return params;
}