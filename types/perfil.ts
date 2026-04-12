export interface Permissao {
  codigo: number;
  descricao: string;
  modulo: string;
  id?: string;
}

export interface Perfil {
  codigo: number;
  nome: string;
  permissoes?: Permissao[];
  id?: number;
  ativo?: string;
}

export const MODULOS_LABELS: Record<string, string> = {
  produtos: "Produtos",
  clientes: "Clientes",
  pedidos: "Pedidos",
  servicos: "Serviços",
  veiculos: "Veículos",
  marcas: "Marcas",
  categorias: "Categorias",
  marketplaces: "Marketplaces",
  config: "Configurações",
  perfis: "Perfis",
};

export const PERMISSOES_POR_MODULO: Record<string, string[]> = {
  produtos: ["visualizar", "criar", "editar", "excluir"],
  clientes: ["visualizar", "criar", "editar", "excluir"],
  pedidos: ["visualizar", "criar", "editar", "excluir"],
  servicos: ["visualizar", "criar", "editar", "excluir"],
  veiculos: ["visualizar", "criar", "editar", "excluir"],
  marcas: ["visualizar", "criar", "editar", "excluir"],
  categorias: ["visualizar", "criar", "editar", "excluir"],
  marketplaces: ["visualizar", "criar", "editar", "excluir"],
  config: ["visualizar", "editar"],
  perfis: ["visualizar", "criar", "editar", "excluir"],
};