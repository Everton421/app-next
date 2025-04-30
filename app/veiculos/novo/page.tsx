'use client';

import { Active } from "@/app/pedidos/components/active";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { SelectCliente } from "../components/selectCliente";
import { useState } from "react";
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
    cliente:number
}

export default function veiculo(){

    const [ cliente, setCliente] = useState();
    const [data, setData ] = useState<veiculo | null> ();
    const [ placa, setPlaca] = useState<string | null >();
    const [ modelo, setModelo] = useState<string>();
    const [ marca, setMarca ] = useState<string>();
    const  [ ano, setAno ] = useState<string>();
    const [ combustivel, setCombustivel ] = useState<string>();
    const [msgAlert, setMsgAlert] = useState<string>('');
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false);  

    const router = useRouter();

     const { user, loading  }: any = useAuth();
    const api = configApi();

    async  function gravar( ){

        setIsLoading(false);

        let aux:any =
         {
            ano: ano ,
            cliente:cliente.codigo,
            combustivel:combustivel,
            marca:marca,
            modelo:modelo,
            placa:placa,
            }

            try{
                let result = await api.post('/veiculo',  aux,{
                     headers:{ token:  user.token  }
                })
                if(result.status === 200 ){
                    setVisibleAlert(true);
                    setMsgAlert(`Veículo ${aux.modelo} cadastrado com Sucesso!`);
                }

            }catch(e){
                console.error("Erro ao gravar Veículo:", e);
                setMsgAlert(`${e.reponse.data.msg}`);
                setVisibleAlert(true);
            }finally {
                setIsLoading(false);
            }
    
    
    }


    if (isLoading) {
        return (
             <div className="flex  my-4 items-center justify-center"> {/* Container para centralizar */}
                 <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
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
                                        onChange={(e) => setModelo(e.target.value )}

                                    />
                                </div>
                                <div>
                                    <Label   className="text-sm font-medium text-gray-600">Placa  :</Label>
                                    <Input
                                         defaultValue={data?.placa ?? ''}
                                         onChange={(e) => setPlaca( e.target.value )}
                                        className="mt-1"
                                        placeholder="ABC1D34"
                                    />
                                </div>
                                <div>
                                    <Label   className="text-sm font-medium text-gray-600">Marca:</Label>
                                    <Input
                                     
                                        type="text"
                                        defaultValue={data?.marca ?? ''}
                                        onChange={(e) => setMarca(e.target.value )}
                                        className="mt-1"
                                        placeholder=""
                                    />
                                </div>
                                <div>
                                    <Label  className="text-sm font-medium text-gray-600">Ano:</Label>
                                    <Input
                                        placeholder="2000"
                                        defaultValue={data?.ano ?? ''}
                                        onChange={(e) => setAno( e.target.value )}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label   className="text-sm font-medium text-gray-600">Combustivel:</Label>
                                    <Input
                                        id="gtin"
                                        placeholder="Gasolina"
                                        defaultValue={data?.combustivel ?? ''}
                                        onChange={(e) => setCombustivel( e.target.value )}
                                        className="mt-1"
                                    />
                                </div>
                           
                                <div>
                                <SelectCliente codigoCliente={0} selectCliente={setCliente}/>
                                </div>


                                {/* Active Component */}
                                <div className="md:col-span-2 pt-4">
                                    <Label className="text-sm font-medium text-gray-600 mb-2 block">Status:</Label>
                                    {    
                                 //   <Active active={data?.ativo} handleActive={handleActive} />
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
                                   Salvar  
                              </Button>
                          </div>
                      </div>
     </div>

    )
}