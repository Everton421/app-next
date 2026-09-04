export type clientePedido =
{
   codigo: number,
   id: string,
   nome: string,
 
}

export type Produto_pedido = 
  {
         pedido: number,
         sequencia: number,
         codigo: number,
         desconto: string,
         quantidade: string,
         preco: string,
         frete: string,
         total: string,
         quantidade_separada: string,
         quantidade_faturada: string,
         descricao: string,
         id: string,
         controle_lote_serie: "S" | "N", 
         series:serie[]
      }

      type serie =  {
             lote_serie: number,
             quantidade: string,
             serie: string | null,
             lote: string | null
          }

   export type  Servico_pedido = 
   {
       aplicacao: string ,
       codigo: number ,
       desconto: number ,
       pedido: number ,
       quantidade: number ,
       total: number ,
       valor: number ,
   }

   export type pedido = {
    codigo?:number,
    id?:string,
    id_externo?:number | string,
     cliente?:clientePedido,
     marketplace: string | null
     contato:string,
     data_cadastro:string,
     data_recadastro:string,
     descontos:number,
     formas_Pagamento:number,
     observacoes:string,
     parcelas:parcela[],
     produtos:Produto_pedido[],
     quantidade_parcelas:number,
     servicos:Servico_pedido[],
     situacao:string,
     tipo:number,
     total_geral:number
     total_produtos:number
     total_servicos:number
     veiculo:number
     vendedor:number
   }
export type parcela = {
    pedido: number,
     parcela: number,
     valor: number,
      vencimento:string
}

export type formaPagamento = {
   codigo:number,
ativo:string
data_cadastro:string
data_recadastro:string
desc_maximo:number
descricao:string
id:number
intervalo:number
parcelas:number
recebimento:number
}
