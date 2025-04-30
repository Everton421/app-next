import { configApi } from '@/app/services/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Import Shadcn Label
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';


    type props= { 
        codigoCliente:number | null,
        selectCliente: any
    }
    type cliente =
     {
        codigo:number,
        nome:string
    }

export const SelectCliente = ({ codigoCliente , selectCliente}: props)=>{

    const api = configApi();
    const { user, loading: authLoading }: any = useAuth();

        const [dados, setDados] = useState<any[]>();
        const [ pesquisa, setPesquisa ] = useState<any>('');
        const [ loading, setLoading  ] = useState(false);
        const [cliente, setCLiente  ] = useState<cliente>();


 async function busca(){
 if(!pesquisa || pesquisa === '' ) return;
    setLoading(true)
    try{
 
            let params  
          if( isNaN(pesquisa)){
            params=  {   
                nome:pesquisa,
                ativo:'S'    
            } }
            if( !isNaN(pesquisa)){
                params= {   
                    codigo:pesquisa,
                    ativo:'S'    
                }  }

        const result = await api.get('/clientes',{
          headers: { token:   user.token  },
          params:params
        })

        if(result.status === 200){
            setDados(result.data);
        }
    }catch(e){ console.log(e)
    }finally{
        setLoading(false)
    }

}

async function busca2(){

    try{

    if(codigoCliente && codigoCliente > 0 ){
        const result = await api.get('/clientes',{
            headers: { token:  user.token },
            params:{
               codigo:codigoCliente,
               limit:1
            }
          })

          if(result.status ===200){
            setCLiente(result.data[0])
          }
     }
    }catch(e){
        console.log(e)
    }

    }

useEffect( ()=>{
 busca2()
},[codigoCliente]
)



function selecionar(e:cliente){
    selectCliente(e)
    setCLiente(e)
    setPesquisa('')
    setDados([])
}

 useEffect( ()=>{
    busca();
        },[pesquisa]
    )


    return(
        <div>
            <div>
                <Label htmlFor="preco" className="text-sm font-medium text-gray-600">Cliente: { cliente && cliente.nome} </Label>
                                 <Input
                                         defaultValue={cliente && cliente.codigo }
                                         onChange={(e) =>  setPesquisa(e.target.value )}
                                        className="mt-1"
                                        placeholder="Pesquisar por codigo ou nome..."
                          />
              {loading ? (
                <p className="sm:ml-14 p-4 absolute">carregando...</p>
                     ) : (
                        dados && dados.length > 0 && (
                             <div className="absolute z-10    ">
                               { dados.slice(0, 2).map((i: any) => (
                                   <div key={i.codigo} 
                                   onClick={() => selecionar(i)} 
                                   className="   sm:ml-14 p-2 m-1 shadow-lg bg-gray-500 border-current rounded-md cursor-pointer  ">
                                
                                 <span className=" text-white font-bold">Código: {i.codigo}  {i.nome}  </span>
                                    <br/>
                                 <span className=" text-white font-bold">  cnpj: {i.cnpj}</span>
                            </div>
                        ))}
                    </div>
                )
            )}
              </div>

        </div>
    )
}