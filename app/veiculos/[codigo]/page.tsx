'use client';

import { Active } from "@/app/pedidos/components/active";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { SelectCliente } from "../components/selectCliente";
import { useCallback, useEffect, useState } from "react";
import { configApi } from "@/app/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { AlertDemo } from "@/components/alert/alert";
import { ThreeDot } from "react-loading-indicators";


interface veiculo  
 {
    codigo?:number,
    modelo:string,
    placa:string,
    marca:string,
    ano:string,
    combustivel:string,
    cliente:number,
    ativo:string
}
type cliente =
{
   codigo:number,
   nome:string
}

export default function veiculo({params}:any){

    const [ cliente, setCliente] = useState();
    const [data, setData ] = useState<veiculo | null> (null);
    const [ placa, setPlaca] = useState<string | null >();
    const [ modelo, setModelo] = useState<string>();
    const [ marca, setMarca ] = useState<string>();
    const [ ano, setAno ] = useState<string>();
    const [ combustivel, setCombustivel ] = useState<string>();
    const [ msgAlert, setMsgAlert] = useState<string>('');
    const [ visibleAlert, setVisibleAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Add loading state for initial fetch

    const router = useRouter();

     const { user, loading  }: any = useAuth();
    const api = configApi();



    
 function delay(ms) {
    return new Promise((resolve)=>{ setTimeout( resolve,ms )})
   }

    async function busca(){
        try{
            setIsLoading(true);

            await delay(2000)
           let result = await api.get('/veiculos', {
                 headers:{ token: user.token },
                    params:{ codigo:  params.codigo  }
                })

                if( result.status === 200 ){
                    if(result.data.length > 0 ){
                      setData(result.data[0])
                      console.log(result.data[0])
                    }

                }

        }catch(e){
            console.error("Erro ao consultar Veículo:", e);
            setMsgAlert(`${e.reponse.data.msg}`);
            setVisibleAlert(true)
        } finally{
            setIsLoading(false)
        }
    }
    
    const handleInputChange = (field: keyof veiculo, value: string | number) => {
        setData(prevData => {
            if (!prevData) return null;
            return { ...prevData, [field]: value };
        });
    };

    const handleClientChange = (cliente:any)=>{
            setData((prev)=> {
                if(!prev) return;
                return { ...prev, cliente:cliente.codigo}
            })

    }

    useEffect(() => {
   
        if (!params.codigo) {
            router.push('/veiculos');  
            return;
        }
        busca();

    }, [ params.codigo, user, router ]);  


    async  function gravar( ){
            setIsLoading(true)
            try{
                let result = await api.put('/veiculo',  data,{
                     headers:{ token:  user.token   }
                })
                if(result.status === 200 ){
                    setVisibleAlert(true);
                    setMsgAlert(`Veículo ${ data && data.modelo} atualizado com Sucesso!`);
                }

            }catch(e){
                console.error("Erro ao atualizar Veículo:", e);
                setMsgAlert(`${e.reponse.data.msg}`);
                setVisibleAlert(true);
            }finally{
                setIsLoading(false)

            }
    }

  
     const handleActive = useCallback((param: 'S' | 'N') => {
          setData((prevData) => {
             if (!prevData) return prevData;
             return { ...prevData, ativo: param };
         });
     }, []);

     if (isLoading) {
        return (
                  <div className=" min-h-screen flex items-center justify-center flex-col sm:ml-14 p-4 bg-slate-100"  >
                  <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
                </div>
        );
     }

     if (!data && !isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen p-4">
                <p className="text-xl text-red-600 mb-4">veiculo não encontrado ou erro ao carregar.</p>
                <Button onClick={() => router.push('/veiculos')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Veiculos
                </Button>
                <AlertDemo content={msgAlert} title="Aviso" visible={visibleAlert} setVisible={setVisibleAlert} />
            </div>
        );
    }

 
    return(
        <div className= " min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full  justify-itens-center items-center    bg-slate-100"  >
       
       
          <AlertDemo content={msgAlert} title="Aviso" visible={visibleAlert} setVisible={setVisibleAlert} to={'/veiculos'}/>
       
        <div className="w-5/6 p-8 mt-22 h-screen    rounded-lg bg-white shadow-md " >

              <div className="flex justify-between items-center mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Detalhes do Veículo
                        </h1>
                        <Button variant="outline" onClick={() => router.push('/veiculos')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                        </Button>
               </div>

                   


          <div className="m-2">     
           <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Detalhes Principais</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                                <div>
                                    <Label   className="text-sm font-medium text-gray-600">Modelo :</Label>
                                    <Input
                                        defaultValue={data?.modelo }
                                        className="mt-1"
                                        //onChange={(e) => setModelo(e.target.value ) }
                                        
                                        onChange={(e) => handleInputChange('modelo',  e.target.value ) }

                                    />
                                </div>
                                <div>
                                    <Label   className="text-sm font-medium text-gray-600">Placa  :</Label>
                                    <Input
                                         defaultValue={data?.placa ?? ''}
                                         //onChange={(e) => setPlaca( e.target.value )}
                                        onChange={(e) => handleInputChange('placa',  e.target.value ) }
                                        className="mt-1"
                                        placeholder="ABC1D34"
                                    />
                                </div>
                                <div>
                                    <Label   className="text-sm font-medium text-gray-600">Marca:</Label>
                                    <Input
                                     
                                        type="text"
                                        defaultValue={data?.marca ?? ''}
                                        //onChange={(e) => setMarca(e.target.value )}
                                        onChange={(e) => handleInputChange('marca',  e.target.value ) }
                                        className="mt-1"
                                        placeholder=""
                                    />
                                </div>
                                <div>
                                    <Label  className="text-sm font-medium text-gray-600">Ano:</Label>
                                    <Input
                                        placeholder="2000"
                                        defaultValue={data?.ano ?? ''}
                                        //onChange={(e) => setAno( e.target.value )}
                                        onChange={(e) => handleInputChange('ano',  e.target.value ) }

                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label   className="text-sm font-medium text-gray-600">Combustivel:</Label>
                                    <Input
                                        id="gtin"
                                        placeholder="Gasolina"
                                        defaultValue={data?.combustivel ?? ''}
                                        onChange={(e) => handleInputChange('combustivel',  e.target.value ) }
                                        //onChange={(e) => setCombustivel( e.target.value )}

                                        className="mt-1"
                                    />
                                </div>
                           
                                <div>
                                <SelectCliente codigoCliente={data && data?.cliente} selectCliente={handleClientChange}/>
                                </div>


                                {/* Active Component */}
                                <div className="md:col-span-2 pt-4">
                                    <Label className="text-sm font-medium text-gray-600 mb-2 block">Status: { data?.ativo} </Label>
                                    {    
                                    <Active active={data?.ativo} handleActive={handleActive} />
                                }
                                </div>
                            </CardContent>
           </Card>
          </div>
         </div>

              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md p-3 z-10 sm:ml-14">
                          <div className="w-full max-w-7xl mx-auto flex justify-end">
                              <Button
                                   onClick={gravar}
                                //  disabled={isSaving || isLoading} // Also disable during initial load
                                  size="lg"
                              >
                                  <Save className="mr-2 h-5 w-5" />
                                  Salvar Alterações 
                              </Button>
                          </div>
                      </div>
     </div>

    )
}