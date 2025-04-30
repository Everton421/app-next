// Componente pai (cliente)
'use client'

import { UseDateFunction } from "@/app/hooks/useDateFunction"
import { configApi } from "@/app/services/api"
import { AlertDemo } from "@/components/alert/alert"
import { ArrowLeft, Check, Delete, Save, ShieldCheck, ShieldClose, X } from "lucide-react"
import { redirect, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react" // Import useCallback

import { InputMask } from 'primereact/inputmask';
import { SelectPessoa } from "../select"
import { SelectVendedor } from "../selectVendedor"
import { Button } from "@/components/ui/button"
import { DateService } from "@/app/services/dateService"
import { useAuth } from "@/contexts/AuthContext"
        

export default function NovoCliente() {
    const api = configApi()
    const [data, setData] = useState(); // Inicializar como null
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [msgAlert, setMsgAlert] = useState<string>('');
    const useDateService = UseDateFunction()

    const [ nome, setNome ]       = useState<string>();
    const [ cnpj, setCnpj ]       = useState<string>();
    const [ ie, setIe ]           = useState<string>();
    const [ celular, setCelular ] = useState<string>();

    const [ cep, setCep ]                   = useState<string>('');
    const [ estado, setEstado ]             = useState<string>();
    const [ cidade, setCidade ]             = useState<string>();
    const [ endereco, setEndereco ]         = useState<string>();
    const [ bairro, setBairro ]             = useState<string>();
    const [ observcoes, setObservcoes ]     = useState<string>();
    const [ ativo, setAtivo ]               = useState<string>('S');
    const [ rota, setRota ]                 = useState<string | null >(null)
    const [ maskCnpj , setMaskCnpj ]        = useState<string  > ('')
    const [pessoa , setPessoa ]             = useState<string  > ('f')
    const [ placeholderPessoa , setPlaceholderPessoa ] = useState<string > ("000.000.000.00")
    const [ codigoVendedor, setCodigoVendedor ]     = useState<number>();

    const [ numero, setNumero ] = useState<string | null>(null);

    const [ visible, setVisible ] = useState<boolean>(false)
    const [value, setValue] = useState();
    const router = useRouter();

      const dateService = DateService();
   const { user, loading }:any = useAuth();
 
        const [ msg, setMsg ] = useState('')

 
 
 
      async function gravar (){

            if( !cep || cep === null || cep === '' ){ 
                setVisible(true)
                setMsgAlert("é necessario informar o cep para gravar!")                
            }
            
            if( !cidade || cidade === null || cidade === '' ){ 
                setVisible(true)
                setMsgAlert("é necessario informar a cidade para gravar!")                
            }

            if( !estado || estado === null || estado === '' ){ 
                setVisible(true)
                setMsgAlert("é necessario informar o estado para gravar!")                
            }

            if( !bairro || bairro === null || bairro === '' ){ 
                setVisible(true)
                setMsgAlert("é necessario informar o bairro para gravar!")                
            }
            if( !endereco || endereco === null || endereco === '' ){ 
                setVisible(true)
                setMsgAlert("é necessario informar o endereco para gravar!")                
            }
            if( !celular || celular === null || celular === '' ){ 
                setVisible(true)
                setMsgAlert("é necessario informar o celular para gravar!")                
            }
            if( !cnpj || cnpj === null || cnpj === '' ){ 
                setVisible(true)
                setMsgAlert("é necessario informar o cnpj para gravar!")                
            }
            if( !nome || nome === null || nome === '' ){ 
                setVisible(true)
                setMsgAlert("é necessario informar o nome para gravar!")                
            }

            if( !numero || numero === null || numero === '' ){ 
                setVisible(true)
                setMsgAlert("é necessario informar o numero para gravar!")                
            }
            
            const dados =
             { 
                cep: cep,
                cidade: cidade,
                estado: estado,
                bairro: bairro,
                endereco: endereco,
                celular: celular,
                cnpj: cnpj,
                nome: nome,
                ativo: ativo,
                numero:numero,
                data_cadastro: dateService.obterDataAtual(),
                data_recadastro: dateService.obterDataHoraAtual(),
                id:0
            }

          try{
 
              let  result =   await api.post('/cliente', dados ,{
              headers: { token:  user.token }
            }

              )
              if( result.status === 200 && !result.data.erro){
                setVisible(true)
                setMsgAlert('Cliente cadastrado com sucesso!')
                setRota('/clientes')
              }
              if( result.status === 200 &&  result.data.erro){
                setVisible(true)
                setMsgAlert(result.data.msg)
              }
                  console.log(result)
          }catch(e:any){
                  console.log(e.response.data);
                  setVisible(true)
                  setMsgAlert('ocorreu um erro ao tentar gravar o cliente!')  
              }
            console.log(dados)
    }


       // Usar useCallback para otimizar e evitar recriações desnecessárias da função
       const handleActive = useCallback((param: string) => {
        setData((prevData:any) => {
            if (!prevData) return prevData; // Evita erros se prevData for null

            return {
                ...prevData,
                ativo: param,
            };
        });
    }, []);

 
 

    useEffect(()=>{
            if( pessoa === 'j'  ){
             setMaskCnpj("99.999.999/9999-99")
             setPlaceholderPessoa("00.000.000/0000-00")
            }
            if( pessoa === 'f'  ){
                setMaskCnpj("999.999.999.99")
             setPlaceholderPessoa("000.000.000.00")

            }
    },[pessoa ])
//////////////////////////
     
const handlePessoaChange = (value: string) => {
    setPessoa(value);
    console.log('Pessoa selecionada:', value);
  };

  const handleVendedorChange = (value:any ) => {
    setCodigoVendedor(Number(value));
  };

     
    return (
        <div className=" min-h-screen flex  flex-col  sm:ml-14 p-4    bg-slate-100"  >
            <AlertDemo content={msgAlert} title="titulo" visible={visible} setVisible={setVisible} to={rota} />

            <div className=" flex flex-row justify-between ">
                <div className="bg-white  max-h-10 p-2 rounded-md shadow-md  ">
                    <span className="  text-lg text-gray-600 font-bold font-sans "  >
                        data de cadastro: { dateService.obterDataAtual()}
                    </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                        <Button variant="outline" onClick={() => router.push('/clientes')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                        </Button>
                    </div>

            </div>

            <div className="flex flex-row items-center w-full mt-5 ">
                <div className=" w-full ">
                    <span className="  text-lg text-gray-600 font-bold font-sans m-2"  >
                        nome:
                    </span>
                    
                    <input
                             className=" p-2 w-3/4 text-lg font-bold  shadow-md rounded-md"
                             placeholder=" "
                             onChange={(v)=> setNome(v.target.value)}
                    />

          
                </div>

                <div className=" flex w-full items-center justify-between ">
                    <span className="  text-lg text-gray-600 font-bold font-sans m-2"  >
                        pessoa:
                    </span>
                    <SelectPessoa  defaultTipoPessoa={pessoa}   onchange={handlePessoaChange} />

                    <span className="  text-lg text-gray-600 font-bold font-sans m-2"  >
                        CNPJ/CPF:
                    </span>
                       <InputMask
                        mask={maskCnpj}  
                        placeholder={placeholderPessoa}
                        onChange={(v:any)=> setCnpj(v.target.value)} 
                        className=" p-2 text-lg w-1/2 text-gray-600 font-bold font-sans shadow-md rounded-md"
                        />
  
                </div>
            </div>
            <div className="w-full flex flex-row ">
                <div className="  w-full  mt-2 " >
                    <span className="  text-lg text-gray-600 font-bold font-sans m-2 "  >
                        IE/RG:
                    </span>
                    <input
                        className="  p-2 text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                        onChange={(v)=> setIe(v.target.value)}
                    />
                     
                </div>

                <div className="  w-full mt-2 " >
                    <span className="  text-lg text-gray-600 font-bold font-sans m-2"  >
                        celular:
                    </span>
              
                      <InputMask
                      ///  defaultValue={data?.celular}
                        mask="(99) 99999-9999"  
                        placeholder="() 00000-0000"
                        onChange={(v)=> setCelular(String(v.target.value))} 
                        className=" p-2 text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"

                        />
                </div>
            </div>

            <div className="  w-full mt-2" >
                <span className="  text-lg text-gray-600 font-bold font-sans m-2 "  >
                    vendedor:  {codigoVendedor}
                </span>
                                <SelectVendedor  defaultVendedor={codigoVendedor} onChangeVendedor={handleVendedorChange}   />
                
            </div>

            <div className="w-full mt-5">
                <span className="  text-lg text-gray-600 font-bold font-sans "  >
                    Endereço
                  </span>
                <hr className=" border-gray-600 " />

                <div>
                    <div className=" flex flex-row mt-5 justify-around">
                        <div>
                            <span className="  text-lg text-gray-600 font-bold font-sans "  > cep: </span>
                          
                          {  /*<input
                                className=" p-2 text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                                placeholder="00000-000"
                                defaultValue={data?.cep}
                                  onChange={(v)=> setCep(v.target.value)}
                                
                            /> */}
                        <InputMask
                           className=" p-2 text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                           placeholder="00000-000"
                           mask="99999-999"
                             onChange={(v:any)=> setCep(v.target.value)}
                            />
                        </div>

                        <div>
                            <span className="  text-lg text-gray-600 font-bold font-sans "  > estado: </span>
                            <input
                                className=" p-2 text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                                placeholder="Ex.: PR"
                                onChange={(v:any)=> setEstado(v.target.value)}
                            
                            />
                        </div>

                        <div>
                            <span className="  text-lg text-gray-600 font-bold font-sans "  > cidade: </span>
                            <input
                                className=" p-2 text-lg text-gray-600 font-bold font-sans shadow-md rounded-md"
                                placeholder="Ex.: Maringa"
                                onChange={(v)=> setCidade(v.target.value)}

                            />
                        </div>
                    </div>

                    <div className=" flex flex-row mt-5 justify-around  w-full">
                        <div className="w-full">
                            <span className="  text-lg text-gray-600 font-bold font-sans "  > endereco: </span>
                            <input
                                className=" p-2 text-lg text-gray-600 font-bold font-sans shadow-md rounded-md w-3/5"
                                placeholder=""
                                onChange={(v)=> setEndereco(v.target.value)}

                            />
                        </div>
                        <div className="w-full">
                            <span className="  text-lg text-gray-600 font-bold font-sans "  > bairro: </span>
                            <input
                                className=" p-2 text-lg text-gray-600 font-bold font-sans shadow-md rounded-md w-1/3"
                                placeholder=" "
                                onChange={(v)=> setBairro(v.target.value)}
                            
                            />
                        </div>
                        <div className="w-full">
                            <span className="  text-lg text-gray-600 font-bold font-sans "  > numero: </span>
                            <input
                                className=" p-2 text-lg text-gray-600 font-bold font-sans shadow-md rounded-md w-1/3"
                                onChange={(v)=> setNumero(v.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <hr className=" border-gray-600 mt-5 " />

            <div className=" flex flex-col mt-5" >
                <span className="  text-lg text-gray-600 font-bold font-sans "  >
                    observações:
                </span>
                <textarea
                    className="w-4/5 rounded-md shadow-md"
                    onChange={(v)=> setObservcoes(v.target.value)}
                />
            </div>


            <div className=" bg-white p-2  sm:ml-14  fixed bottom-0 left-0 right-0 rounded-xl shadow-md  ">
                <div className=" w-full items-end justify-around flex ">
                    <button className="bg-black flex rounded-xl gap-1 p-2 " onClick={() => gravar()}>
                        <span className="text-white font-bold"> gravar </span>
                        <Save size={25} color="#FFF" />
                    </button>
                </div>
            </div>
        </div>
    );
}