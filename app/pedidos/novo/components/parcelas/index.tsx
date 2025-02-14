import { configApi } from "@/app/services/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react"

export default function Parcelas ( { total, setParcelas, parcelas, codigoNovoPedido, codigoPedido} ){
  
    const [ dados , setDados ] = useState([])
    const [ formaSelecionada , setFormaSelecionada] = useState({});
    const  [ parcelasComponent , setParcelasComponent ] = useState<any[]>()
    const api = configApi();


    function dataAtual() {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        return `${ano}-${mes}-${dia}`;
    }

    function gerarParcelas(forma, total) {
        if ( forma !== null && forma.codigo > 0 && forma.parcelas > 0) {
            const valorParcelas = total / forma.parcelas;
            const novasParcelas = [];

            for (let i = 1; i <= forma.parcelas; i++) {
                novasParcelas.push({ pedido: codigoPedido, parcela: i, valor: valorParcelas });
            }

            setParcelas(novasParcelas);
            setParcelasComponent(novasParcelas)
        }else{
            const aux = [{ pedido: codigoPedido ,parcela: 1, valor: total, vencimento: dataAtual() }];
            setParcelas( aux)
            setParcelasComponent(aux)

        }
    }

    
    async function buscaFormas_Pagamento (){
        const response = await api.get("/offline/formas_Pagamento")
        if(response.status == 200 ){
            setDados(response.data)
        }
    }
////////////////////////  
   useEffect(()=>{

            if( parcelas.length === 0 && codigoNovoPedido ){
                gerarParcelas(null, total);
            }
             
              buscaFormas_Pagamento()
    },[])

    useEffect(()=>{
        if( formaSelecionada.codigo > 0 ){
            gerarParcelas(formaSelecionada, total);
        }
    },[formaSelecionada])

    ////////////////////////  


    function selecFpgt ( fpgt ){
            setFormaSelecionada(fpgt)
        }
  


    return(
        
        <div className="relative p-4 w-full  ">
            <Select onValueChange={selecFpgt}  >
                <SelectTrigger className="w-[200px] bg-white rounded-lg shadow-md">
                    <SelectValue placeholder="Formas De Pagamento" />
                </SelectTrigger>
                <SelectContent>
                        {
                            dados.length > 0 ? (
                             dados.map( (i)=>(
                                <SelectItem value={i}   key={i.codigo} > {i.codigo} {i.descricao}   Qtd parcelas: { i.parcelas}</SelectItem>
                             ))
                            ) : (
                                <span> Nenhum item encontrado!</span>
                            )
                        }
               
                </SelectContent>
            </Select>


            <Table className="w-1/4 bg-white m-2">
                    <TableBody>
                        {
                           parcelas?.length   > 0   && (
                                <>
                                    {
                                        parcelas.map((i)=>(
                                            <TableRow key={ i?.parcela } 
                                            >
                                                    <TableCell className=" m-1 " >
                                                        <span className=" text-gray-500 font-bold text-xl "  key={i.sequencia} >
                                                             total R$ { i?.valor.toFixed(2) } 
                                                             </span> 
                                                        <br/>
                                                        <span className=" text-gray-500 font-bold text-xl "  key={i.sequencia} >
                                                        pedido:{codigoNovoPedido}
                                                        </span> 


                                                    </TableCell>
                                            </TableRow>

                                            )
                                        )
                                    }

                              </>
                              ) 
                             
                        }
                     </TableBody>
            </Table>



        </div>
    )
}