'use client'
 
import { useCallback, useEffect, useState } from "react";
import ListaProdutos from "../components/produtos"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ListaClientes from "../components/clientes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListaServicos from "../components/servicos"; 
import Parcelas from "../components/parcelas";  
import {   configApi } from "@/app/services/api";
 
import Detalhes from "../components/detalhes"; 
import { useParams, useRouter } from 'next/navigation'
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Terminal } from "lucide-react";
import { SelectFormasPagamento } from "../components/selectFormasPagamento";  
import { Veiculos } from "../components/veiculos";  
import { useAuth } from "@/contexts/AuthContext";
import { headers } from "next/headers";
import { TipoPedidoSeletor } from "../components/tipoPedido";
import { ThreeDot } from "react-loading-indicators";
import { AlertDemo } from "@/components/alert/alert";
import { DateService } from "@/app/services/dateService";

export default function EditPedido(){

    const  [ produtosSelecionados, setProdutosSelecionados  ] = useState<Produto_pedido[] | []  >([]);
    const  [ servicosSelecionados, setServicosSelecionados  ] = useState<Servico_pedido[] | [] > ([]);
    const  [ clienteSelecionado, setClienteSelecionado ] = useState<clientePedido>();
    const  [ total , setTotal ] = useState<number>(0);
    const  [ totalProdutos , setTotalProdutos ] = useState<number>(0);
    const  [ totalServicos , setTotalServicos ] = useState<number>(0);
     const  [ dadosOrcamento, setDadosOrcamento ] = useState<pedido>();
    const  [ parcelas, setParcelas ] = useState<parcela[]>();
    const  [ situacao, setSituacao  ] = useState<string>('');

    const  [ observacoes, setObservacoes ] = useState<string>('')
    const [visibleAlertPrice, setVisibleAlertPrice] = useState(false);
    const [ codigoNovoPedido, setCodigoNovoPedido ] = useState();
    const [ formaSelecionada , setFormaSelecionada] = useState<formaPagamento | undefined>();
    const [isLoading, setIsLoading] = useState(false);  
 
     const [ visible, setVisible ] = useState<boolean>(false);
    const [ msgApi, setMsgApi ] = useState<string>();
    const [ codigoForma , setCodigoForma] = useState<number>(0);

   const params = useParams();  
 
   const { user, loading:loadingAuth }:any = useAuth();
   const router = useRouter();
   const  codigo_pedido:number   = Number(params.codigo); 
   const api = configApi();
   const dateService = DateService();


   useEffect(() => {
  
     async function filtro(){

        setIsLoading(true)
            try{    
                const response = await api.get(`/pedido`,
                    {
                        params:{ codigo: Number(codigo_pedido)  },
                        headers:{
                             vendedor: user.vendedor ,
                             cnpj:  user.cnpj    
                        }
                    }
                ) 
   
                   if(response.status === 200 && response.data && response.data.length > 0 ){
                    setDadosOrcamento(response.data[0])
                    setTotal(response.data[0].total);
                    setTotalProdutos(response.data[0].total_produtos)
                    setTotalServicos(response.data[0].total_servicos);
                    setClienteSelecionado(response.data[0].cliente)
                    setSituacao(response.data[0].situacao)
                    setObservacoes(response.data[0].observacoes)
                    
                }
              }catch(e) {
                console.log(e)
              } finally{
                setIsLoading(false)
              }
         
    }
    if (codigo_pedido && user && !loadingAuth) {
        filtro();
    }else{
        setIsLoading(true)
    }

}, [codigo_pedido, user, loadingAuth ]);  

   useEffect(
    ()=>{
        function ajusteTotais(){
            let totalProdutos = 0;
            let totalServicos = 0; 
            let totalGeral = 0; 
            
               if( dadosOrcamento && dadosOrcamento.servicos.length > 0  ){
                   dadosOrcamento.servicos.map((i)=>{
                       totalServicos += i.quantidade * i.valor;
                   })
               }
               if( dadosOrcamento && dadosOrcamento.produtos.length > 0  ){
                   dadosOrcamento.produtos.map((i)=>{
                       totalProdutos += i.quantidade * i.preco;
                   })
               }

            setTotalProdutos(totalProdutos)
            setTotalServicos(totalServicos)
        
            totalGeral = totalProdutos + totalServicos
            setTotal(totalGeral)


            let qtdParcelas:number = 0;
            if(parcelas && parcelas.length > 0 ) qtdParcelas = parcelas.length  


           setDadosOrcamento(
               (prev:any)=>({
                   ...prev, 
                   cliente:clienteSelecionado,
                   codigo_cliente: clienteSelecionado?.codigo,
                   total_produtos:totalProdutos,
                   total_servicos:totalServicos,
                   total_geral: totalGeral,
                   quantidade_parcelas: qtdParcelas,
                   observacoes:observacoes,
                   situacao: situacao,
               }) 
           )
        }
    ajusteTotais();
    },  [  produtosSelecionados , servicosSelecionados, clienteSelecionado , observacoes, situacao])

    useEffect(()=>{
        let parcela = gerarParcelaUnica( total, codigo_pedido)

        setDadosOrcamento(
            (prev:any)=>({
                ...prev, 
                 parcelas: parcela
            }) 
        )

    },  [   total])
     


    ////////////////////////
    useEffect(()=>{
        if( codigo_pedido !== null ){
        let aux =  gerarParcelas(formaSelecionada, total,codigo_pedido )
          setDadosOrcamento(
              (prev:any)=>({
                  ...prev,
                     quantidade_parcelas: aux.length,
                     parcelas:aux
                    })
                )
        } 

    },[ formaSelecionada ])
    

  ////////////////////////



      const selecionarItens =   ( i:Produto_pedido )=>{
                if(i && produtosSelecionados ){
                    i.quantidade = 1 

                    //let v = produtosSelecionados.some((p:Produto_pedido)=> p.codigo === i.codigo )
                    //if(v){
                    //    console.log(`produto ${i.codigo} ja foi adicionado`)
                    //    return 
                    //}
                    setProdutosSelecionados( ( prev:any) => [...prev, i])
                }

            if(dadosOrcamento && dadosOrcamento.produtos ){
                    let auxProd = dadosOrcamento.produtos
                let prod;
                    let v = auxProd.some((p:Produto_pedido)=> p.codigo === i.codigo )
                    if(v){
                        console.log(`produto ${i.codigo} ja foi adicionado`)
                        return 
                    }

                    i.total = i.quantidade * i.preco;
                    auxProd.push(i);

                    setDadosOrcamento((prev:any)=>({
                        ...prev,
                        produtos: auxProd
                    }))
                 }

            }

      const selecionarServicos =    (i:Servico_pedido)=>{
                if(i && servicosSelecionados){
                //    i.quantidade = 1 
                //    if(!i.valor) i.valor = 0.00;
                //    i.total = i.valor * i.quantidade
//
                //    let v = servicosSelecionados.some((p:Servico_pedido)=> p.codigo === i.codigo )
                //    if(v){
                //        console.log(`servicos ${i.codigo} ja foi adicionado`)
                //        return 
                //    }
                    setServicosSelecionados( (prev:any ) => [...prev, i])
                }

                        let auxServ = dadosOrcamento?.servicos ||  [];

                        if( auxServ.length > 0 ){
                            let v = auxServ.some((s )=> s.codigo === i.codigo);
                                if(v) {
                                    console.log(`servicos ${i.codigo} ja foi adicionado`)
                                    return;
                                }
                            }

                              i.total = i.quantidade * i.valor;
                            auxServ.push(i);
                            setDadosOrcamento((prev:any)=>({...prev, servicos:auxServ }))      

            }
        
       
      const handleIncrement = (item:Produto_pedido, quantidade:number ) => {
        if(   isNaN(quantidade) ){
            console.log("é necessario informar uma quantidade valida")
            quantidade = 1
        }
        
         if(produtosSelecionados !== undefined){ 

         setProdutosSelecionados((prevSelectedItems:any) => {
             return prevSelectedItems.map((i:Produto_pedido) => {
                 if (i.codigo === item.codigo) {
                 return { ...i, quantidade:  quantidade    };
                 }
                 return i;
             });
             });
        } 
        
        if( dadosOrcamento && dadosOrcamento.produtos.length > 0 ){
                let auxprod = dadosOrcamento.produtos;
                
                let prod = auxprod.map((i:Produto_pedido)=>{
                    if (i.codigo === item.codigo) {
                        return { ...i, quantidade:  quantidade , total: (quantidade * i.preco )};
                        }
                        return i;
                })
                setDadosOrcamento((prev:any)=>({...prev, produtos: prod}))
          }

      };

      const handleIncrementServices = (item:Servico_pedido, quantidade:number ) => {
        if( !quantidade  || isNaN(quantidade )){
            //quantidade = 1
            Number(quantidade)
        }

        if(servicosSelecionados !== undefined){ 
        setServicosSelecionados((prevSelectedItems:any ) => {
            return prevSelectedItems.map((i:Servico_pedido) => {
                 if (i.codigo === item.codigo) {
                    return { ...i, quantidade: quantidade  };
                    }
                    return i;
                    });
                });
            }

            if( dadosOrcamento && dadosOrcamento.servicos){
                let auxServ = dadosOrcamento?.servicos || [];

                let serv;
                        item.total = item.quantidade *  item.valor;
                        serv = auxServ.map((s)=>{
                        if(s.codigo === item.codigo){
                            return { ...s, quantidade:quantidade, total: ( quantidade * item.valor)  }
                        }
                        return s;
                    })
                    setDadosOrcamento((prev:any)=>({...prev, servicos:serv  }))      
                }

        };

        const handlePrice = (item:Produto_pedido, preco:any) => {

            const price = parseFloat(preco);
            if (isNaN(price) || price < 0) {
                setVisibleAlertPrice(true);
            } else {
                setVisibleAlertPrice(false);
                item.preco = price; // ou a lógica que você usa para atualizar o preço
            }
    
            setProdutosSelecionados((prevSelectedItems:Produto_pedido[]) => {
              return prevSelectedItems.map((i) => {
                  if (i.codigo === item.codigo) {
                    return { ...i, preco:   price    };
                  }
                     return i;
                });
            });

             if( dadosOrcamento && dadosOrcamento.produtos.length > 0 ){
                let auxprod = dadosOrcamento.produtos;
                
                let prod = auxprod.map((i:Produto_pedido)=>{
                    if (i.codigo === item.codigo) {
                        return { ...i, preco: preco , total: (i.quantidade * preco )};
                        }
                        return i;
                })
                setDadosOrcamento((prev:any)=>({...prev, produtos: prod}))
          }


        };

      const handlePriceServices = (item:Servico_pedido, valor:number) => {
        let auxPreco =     isNaN(valor) ?  0 : valor  

        setServicosSelecionados((prevSelectedItems:Servico_pedido[]) => {
            return prevSelectedItems.map((i) => {
                if (i.codigo === item.codigo) {
                  return { ...i, valor:   auxPreco    };
                }
            return i;
          });
        });

        if( dadosOrcamento && dadosOrcamento.servicos){
            let auxServ = dadosOrcamento?.servicos || [];
            let serv;
                    item.total = item.quantidade *  item.valor;
                    serv = auxServ.map((s)=>{
                    if(s.codigo === item.codigo){
                        return { ...s, valor:valor, total: ( s.quantidade * valor)  }
                    }
                    return s;
                })

                setDadosOrcamento((prev:any)=>({...prev, servicos:serv  }))      
            }
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

             if( dadosOrcamento && dadosOrcamento.produtos ){
                    let prods;
                    let auxProd = dadosOrcamento.produtos;
                    const index = auxProd.findIndex( i => i.codigo === item.codigo );
                    if( index !== -1){
                        prods = auxProd.filter( i=> i.codigo !== item.codigo);
                    }else{
                        prods=auxProd;
                    }
                    setDadosOrcamento((prev:any)=>({...prev , produtos:prods}))
             }
        
             
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

             if( dadosOrcamento && dadosOrcamento.servicos){
                let services;
                let auxServ = dadosOrcamento.servicos;
                const index = auxServ.findIndex((i)=> i.codigo === item.codigo);
                if( index !== -1){
                    services = auxServ.filter((i)=> i.codigo !== item.codigo);
                }else{
                    services = auxServ
                }
                setDadosOrcamento((prev:any)=>({...prev, servicos: services}))
             }

       } 

       
       function gerarParcelaUnica( total:number,codigoPedido:number ){
        const aux = [{ pedido: codigoPedido, parcela: 1, valor: total, vencimento: dateService.obterDataAtual() }];
          return aux 
      }

      function gerarParcelas(forma:any, total:number, codigo_pedido:number ):parcela[] {
    
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
            (prev :any)=>{
                if( veic && veic.codigo ){
                return { ...prev, veiculo:veic.codigo}
                }
            }
        )
      
    }
    function handleType   (tipo:any) {
        setDadosOrcamento(
            (prev:any)=>{
                return { ...prev, tipo:tipo}
            }
        )
      }

      async function gravar (){

        console.log([dadosOrcamento])

            if( !dadosOrcamento || !dadosOrcamento.cliente.codigo){
                console.log("é necessario informar o cliente")
                return
            }

            dadosOrcamento.data_recadastro = dateService.obterDataHoraAtual();

             
                 //console.log(dadosOrcamento)
                setIsLoading(true)
              try{
                  let response = await api.post('/pedidos', [ dadosOrcamento] ,
                   { 
                     headers: { cnpj:  user.cnpj  }
                   }
                    );
 
                     if( response.status === 200 ){
                             setMsgApi(`Pedido registrado com sucesso!`);
                             setVisible(true)
         
                      }
                     
                    
             }catch(e){
                setMsgApi(`Erro ao tentar registrar pedido!`);
                setVisible(true)
                 console.log(` Erro ao enviar o orcamento `+ e )
             }finally{
            setIsLoading(false)
             }
              
        }

   
        if (loadingAuth) {
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
   
 
 if (isLoading  ) {
    return( 
      <div className=" min-h-screen flex items-center justify-center flex-col sm:ml-14 p-4 bg-slate-100"  >
      <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
     </div> 
     )  
}


return(
        <div className="  min-h-screen sm:ml-14 p-4   w-full     bg-gray-100  ">

             <AlertDemo content={msgApi}  visible={visible} setVisible={setVisible} to={'/pedidos'} />
        

        <div className="flex justify-between w-4/5">
                   {    codigo_pedido && 
                            <span className="text-xl m-3  font-sans font-bold  ">
                                Editando Pedido: {codigo_pedido}
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
                               <span className="font-bold text-gray-600"> Codigo:  { dadosOrcamento?.cliente.codigo }</span>
                           </TableCell>
                           <TableCell >
                               <span className="font-bold text-gray-600"> nome: { dadosOrcamento?.cliente.nome } </span>
                           </TableCell>
                           <TableCell >
                           <span className="font-bold text-gray-600"> cnpj/cpf : { dadosOrcamento?.cliente.cnpj}</span>
                           </TableCell>
                           <TableCell >
                           <span className="font-bold text-gray-600"> cidade : { dadosOrcamento?.cliente.cidade }</span>
                           </TableCell>
                           <TableCell >
                                  <span className="font-bold text-gray-600"> celular : { dadosOrcamento?.cliente.celular  }</span>
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
                                     <ListaProdutos selecionarProduto={selecionarItens}  />
                                
                                </div>
                            </div>

                            <ScrollArea className="h-96 w-full rounded-md border" >
                             <div className="w-full items-center justify-center flex   ">
                                <div className="  shadow-lg" >
                                        <Table  className=" bg-white rounded-md  ">
                                            <TableBody>
                                            {  
                                            dadosOrcamento && dadosOrcamento.produtos?.length > 0 &&
                                            dadosOrcamento.produtos?.map((i:Produto_pedido)=>(
                                                    
                                                    <TableRow key={ i.codigo }  className=" gap-4   " > 
                                                        <TableCell className=" text-center font-bold text-gray-600">    {i.codigo}          </TableCell>
                                                        <TableCell className=" w-120 font-bold text-gray-600 "> {i.descricao}</TableCell>
                                                        <TableCell className=" w-80 text-center font-bold text-gray-600" >
                                                        Qtd: <input className=" border-gray-400 ml-1 border-2 rounded-md w-40 text-center "
                                                                    placeholder="Quantidade:"     
                                                                    onChange={ (e:any)=>  handleIncrement(i, e.target.value ) }
                                                                    value={   i.quantidade  }
                                                                />

                                                        </TableCell>
                                                        
                                                        <TableCell className="w-80  text-center font-bold text-gray-600"> 
                                                      
                                                               <input 
                                                                    className="border-gray-400 border-2 rounded-md w-20 text-center"
                                                                    placeholder="Preço:"
                                                                    onChange={(e) => handlePrice(i, e.target.value)}
                                                                    defaultValue={Number(i?.preco).toFixed(2)}
                                                                />
                                                                <span>  {  isNaN(i.preco) ? "valor invalido" : 'R$' + Number(i.preco).toFixed(2)  } </span>
                                                            </TableCell>

                                                            <TableCell className="  w-40    text-center font-bold text-gray-600 ">
                                                                    <span> desconto R$ { i.desconto ? i.desconto : 0  }</span>
                                                            </TableCell>
                                                            
                                                            <TableCell className="  w-40    text-center font-bold text-gray-600 ">
                                                                    <span> total R$ { Number(i.quantidade * i.preco).toFixed(2)   }</span>
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
                                            { dadosOrcamento && dadosOrcamento.servicos.length > 0 &&
                                                dadosOrcamento.servicos?.map((i:any)=>(
                                                    
                                                    <TableRow key={ i.codigo }  className=" gap-4"> 
                                                        <TableCell className="font-medium text-center font-bold text-gray-600">    {i.codigo}          </TableCell>
                                                        <TableCell className=" w-120 font-medium  font-bold text-gray-600 ">{i.aplicacao}</TableCell>
                                                            <TableCell className=" w-80 font-medium text-center font-bold text-gray-600" >
                                                                <input className=" border-gray-400 border-2 rounded-md w-40 text-center "
                                                                    placeholder="Quantidade:"     
                                                                    onChange={ (e:any)=>  handleIncrementServices(i, Number(e.target.value) ) }
                                                                />
                                                                {  i.quantidade &&
                                                                    <span className=" m-2">
                                                                        Qtd: {i.quantidade}
                                                                    </span>   }
                                                            </TableCell>
                                                        <TableCell className=" w-80 font-medium text-center font-bold text-gray-600" > 
                                                        <input className=" border-gray-400 border-2 rounded-md w-20 text-center "
                                                                placeholder="Preco:"  onChange={ (e)=>  handlePriceServices(i, Number(e.target.value) ) }
                                                                defaultValue={i.valor }
                                                                />
                                                        <span>  valor R$ { Number(i.valor).toFixed(2)  } </span>
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
                                  dadosOrcamento={dadosOrcamento}
                                  setDadosOrcamento={setDadosOrcamento}
                                  total={total}
                                 // formaSelecionada={formaSelecionada}
                              />
                        
                        </TabsContent>
                    <TabsContent value="Detalhes">
                        
                 

                        <div className="mt-4">                                                
                            <Detalhes setSituacao={setSituacao} situacao={situacao} obsPedido={observacoes} setObsPedido={setObservacoes} />
                        </div>
                    </TabsContent>

                    <TabsContent value="Veículos">
                    {
                    <Veiculos 
                         cliente={dadosOrcamento?.cliente}
                         setVeiculo={handleVeic}
                         codigoPedido={codigo_pedido}
                         codigoVeiculo={dadosOrcamento?.veiculo}
                           />
                            }
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

 