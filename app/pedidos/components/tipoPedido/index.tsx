import { Button } from "@/components/ui/button"
import { BadgeDollarSign, Check, ClipboardList, Wrench } from "lucide-react"

     

export const TipoPedidoSeletor=({tipo, setTipo})=>{
    return(
        <div>
                <div className="flex items-center gap-1" >
                   
                   <Button
                        className={  tipo === 3 ? 'bg-green-600':'bg-slate-300'  }
                        onClick={()=> setTipo(3)}
                        title="Ordem de Serviço"
                    >
                   
                      <Wrench size={30} color="#FFF" strokeWidth={3}/>
                    </Button>  
               
                    <Button 
                    className={  tipo === 1 ? 'bg-green-600':'bg-slate-300'  }
                    onClick={()=> setTipo(1)}
                    title="Pedido de Venda"
                    >    
                     <ClipboardList size={30} color="#FFF" strokeWidth={3} />
                    </Button>    
                </div>
        </div>
    )
}