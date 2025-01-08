 

'use client'
 
import { useCallback, useEffect, useState } from "react";
import ListaProdutos from "../produtos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ListaClientes from "../clientes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListaServicos from "../servicos"; 
import Parcelas from "../parcelas";  
import { api } from "@/app/services/api";
import { stringify } from "querystring";
import { AlertDemo } from "../alert/alert";
import Detalhes from "../detalhes";
import { useRouter } from 'next/navigation'

export default function MainPedido( { codigo_pedido}  ){

 
    const  [ produtosSelecionados, setProdutosSelecionados  ] = useState<any>([]);
    const  [ servicosSelecionados, setServicosSelecionados  ] = useState<any>([]);
    const  [ clienteSelecionado, setClienteSelecionado ] = useState<cliente>({});
    const  [ total , setTotal ] = useState(0);
    const  [ totalProdutos , setTotalProdutos ] = useState(0);
    const  [ totalServicos , setTotalServicos ] = useState(0);
    const  [ orcamento , setOrcamento ] = useState({});
    const  [ dadosOrcamento, setDadosOrcamento ] = useState();
    const  [ parcelas, setParcelas ] = useState([]);
    
    const  [ observacoes, setObservacoes ] = useState<string>()
    const  [ visibleAlertQtdProdutos ,setVisibleAlertQtdProdutos ] = useState<boolean>( false );
    const [visibleAlertPrice, setVisibleAlertPrice] = useState(false);

        const router = useRouter();

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
            descricao: String,
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


      const selecionarItens =  useCallback(
        ( i:Produto_pedido )=>{
                if(i){
                    i.quantidade = 1 
                    if(!i.preco) i.preco = 0.00;

                    let v = produtosSelecionados.some((p:Produto_pedido)=> p.codigo === i.codigo )
                    if(v){
                        console.log(`produto ${i.codigo} ja foi adicionado`)
                        return 
                    }
                    setProdutosSelecionados( ( prev:Produto_pedido[] ) => [...prev, i])
                    console.log(produtosSelecionados)
                }
        
        },[ produtosSelecionados  ]
      ) 

      const selecionarServicos =  useCallback(
        (i:Servico_pedido)=>{
                if(i){
                    i.quantidade = 1 
                    if(!i.valor) i.valor = 0.00;

                    let v = servicosSelecionados.some((p)=> p.codigo === i.codigo )
                    if(v){
                        console.log(`servicos ${i.codigo} ja foi adicionado`)
                        return 
                    }
                    setServicosSelecionados( (prev:Servico_pedido[]) => [...prev, i])
                    console.log(servicosSelecionados)
                }
        
        },[ servicosSelecionados ]
      ) 
 
      const handleIncrement = (item:Produto_pedido, quantidade:number ) => {
        if(   isNaN(quantidade) ){
            console.log("é necessario informar uma quantidade valida")
            quantidade = 1
        }


        setProdutosSelecionados((prevSelectedItems:Produto_pedido[]) => {
            return prevSelectedItems.map((i) => {
                if (i.codigo === item.codigo) {
                return { ...i, quantidade:  quantidade ,  };
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
                  return { ...i, preco:   price.toFixed(2)   };
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
        servicosSelecionados((prevSelectedItems:Servico_pedido[]) => {
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
       
      async function gravar (){
            console.log(dadosOrcamento)
            if( !dadosOrcamento.cliente.codigo){
                console.log("é necessario informar o cliente")
                return
            }

            try{
                let response = await api.post('pedidos', [ dadosOrcamento] );

                    if( response.status === 200 ){
                        console.log(response.data)
                            router.push('/pedidos')
                    }
                    
            }catch(e){
                console.log(` Erro ao enviar o orcamento `+ e )
            }
       

       }

{/*************************************************** */}


useEffect(()=>{
    async function filtro(){
       
        if( codigo_pedido !== null ){
       
            try{    
                const response = await api.get(`pedidos/${codigo_pedido}`) 
                if(response.status === 200  ){
                    setDadosOrcamento(response.data)
                    console.log( dadosOrcamento )
                }
              }catch(e){console.log(e)}
        }
    }

    filtro()

},[ codigo_pedido ])
 
////////////////////////
useEffect(() => {
    if (dadosOrcamento) {
        if (dadosOrcamento.servicos) {
            setServicosSelecionados(dadosOrcamento.servicos);
        }
        if (dadosOrcamento.produtos) {
            setProdutosSelecionados(dadosOrcamento.produtos);
        }
        if (dadosOrcamento.cliente) {
            setClienteSelecionado(dadosOrcamento.cliente);
        }
        if (dadosOrcamento.parcelas) {
            setParcelas(dadosOrcamento.parcelas);
        }

        if( dadosOrcamento.observacoes ){
            setObservacoes( dadosOrcamento.observacoes )
        }
        if( dadosOrcamento.codigo_site ){
            dadosOrcamento.codigo = dadosOrcamento.codigo_site
        }
    }
}, [dadosOrcamento]);
////////////////////////

useEffect(
    ()=>{
        function init(){
        } 

        if( codigo_pedido === null){
            let aux = gerarCodigo(110);

            let data_cadastro = dataAtual();

            let data_recadastro = dataHoraAtual();

            setDadosOrcamento(
                ( prev )=>({
                    ...prev,
                    total_geral:0,
                    descontos:0,
                    observacoes:'',
                    quantidade_parcelas:1,
                    vendedor:110,
                    situacao:'EA' ,
                    tipo: 1,
                    total_produtos: 0,
                    total_servicos: 0,
                    produtos:[],
                    veiculo: 0,
                    contato: '',
                    codigo:aux,
                    data_cadastro: data_cadastro,
                    data_recadastro: data_recadastro

                })
            )
        }

        if( codigo_pedido !== null  ){
            init();
        }

    },[]
)
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
         
                 setDadosOrcamento(
                     (prev)=>({
                         ...prev, 
                         cliente:clienteSelecionado,
                         codigo_cliente: clienteSelecionado?.codigo,
                         produtos: produtosSelecionados,
                         servicos:servicosSelecionados,
                         parcelas:parcelas,
                         total_geral: totalGeral,
                         quantidade_parcelas: parcelas?.length,
                         observacoes:observacoes
                     })
                 )
         }
     ajusteTotais()
     },[parcelas,  produtosSelecionados , servicosSelecionados, clienteSelecionado , observacoes]
 )
 ////////////////////////


return(
        <div className="  min-h-screen sm:ml-14 p-4   w-full     bg-gray-100  ">
             <div className="w-full   flex justify-start items-center">
         
            <div className="w-6/12  " >
            <span className="text-2xl m-3  font-sans font-bold  ">
                    Cliente
                </span>       
            <ListaClientes selecionarCliente={setClienteSelecionado}/>
            
                        <div className=" mt-1    rounded-xl shadow-md flex bg-white  ">
                                <Table  className=" ">
                                    <TableBody>
                                        <TableRow key={ clienteSelecionado?.codigo }  className=" gap-2"> 
                                        
                                                <TableCell className="font-medium text-center font-bold text-gray-600">  Codigo:  { clienteSelecionado?.codigo }   </TableCell>
                                                <TableCell className=" w-120 font-medium  font-bold text-gray-600 "> nome: { clienteSelecionado?.nome }</TableCell>
                                                    <TableCell className=" w-120 font-medium  font-bold text-gray-600 "> cnpj/cpf : { clienteSelecionado?.cnpj }</TableCell>
                                                </TableRow>
                                        </TableBody>
                                </Table>
                        </div>

                </div>
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
                    </TabsList>

                    <TabsContent value="Produtos">
                            <div className="w-full  flex justify-start items-center   ">
                                <div className="w-6/12  ml-12" >
                                    <ListaProdutos selecionarProduto={selecionarItens} itens={produtosSelecionados} />
                                </div>
                            </div>
                            <div className="w-full items-center justify-center flex   ">
                                <div className="  shadow-lg" >
                                        <Table  className=" bg-white rounded-md  ">
                                            <TableBody>
                                            { produtosSelecionados.length > 0 &&
                                                produtosSelecionados.map((i:Produto_pedido)=>(
                                                    
                                                    <TableRow key={ i.codigo }  className=" gap-4   " > 
                                                        <TableCell className="font-medium text-center font-bold text-gray-600">    {i.codigo}          </TableCell>
                                                        <TableCell className=" w-120 font-medium  font-bold text-gray-600 ">{i.descricao}</TableCell>
                                                        <TableCell className=" w-80 font-medium text-center font-bold text-gray-600" >
                                                                <input className=" border-gray-400 border-2 rounded-md w-40 text-center "
                                                                    placeholder="Quantidade:"     
                                                                    onChange={ (e:any)=>  handleIncrement(i, e.target.value ) }
                                                                    value={   i.quantidade  }
                                                                />
                                                                { i.quantidade &&  <span className=" m-2">  Qtd: {i.quantidade}  </span>  }

                                                        </TableCell>
                                                        
                                                        <TableCell className="w-80  text-center font-bold text-gray-600"> 
                                                      
                                                               <input 
                                                                    className="border-gray-400 border-2 rounded-md w-20 text-center"
                                                                    placeholder="Preço:"
                                                                    onChange={(e) => handlePrice(i, e.target.value)}
                                                                    defaultValue={i?.preco}
                                                                />
                                                                <span>  { isNaN(i.preco) ? "valor invalido" : 'R$' + i.preco} </span>
                                                            </TableCell>

                                                            <TableCell className="  w-40  font-medium text-center font-bold text-gray-600 ">
                                                                    <span> total R$ { i.quantidade * i.preco  }</span>
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
                    </TabsContent>
                    <TabsContent value="Servicos">
                            <div className="w-full   flex justify-start items-center   ">
                                <div className="w-6/12  ml-12" >
                                    <ListaServicos selecionarServico={selecionarServicos} />
                                </div>
                            </div>
                        
                            <div className="w-full items-center justify-center flex relative ">
                                <div className="w-8/12 shadow-lg" >
                                        <Table  className=" bg-white rounded-md  ">
                                            <TableBody>
                                            { servicosSelecionados.length > 0 &&
                                                servicosSelecionados.map((i:any)=>(
                                                    
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
                                                        <span>  valor R$ {i.valor  } </span>
                                                            </TableCell>
                                                        <TableCell className="  w-40  font-medium text-center font-bold text-gray-600 ">
                                                                    <span> total R$ { i.quantidade * i.valor}</span>
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
                    </TabsContent>
                    <TabsContent value="Parcelas">
                        <Parcelas  total={total}  parcelarGeradas={setParcelas}    />
                    </TabsContent>
                    <TabsContent value="Detalhes">
                                                
                         <Detalhes obsPedido={observacoes} setObsPedido={setObservacoes} />
    
                    </TabsContent>
                </Tabs>       
            </div>                                
        

            <div className="bg-white p-8  sm:ml-14  fixed bottom-0 left-0 right-0 rounded-xl shadow-md  ">
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
                                    //  console.log(dadosOrcamento)
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