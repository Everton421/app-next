type clientePedido =
{
   celular: string,
   cep: string,
   cidade: string,
   cnpj: string,
   codigo: number,
   data_cadastro: string,
   data_recadastro: string,
   endereco: string,
   ie: string,
   nome: string,
   numero: number,
   vendedor: number,
}

type Produto_pedido = 
   {
       codigo: number,
       desconto:number,
       descricao: string,
       pedido?:number,
       preco :number,
       quantidade :number,
       total :number,
   }  

   type  Servico_pedido = 
   {
       aplicacao: string ,
       codigo: number ,
       desconto: number ,
       pedido: number ,
       quantidade: number ,
       total: number ,
       valor: number ,
   }

   type pedido = {
    codigo?:number,
    id?:string,
    id_externo?:number | string,
     cliente:clientePedido,
     codigo_cliente:number,
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
type parcela = {
    pedido: number,
     parcela: number,
     valor: number,
      vencimento:string
}

type formaPagamento = {
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
