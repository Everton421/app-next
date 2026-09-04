'use client'

import { User, Phone, MapPin } from "lucide-react";
import type { CadastroColumn } from "../../_components/cadastro-lista-client";

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

function formatCNPJ(cnpj: string) {
  if (!cnpj) return "-";
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export const clientesColumns: CadastroColumn<cliente>[] = [
  { key: "codigo", label: "Codigo", width: "80px" },
  {
    key: "nome",
    label: "Nome",
    render: (item) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-gray-400" />
        <div>
          <span className="text-gray-700">{item.nome}</span>
          {item.endereco && (
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {item.endereco}, {item.numero} - {item.bairro}, {item.cidade}-{item.estado}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "cnpj",
    label: "CNPJ",
    render: (item) => (
      <span className="font-mono text-sm">{formatCNPJ(item.cnpj)}</span>
    ),
  },
  {
    key: "celular",
    label: "Contato",
    render: (item) => (
      <div className="flex items-center gap-2 text-gray-600">
        <Phone className="h-4 w-4 text-gray-400" />
        {item.celular || "-"}
      </div>
    ),
  },
];