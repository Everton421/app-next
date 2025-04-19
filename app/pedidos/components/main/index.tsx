 

'use client'
 
import { useCallback, useEffect, useState } from "react";
import ListaProdutos from "../produtos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ListaClientes from "../clientes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListaServicos from "../servicos"; 
import Parcelas from "../parcelas";  
import {   configApi } from "@/app/services/api";
 
import Detalhes from "../detalhes";
import { useRouter } from 'next/navigation'
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Terminal } from "lucide-react";
import { SelectFormasPagamento } from "../selectFormasPagamento";
import { Veiculos } from "../veiculos";
import { useAuth } from "@/contexts/AuthContext";
import { headers } from "next/headers";
import { TipoPedidoSeletor } from "../tipoPedido";

export default function MainPedido( { codigo_pedido}:any ){

 
   const { user, loading } = useAuth();
   const router = useRouter();
 
   useEffect(() => {
     if (!loading) {
       if (!user) {
         router.push('/'); // Redireciona para a página de login (ajuste se for outra)
       }
     }
   }, [user, loading, router]);
 
 
   if (loading) {
     return (
       <div className="flex justify-center items-center h-screen">
          <p>Verificando autenticação...</p>
       </div>
     );
   }
 
   if (!user) {
     return (
        <div className="flex justify-center items-center h-screen">
           <p>Redirecionando para login...</p>
        </div>
     );
   }
    const  [ produtosSelecionados, setProdutosSelecionados  ] = useState<any>([]);
    const  [ servicosSelecionados, setServicosSelecionados  ] = useState ([]);
    const  [ clienteSelecionado, setClienteSelecionado ] = useState<any>({});
    const  [ total , setTotal ] = useState(0);
    const  [ totalProdutos , setTotalProdutos ] = useState(0);
    const  [ totalServicos , setTotalServicos ] = useState(0);
    const  [ orcamento , setOrcamento ] = useState({});
    const  [ dadosOrcamento, setDadosOrcamento ] = useState();
    const  [ parcelas, setParcelas ] = useState();
    const  [ situacao, setSituacao  ] = useState();

    const  [ observacoes, setObservacoes ] = useState<string>()
    const  [ visibleAlertQtdProdutos ,setVisibleAlertQtdProdutos ] = useState<boolean>( false );
    const [visibleAlertPrice, setVisibleAlertPrice] = useState(false);
    const [ codigoNovoPedido, setCodigoNovoPedido ] = useState();
    const [ formaSelecionada , setFormaSelecionada] = useState();
 

    const [ codigoForma , setCodigoForma] = useState<number>(0);

        

 const api = configApi();

    type cliente =
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


    // funções dos produtos/servicos
{/*************************************************** */}

function dataHoraAtual ( ) {
    const dataAtual = new Date();
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const ano = dataAtual.getFullYear();
    
    const hora = dataAtual.getHours()
    const min = dataAtual.getMinutes()
    const sec = dataAtual.getSeconds()
    
    return `${ano}-${mes}-${dia} ${hora}:${min}:${sec}` ;
}

function dataAtual() {
    const dataAtual = new Date();
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const ano = dataAtual.getFullYear();
    return `${ano}-${mes}-${dia}`;
}


      const selecionarItens =   ( i:Produto_pedido )=>{
                if(i){
                    i.quantidade = 1 
                    if(!i.preco) i.preco = 0.00;

                    let v = produtosSelecionados.some((p:Produto_pedido)=> p.codigo === i.codigo )
                    if(v){
                        console.log(`produto ${i.codigo} ja foi adicionado`)
                        return 
                    }
                    setProdutosSelecionados( ( prev:Produto_pedido[] ) => [...prev, i])
                    //console.log(produtosSelecionados)
                }
        
            }

      const selecionarServicos =    (i:Servico_pedido)=>{
                if(i){
                    i.quantidade = 1 
                    if(!i.valor) i.valor = 0.00;

                    let v = servicosSelecionados.some((p:Servico_pedido)=> p.codigo === i.codigo )
                    if(v){
                        console.log(`servicos ${i.codigo} ja foi adicionado`)
                        return 
                    }
                    setServicosSelecionados( (prev:Servico_pedido[]) => [...prev, i])
                    console.log(servicosSelecionados)
                }
            }
        
       
      const handleIncrement = (item:Produto_pedido, quantidade:number ) => {
        if(   isNaN(quantidade) ){
            console.log("é necessario informar uma quantidade valida")
            quantidade = 1
        }


        setProdutosSelecionados((prevSelectedItems:Produto_pedido[]) => {
            return prevSelectedItems.map((i) => {
                if (i.codigo === item.codigo) {
                return { ...i, quantidade:  quantidade , total: ( quantidade * i.preco ) };
                }
                return i;
            });
            });
      };

      const handleIncrementServices = (item:Produto_pedido, quantidade:number ) => {
        if( !quantidade  || isNaN(quantidade )){
            quantidade = 0
        }
        setServicosSelecionados((prevSelectedItems:Produto_pedido[]) => {
            return prevSelectedItems.map((i) => {
                if (i.codigo === item.codigo) {
                return { ...i, quantidade: quantidade,  };
                }
                return i;
            });
            });
      };

      const handlePrice = (item:Produto_pedido, preco:any) => {

          const price = parseFloat(preco);
        setProdutosSelecionados((prevSelectedItems:Produto_pedido[]) => {
            
            if (isNaN(price) || price < 0) {
                setVisibleAlertPrice(true);
            } else {
                setVisibleAlertPrice(false);
                item.preco = price; // ou a lógica que você usa para atualizar o preço
            }


            return prevSelectedItems.map((i) => {
                if (i.codigo === item.codigo) {
                  return { ...i, preco:   price    };
                }
            return i;
          });
        });
      };

      const handlePriceServices = (item:Servico_pedido, valor:number) => {
        setServicosSelecionados((prevSelectedItems:Servico_pedido[]) => {
            
            let auxPreco =     isNaN(valor) ?  0 : valor  

            return prevSelectedItems.map((i) => {
                if (i.codigo === item.codigo) {
                  return { ...i, valor:   auxPreco    };
                }
            return i;
          });
        });
      };

      const deleteItem = (item:Produto_pedido ) => {
        setProdutosSelecionados((prevSelectedItems:Produto_pedido[]) => {
            const index = prevSelectedItems.findIndex(i => i.codigo === item.codigo);
            if (index !== -1) {
              return prevSelectedItems.filter(i => i.codigo !== item.codigo);
            } else {
              return [...prevSelectedItems, { ...item, quantidade: 1, desconto: 0 }];
            }
                 }
             )
       }

       const deleteServico = (item:Servico_pedido ) => {
        setServicosSelecionados((prevSelectedItems:Servico_pedido[]) => {
            const index = prevSelectedItems.findIndex(i => i.codigo === item.codigo);
            if (index !== -1) {
              return prevSelectedItems.filter(i => i.codigo !== item.codigo);
            } else {
              return [...prevSelectedItems, { ...item, quantidade: 1, desconto: 0 }];
            }
                 }
             )
       } 

       function gerarCodigo(  vendedor:number ){
            let codigo = Date.now() 
            let aux = `${String(codigo)}`+`${vendedor}`  
            return aux
       }
       
       function gerarParcelaUnica( total,codigoPedido ){
        const aux = [{ pedido: codigoPedido, parcela: 1, valor: total, vencimento: dataAtual() }];
        console.log(aux)
          return aux 
      }

      function gerarParcelas(forma, total, codigo_pedido) {
    
        const intervalo = forma?.intervalo;
        const numParcelas = forma?.parcelas;
        const valorParcela = total / numParcelas;
        const dataBase = new Date(); // Usar a data atual como base
        const novasParcelas = [];
    
        for (let i = 1; i <= numParcelas; i++) {
          // Clonar a data base para evitar modificações acidentais
          const vencimento = new Date(dataBase);
    
          // Adicionar o intervalo (em dias) à data de vencimento
          vencimento.setDate(dataBase.getDate() + (intervalo * (i - 1)));
    
          // Formatar a data de vencimento para 'YYYY-MM-DD'
          const ano = vencimento.getFullYear();
          const mes = String(vencimento.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
          const dia = String(vencimento.getDate()).padStart(2, '0');
          const dataFormatada = `${ano}-${mes}-${dia}`;
    
          novasParcelas.push({
            pedido: codigo_pedido,
            parcela: i,
            valor: valorParcela,
            vencimento: dataFormatada,
          });
        }
    

        return novasParcelas;
      }
   
      function handleVeic   (veic:any) {
        setDadosOrcamento(
            (prev)=>{
                return { ...prev, veiculo:veic.codigo}
            }
        )
      }
      function handleType   (tipo:any) {
        setDadosOrcamento(
            (prev)=>{
                return { ...prev, tipo:tipo}
            }
        )
      }
      async function gravar (){
        if( dadosOrcamento.parcelas.length === 0 ){
            const aux = [{ pedido: dadosOrcamento.codigo ,parcela: 1, valor: total, vencimento: dataAtual() }];
            dadosOrcamento.parcelas = aux;
            setParcelas(aux);
        }
        dadosOrcamento.data_recadastro = dataHoraAtual();
        console.log([dadosOrcamento])

          
            if( !dadosOrcamento.cliente.codigo){
                console.log("é necessario informar o cliente")
                return
            }

               // console.log(dadosOrcamento)
              try{
                  let response = await api.post('/pedidos', [ dadosOrcamento] ,
                   { 
                     headers: { cnpj: Number(user.cnpj) }
                   }
                    );
 
                     if( response.status === 200 ){
                         console.log(response.data)
                             router.push('/pedidos')
                     }
                     
             }catch(e){
                 console.log(` Erro ao enviar o orcamento `+ e )
             }
        }

{/*************************************************** */}

 ////////////////////////
useEffect(()=>{
    async function filtro(){
       
        if( codigo_pedido !== null ){
            try{    
                const response = await api.get(`/pedido`,
                    {
                        params:{ codigo: codigo_pedido  },
                        headers:{
                             vendedor: user.vendedor ,
                             cnpj: Number( user.cnpj)   
                        }
                    }
                ) 
                if(response.status === 200 && response.data ){
                    console.log(response.data)
                    setDadosOrcamento(response.data[0])
            
                    if (response.data[0].servicos) {
                        setServicosSelecionados(response.data[0].servicos);
                    }
                    if (response.data[0].produtos) {
                        setProdutosSelecionados(response.data[0].produtos);
                    }
                    if (response.data[0].cliente) {
                        setClienteSelecionado(response.data[0].cliente);
                    }
                    if (response.data[0].parcelas) {
                        setParcelas(response.data[0].parcelas);
                    }
            
                    if( response.data[0].observacoes ){
                        setObservacoes( response.data[0].observacoes )
                    }
                    if( response.data[0].situacao ){
                        setSituacao(response.data[0].situacao);
                    }
                    if( response.data[0].codigo_site ){
                        dadosOrcamento.codigo = response.data[0].codigo_site
                    }
                    if( response.data[0].forma_pagamento){
                        setCodigoForma(response.data[0].forma_pagamento)
                    }
                    
                    //console.log( response.data[0] )
                }
              }catch(e){console.log(e)}
        }

        console.log(' useEffect  CARREGANDO PEDIDO', )
    }

    filtro()

},[ codigo_pedido ])
 ////////////////////////
  
 ////////////////////////

useEffect(
    ()=>{
        if( codigo_pedido === null){
            let aux = gerarCodigo(110);
            setCodigoNovoPedido(aux)
            let data_cadastro = dataAtual();

            let data_recadastro = dataHoraAtual();

            let parcelaGerada = gerarParcelaUnica(0,aux);

            setDadosOrcamento(
                ( prev )=>({
                    ...prev,
                    total_geral:0,
                    descontos:0,
                    observacoes:'',
                    quantidade_parcelas: parcelaGerada.length,
                    vendedor: user.vendedor ,
                    situacao:'EA' ,
                    tipo: 1,
                    total_produtos: 0,
                    total_servicos: 0,
                    produtos:[],
                    formas_Pagamento:0,
                    parcelas: gerarParcelaUnica(0,aux),
                    veiculo: 0,
                    contato: '',
                    codigo:aux,
                    data_cadastro: data_cadastro,
                    data_recadastro: data_recadastro

                })
            )
        }
    },[])
 ////////////////////////
 
  
 ////////////////////////
 useEffect(
     ()=>{
         function ajusteTotais(){
             let totalProdutos = 0;
             let totalServicos = 0; 
             let totalGeral = 0; 
             
             produtosSelecionados.forEach( (p)=>{
                 totalProdutos += p.quantidade * p.preco 
             })
             
             servicosSelecionados.forEach( (s)=>{
                 totalServicos += s.quantidade * s.valor 
             })
             setTotalProdutos(totalProdutos)
             setTotalServicos(totalServicos)
         
             totalGeral = totalProdutos + totalServicos
             setTotal(totalGeral)
         
            
              let novasParcelas;
 
             if(codigo_pedido !== null ){
                if( dadosOrcamento?.total_geral !== totalGeral){
                     novasParcelas = gerarParcelaUnica(totalGeral, codigoNovoPedido)

                }else{

                    novasParcelas = dadosOrcamento?.parcelas
                }
               
            }

            setDadosOrcamento(
                (prev)=>({
                    ...prev, 
                    cliente:clienteSelecionado,
                    codigo_cliente: clienteSelecionado?.codigo,
                    total_produtos:totalProdutos,
                    total_servicos:totalServicos,
                    produtos: produtosSelecionados,
                    servicos:servicosSelecionados,
                    total_geral: totalGeral,
                    quantidade_parcelas: novasParcelas?.length,
                    observacoes:observacoes,
                    situacao: situacao,
                    parcelas: novasParcelas
                }) 
          )

         }

     ajusteTotais();
     
     },  [  produtosSelecionados , servicosSelecionados, clienteSelecionado , observacoes, situacao])
 
    ////////////////////////
    useEffect(()=>{

        //  console.log(' forma selecionada :: ',formaSelecionada)
        if( codigo_pedido !== null ){
        let aux =  gerarParcelas(formaSelecionada, total,codigo_pedido )
          setDadosOrcamento(
              (prev)=>({
                  ...prev,
                     quantidade_parcelas: aux.length,
                     parcelas:aux
                    })
                )
        }else{
            let aux =  gerarParcelas(formaSelecionada, total,codigoNovoPedido )
            setDadosOrcamento(
                (prev)=>({
                    ...prev,
                       quantidade_parcelas: aux.length,
                       parcelas:aux
                      })
                  )
        }


    },[ formaSelecionada ])
    ////////////////////////

   
 
 if (codigo_pedido !== null && !dadosOrcamento) {
    return <div className=" min-h-screen flex  flex-col  sm:ml-14 p-4    bg-slate-100"  >
          < span className=" text-gray-500 font-bold text-2xl">
            Carregando...
          </span>
      </div>; // Ou algum outro indicador de carregamento
}


return(
        <div className="  min-h-screen sm:ml-14 p-4   w-full     bg-gray-100  ">

        <div className="flex justify-between w-4/5">
         {    codigo_pedido ? 
                            <span className="text-xl m-3  font-sans font-bold  ">
                                Editando Pedido: {codigo_pedido}
                            </span>       
                                       :
                          <span className="text-2xl m-3  font-sans font-bold  ">
                                Novo Pedido 
                            </span>     
                      }
                      <Button variant="outline" onClick={() => router.push('/pedidos')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                        </Button>
        </div>
                   
                
             <div className="w-full   flex justify-start items-center">
                  <div className="w-6/12 flex " >
                    <span className="text-2xl m-3  font-sans font-bold  ">
                        Cliente
                    </span>       
                
                   <ListaClientes selecionarCliente={setClienteSelecionado}/>

                   <TipoPedidoSeletor setTipo={handleType}  tipo={dadosOrcamento?.tipo} />
                   
                   </div>
            </div>
 

            <div className=" w-3/4 shadow-md  rounded-xl">
               <Table className=" ">
                   <TableBody>
                       <TableRow className="bg-white rounded-3 shadow- ">
                           <TableCell   >
                               <span className="font-bold text-gray-600"> Codigo:  { clienteSelecionado?.codigo }</span>
                           </TableCell>
                           <TableCell >
                               <span className="font-bold text-gray-600"> nome: { clienteSelecionado?.nome } </span>
                           </TableCell>
                           <TableCell >
                           <span className="font-bold text-gray-600"> cnpj/cpf : { clienteSelecionado?.cnpj}</span>
                           </TableCell>
                           <TableCell >
                           <span className="font-bold text-gray-600"> cidade : { clienteSelecionado?.cidade }</span>
                           </TableCell>
                           <TableCell >
                                  <span className="font-bold text-gray-600"> celular : { clienteSelecionado?.celular  }</span>
                           </TableCell>
                       </TableRow>
                   </TableBody>
               </Table>
               </div>


 
            <div className="w-full mt-4 flex justify-center items-center">
                <div className="w-11/12">
                  <hr className=" border-gray-400"/> 
                </div>
            </div>

       
            <div className="w-full items-center justify-center mt-5  ">
                <Tabs defaultValue="Produtos" className="w-11/12   ">
                    <TabsList>
                        <TabsTrigger value="Produtos" > Produtos </TabsTrigger>
                        <TabsTrigger value="Servicos" > Servicos </TabsTrigger>
                        <TabsTrigger value="Parcelas" > Parcelas </TabsTrigger>
                        <TabsTrigger value="Detalhes" > Detalhes </TabsTrigger>
                        <TabsTrigger value="Veículos" > Veículos </TabsTrigger>

                    </TabsList>

                    <TabsContent value="Produtos">
                            <div className="w-full  flex justify-start items-center   ">
                                <div className="w-6/12  ml-12" >
                                     <ListaProdutos selecionarProduto={selecionarItens} itens={produtosSelecionados} />
                                
                                </div>
                            </div>

                            <ScrollArea className="h-96 w-full rounded-md border" >
                             <div className="w-full items-center justify-center flex   ">
                                <div className="  shadow-lg" >
                                        <Table  className=" bg-white rounded-md  ">
                                            <TableBody>
                                            { produtosSelecionados?.length > 0 &&
                                                produtosSelecionados?.map((i:Produto_pedido)=>(
                                                    
                                                    <TableRow key={ i.codigo }  className=" gap-4   " > 
                                                        <TableCell className=" text-center font-bold text-gray-600">    {i.codigo}          </TableCell>
                                                        <TableCell className=" w-120 font-bold text-gray-600 "> {i.descricao}</TableCell>
                                                        <TableCell className=" w-80 text-center font-bold text-gray-600" >
                                                        Qtd: <input className=" border-gray-400 ml-1 border-2 rounded-md w-40 text-center "
                                                                    placeholder="Quantidade:"     
                                                                    onChange={ (e:any)=>  handleIncrement(i, e.target.value ) }
                                                                    value={   i.quantidade  }
                                                                />
                                                                { /*i.quantidade &&  <span className=" m-2">   {i.quantidade}  </span>*/  }

                                                        </TableCell>
                                                        
                                                        <TableCell className="w-80  text-center font-bold text-gray-600"> 
                                                      
                                                               <input 
                                                                    className="border-gray-400 border-2 rounded-md w-20 text-center"
                                                                    placeholder="Preço:"
                                                                    onChange={(e) => handlePrice(i, e.target.value)}
                                                                    defaultValue={i?.preco.toFixed(2)}
                                                                />
                                                                <span>  {  isNaN(i.preco) ? "valor invalido" : 'R$' + i.preco.toFixed(2)  } </span>
                                                            </TableCell>

                                                            <TableCell className="  w-40    text-center font-bold text-gray-600 ">
                                                                    <span> desconto R$ { i.desconto ? i.desconto : 0  }</span>
                                                            </TableCell>
                                                            
                                                            <TableCell className="  w-40    text-center font-bold text-gray-600 ">
                                                                    <span> total R$ { (i.quantidade * i.preco).toFixed(2)   }</span>
                                                            </TableCell>

                                                        <TableCell className=" w-40     text-center font-bold text-gray-600 ">
                                                        <Button  className=" rounded-full w-3 h-6"  onClick={ ( )=>deleteItem(i) } > X </Button>
                                                        </TableCell>
                                                        
                                                    </TableRow>

                                                ) )
                                                }
                                            </TableBody>
                                        </Table>
                                    </div>
                             </div>
                             </ScrollArea>


                    </TabsContent>
                    
                    <TabsContent value="Servicos">
                           
                            <div className="w-full   flex justify-start items-center   ">
                                <div className="w-6/12  ml-12" >
  
                                    <ListaServicos selecionarServico={selecionarServicos} />
                

                                </div>
                            </div>
                        <ScrollArea className="h-96 w-full rounded-md border" >
                            <div className="w-full items-center justify-center flex relative ">
                                <div className=" shadow-lg" >
                                        <Table  className=" bg-white rounded-md  ">
                                            <TableBody>
                                            { servicosSelecionados?.length > 0 &&
                                                servicosSelecionados?.map((i:any)=>(
                                                    
                                                    <TableRow key={ i.codigo }  className=" gap-4"> 
                                                        <TableCell className="font-medium text-center font-bold text-gray-600">    {i.codigo}          </TableCell>
                                                        <TableCell className=" w-120 font-medium  font-bold text-gray-600 ">{i.aplicacao}</TableCell>
                                                            <TableCell className=" w-80 font-medium text-center font-bold text-gray-600" >
                                                                <input className=" border-gray-400 border-2 rounded-md w-40 text-center "
                                                                    placeholder="Quantidade:"     
                                                                    onChange={ (e:any)=>  handleIncrementServices(i, e.target.value ) }
                                                                />
                                                                {  i.quantidade &&
                                                                    <span className=" m-2">
                                                                        Qtd: {i.quantidade}
                                                                    </span>   }
                                                            </TableCell>
                                                        <TableCell className=" w-80 font-medium text-center font-bold text-gray-600" > 
                                                        <input className=" border-gray-400 border-2 rounded-md w-20 text-center "
                                                                placeholder="Preco:"  onChange={ (e)=>  handlePriceServices(i, e.target.value ) }
                                                                defaultValue={i.valor }
                                                                />
                                                        <span>  valor R$ {i.valor.toFixed(2)  } </span>
                                                            </TableCell>
                                                        <TableCell className="  w-40  font-medium text-center font-bold text-gray-600 ">
                                                                    <span> total R$ {  (i.quantidade * i.valor).toFixed(2)}</span>
                                                        </TableCell>

                                                        <TableCell className=" w-20 font-medium text-center font-bold text-gray-600 ">
                                                        <Button  className=" rounded-full w-3 h-6"  onClick={ ( )=>deleteServico(i) } > X </Button>
                                                        </TableCell>
                                                        
                                                    </TableRow>

                                                ) )
                                                }
                                            </TableBody>
                                        </Table>
                                    </div>
                            </div>
                       </ScrollArea>

                    </TabsContent>
                        
                       <TabsContent value="Parcelas">

                        <SelectFormasPagamento   codigoForma={codigoForma} setCodigoForma={setCodigoForma}  formaSelecionada={formaSelecionada} setFormaSelecionada={setFormaSelecionada}   />

                             <div>
                                            <p className="text-gray-500 font-sans font-bold" > personalizada</p>                  
                                <div className="w-[100%]    rounded-md flex justify-between m-4">
                                   <div className="  flex  ">
                                         <p className="text-gray-500 font-sans font-bold" > quantidade de parcelas :</p>  
                                      <input 
                                        className="shadow-md ml-1 rounded-sm text-gray-700 font-bold w-[10%] text-center"
                                         />
                                    </div>

                                <div className=" flex  ">
                                  <p className="text-gray-500 font-sans font-bold " >  intervalo entre parcelas :</p>  
                                     <input 
                                    className="shadow-md ml-1 rounded-sm  text-gray-700 font-bold w-[10%]"
                                    value={formaSelecionada?.intervalo}
                                        />
                                  </div>
                                </div>
                            </div>               

                                <Parcelas  
                                  parcelas={  parcelas}
                                  dadosOrcamento={dadosOrcamento}
                                  setDadosOrcamento={setDadosOrcamento}
                                  total={total}
                                  formaSelecionada={formaSelecionada}
                              />
                        
                        </TabsContent>
                    <TabsContent value="Detalhes">
                        
                 

                        <div className="mt-4">                                                
                            <Detalhes setSituacao={setSituacao} situacao={situacao} obsPedido={observacoes} setObsPedido={setObservacoes} cliente={dadosOrcamento?.cliente} />
                         </div>
                    </TabsContent>

                    <TabsContent value="Veículos">
                    <Veiculos 
                         cliente={dadosOrcamento?.cliente}
                         setVeiculo={handleVeic}
                         codigoPedido={codigo_pedido}
                         codigoVeiculo={dadosOrcamento?.veiculo}
                           />
                    </TabsContent>

                </Tabs>       
            </div>                                
        
 
            <div className="bg-white p-7  sm:ml-14  fixed bottom-0 left-0 right-0 rounded-xl shadow-md  ">
                <Table className="w-full">
                    <TableBody>
                        <TableRow>
                            <TableCell  >
                                <span className=" text-gray-500 font-bold text-xl "  > Total R$ {total?.toFixed(2)}</span>
                            </TableCell>
                            <TableCell >
                                <span className=" text-gray-500 font-bold text-xl "  > Total Produtos R$ {totalProdutos?.toFixed(2)}</span>
                            </TableCell>
                            <TableCell >
                                <span className=" text-gray-500 font-bold text-xl "  > Total Servicos R$ { totalServicos?.toFixed(2)}</span>
                            </TableCell>
                            <TableCell >
                                <Button onClick={()=>{
                                      // console.log(dadosOrcamento)
                                      gravar()
                                } 
                                }>
                                            GRAVAR
                                </Button>
                            </TableCell>


                        </TableRow>
                    </TableBody>
                </Table>
            </div>
 
       </div>
    )
} 