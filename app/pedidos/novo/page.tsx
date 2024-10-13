'use client'
 
import { useEffect, useState } from "react";

export default  function  Novo(){
    const itens = [
        {"codigo":1,"nome":'teste1'},
        {"codigo":2,"nome":'teste2'},
        {"codigo":3,"nome":'teste3'},
        {"codigo":4,"nome":'teste4'},
    ]
    const [ produtosSelecionados, setProdutosSelecionados  ] = useState<any>([]);

    function Filho ( {funcao, itens, selecionados }  ){

        const [ iSelecionados, setISelecionados  ] = useState<any>([]);
 
        function handleI(i){
                funcao(i)
            
        }
      
 
        return(
            <>
                <h1> component filho </h1>
                
                   
                    {
                    itens?
                    ( 
                        itens.map((i)=>( 
                            <div>
                                <button key={i.codigo} onClick={()=>handleI(i)}>
                                    
                                    <p className={ selecionados.find((p)=> p.codigo === i.codigo ) ? 'bg-green-500' : 'bg-red-500' }> 
                                        { 
                                        i.codigo
                                         }
                                    </p>
                                </button >
                            </div>

                        )
                    )
                        ):(
                            <h3>nenhum iten</h3>
                        )
                    }
            </>
        )
    }

    function teste(i:any){
          setProdutosSelecionados( (prev:any)=>[...prev,i])
        
    }

        useEffect(() => {
        // Funcionalidade que você quer executar após a atualização de produtosSelecionados
        console.log("Produtos selecionados:", produtosSelecionados);
    }, [produtosSelecionados]);

    return(
        <div className="sm:ml-14 p-4 w-full h-full min-h-screen ">
            <h1> Novo</h1>
           <Filho funcao={teste} itens={itens} selecionados={produtosSelecionados}/>
     
           <div className="m-44 ">

            {    produtosSelecionados.map.length > 0 &&
                   produtosSelecionados.map((i)=>(<h3 key={i.codigo}>{i.codigo}</h3>))   
            }
           </div>
     
        </div>
    )
} 