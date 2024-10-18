import { api } from "@/app/services/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react"

export default function Parcelas ( { total, parcelarGeradas } ){


    const [ dados , setDados ] = useState([])
    const [ formaSelecionada , setFormaSelecionada] = useState({});
    const  [ parcelas , setParcelas ] = useState<any[]>()


    useEffect(
    ()=>{
        async function busca (){
            let response = await api.get("/offline/formas_Pagamento")
            if(response.status == 200 ){
                setDados(response.data)
                console.log(response.data)
            }
        }
        busca();
        renderParcelas( formaSelecionada, total )
        
    },[] )



    useEffect(
        ()=>{
           renderParcelas(formaSelecionada, total)
        },[ formaSelecionada]
    )
    

function selecFpgt ( fpgt ){
        setFormaSelecionada(fpgt)
        console.log(fpgt)
    }

    function renderParcelas(forma, total) {
        if (forma.codigo > 0 && forma.parcelas > 0) {
            const valorParcelas = total / forma.parcelas;
            const novasParcelas = [];

            for (let i = 1; i <= forma.parcelas; i++) {
                novasParcelas.push({ sequencia: i, valor: valorParcelas });
            }

            setParcelas(novasParcelas);
            parcelarGeradas(novasParcelas)
        } else {
            setParcelas([{ sequencia: 1, valor: total }]);
        }
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
                           parcelas?.length   > 0   ? (
                                <>
                                    {
                                        parcelas.map((i)=>(
                                            <TableRow >
                                                    <TableCell className=" m-1 " >
                                                        <span className=" text-gray-500 font-bold text-xl "  key={i.sequencia} > total R$ { i?.valor.toFixed(2) }</span>
                                                    </TableCell>
                                            </TableRow>

                                            )
                                        )
                                    }

                              </>
                              ) :(
                            <>
                              teste
                            </>
                            )
                        }
                     </TableBody>
            </Table>



        </div>
    )
}