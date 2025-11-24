'use client';

import { UseDateFunction } from '@/app/hooks/useDateFunction'; // Assuming correct path
import { Active } from '@/app/pedidos/components/active'; // Assuming correct path
import { configApi } from '@/app/services/api'; // Assuming correct path
import { AlertDemo } from '@/components/alert/alert'; // Assuming correct path
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/carousel'; // Assuming correct path
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import { Input } from '@/components/ui/input'; // Import Shadcn Input
import { Label } from '@/components/ui/label'; // Import Shadcn Label
import { Textarea } from '@/components/ui/textarea'; // Import Shadcn Textarea
import { Button } from '@/components/ui/button'; // Import Shadcn Button
import { useAuth } from '@/contexts/AuthContext'; // Assuming correct path
import { Save, ArrowLeft, ChartCandlestick, Store, Loader2, UploadCloud, AlertTriangle } from 'lucide-react'; // Add ArrowLeft for back button
import { useRouter } from 'next/navigation'; // Use useRouter for back navigation
import { useCallback, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area'; // Ensure ScrollArea is imported
import SelectCategorias from '../components/selectCategorias';
import SelectMarca from '../components/selectMarcas';
import { ThreeDot } from 'react-loading-indicators';
import { resolve } from 'path';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';

// Define interfaces (assuming these match your API response)
type grupo=
{
    id:number;
    codigo:number;
    descricao:string;
}

type marca = {
id:number;
codigo:number;
descricao:string;
}
interface Produto {
    codigo: number;
    descricao: string;
    grupo: grupo ;
    marca:marca;
    preco: number;
    estoque: number;
    sku?: string | null; 
    num_fabricante?: string | null;
    class_fiscal?: string | null;  
    ncm?: string | null;  
    observacoes1?: string | null;
    observacoes2?: string | null;
    observacoes3?: string | null;
    ativo: 'S' | 'N';
    data_recadastro?: string; 
    data_cadastro?: string; 
}

interface FotoProduto {
    sequencia: number;
    link: string;
}


export default function Prod({ params }: { params: { codigo: string } }) { // Add type for params

    const [data, setData] = useState<any>(null); // Initialize with null
    const [fotos, setFotos] = useState<FotoProduto[]>([]);
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [msgAlert, setMsgAlert] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true); // Add loading state for initial fetch
    const [isSaving, setIsSaving] = useState(false); // Add saving state
    const [predicting, setPredicting] = useState(false);
    const [categoryId, setCategoryId] = useState("");
    const [categoryName, setCategoryName] = useState("");
        
    const api = configApi();
    const useDateService = UseDateFunction();
    const { user, loading  }: any = useAuth();
    const router = useRouter();


     const [showMlModal, setShowMlModal] = useState(false);
    const [mlLoading, setMlLoading] = useState(false);
    
    // Formulario ML (Separado do produto original para permitir ajustes sem salvar no ERP)
    const [mlTitle, setMlTitle] = useState("");
    const [mlPrice, setMlPrice] = useState("");
    const [mlStock, setMlStock] = useState("");
    const [mlListingType, setMlListingType] = useState("gold_special"); // Clássico
    const [mlCondition, setMlCondition] = useState("new");

    useEffect(() => {
       
        async function busca() {
            if (!loading && !user.token) {
                router.push('/login');  
              }
            let cod = Number(params.codigo);
            try {
                const [dadosRes, fotosRes] = await Promise.all([
                    api.get(`/produto/${cod}`, {
                        headers: {
                             token:  user.token 
                            },
                            
                       
                    }),
                    api.get(`/next/fotos`,
                         {
                           headers: { token:  user.token  },
                           params:{
                            codigo: cod
                           }
                        }
                    )
                ]);
                console.log(dadosRes)

                if (dadosRes.status === 200 && dadosRes.data?.length > 0) {
                    setData(dadosRes.data[0]);
                } else {
                     console.warn("Produto não encontrado");
                     setMsgAlert(`Produto com código ${params.codigo} não encontrado.`);
                     setVisibleAlert(true); 
                     setData(null);  
                }

                if (fotosRes.status === 200) {
                    setFotos(fotosRes.data || []);
                }

            } catch (error) {
                console.error("Erro ao buscar dados do produto:", error);
                setMsgAlert("Erro ao carregar dados do produto.");
                setVisibleAlert(true);
                 setData(null);  
            } finally {
                setIsLoading(false);
            }
        }
             busca();
    }, [ params.codigo, user, router ]);  

 // --- 1. PREDITOR DE CATEGORIA ---
    // Assim que a tela abre, tenta adivinhar a categoria pelo nome do produto
    useEffect(() => {
        async function guessCategory() {
            setPredicting(true);
            try {
                // Chama seu backend que consulta a API domain_discovery do ML
                const response = await api.post('/ml/tools/predict-category', { title: data.descricao }, {
                    headers: { token: user.token }
                });
                
                if (response.data && response.data.category_id) {
                    setCategoryId(response.data.category_id);
                    setCategoryName(response.data.category_name);
                }
            } catch (error) {
                console.error("Erro ao prever categoria", error);
            } finally {
                setPredicting(false);
            }
        }
        guessCategory();
    }, [data]);


    const handleInputChange = (field: keyof Produto, value: string | number) => {
        setData((prevData:any) => {
            if (!prevData) return null;
            return { ...prevData, [field]: value };
        });
    };

    const handleCategory =(categoria:grupo) => {
        setData((prevData:any) => {
            if (!prevData) return null;
            return { ...prevData, grupo: categoria };
        });
    }
    const handleMarca =(marca:marca) => {
        setData((prevData:any) => {
            if (!prevData) return null;
            return { ...prevData, marca: marca };
        });
    }


    const gravar = async () => {
        if (!data) return;
        setIsSaving(true);

        const dataParaGravar: Produto = {
            ...data, 
            data_recadastro: useDateService.obterDataHoraAtual(),
        };

          console.log("Enviando para API:", dataParaGravar);  
    
          try {
            let result = await api.put('/produto', dataParaGravar,{
                headers:{ token:  user.token }

            });
            if (result.status === 200 && result.data.codigo > 0) {
                console.log(result)
                setVisibleAlert(true);
                setMsgAlert(`Produto ${data.codigo} Alterado com Sucesso!`);
            }
        } catch(e:any) {
            console.error("Erro ao gravar produto:", e);
            setMsgAlert(`Erro ao salvar alterações do produto ${data.codigo}. ${e.response.data.msg}`);
            setVisibleAlert(true);
        } finally {
             setIsSaving(false);  
        }
              


    };

    const handleActive = useCallback((param: 'S' | 'N') => {
         setData((prevData:any) => {
            if (!prevData) return prevData;
            return { ...prevData, ativo: param };
        });
    }, []);

   //  useEffect(() => {
   //     if (!loading && !user.token) {
   //       router.push('/login');  
   //     }
   //   }, [user, loading, router]);
    
   const handleOpenMlModal = () => {
        if (!data) return;
        
        // Copia dados do produto para o state do formulário ML
        setMlTitle(data.descricao);
        setMlPrice(String(data.preco));
        setMlStock(String(data.estoque));
        
        // Abre o modal
        setShowMlModal(true);
    };

    // --- FUNÇÃO 2: Enviar para API ---
    const handlePublishToML = async () => {
        if (!categoryId) {
            setMsgAlert("A categoria do Mercado Livre não foi identificada automaticamente. Verifique o título.");
            setVisibleAlert(true);
            return;
        }

        setMlLoading(true);
        try {
            // Mapeia as fotos do objeto que você já tem
            const pictureUrls = fotos.map(f => f.link);

            // Payload conforme definimos no Backend anteriormente
            const payload = {
                title: mlTitle,
                price: Number(mlPrice),
                available_quantity: Number(mlStock),
                category_id: categoryId,
                listing_type_id: mlListingType,
                condition: mlCondition,
                description: `Produto: ${mlTitle}\n\n${data.observacoes1 || ''}\n${data.observacoes2 || ''}`,
                pictures: pictureUrls.length > 0 ? pictureUrls : [],
                // Tenta mandar marca/modelo se existirem, senão vai genérico
                brand: data.marca?.descricao || "Genérica",
                model: "Padrão",
                ean: data.num_fabricante || ""
            };

            await api.post('/ml/items', payload, {
                headers: { token: user.token }
            });

            setShowMlModal(false);
            setMsgAlert("Produto enviado para o Mercado Livre com sucesso!");
            setVisibleAlert(true);

        } catch (error: any) {
            console.error(error);
            const erroMsg = error.response?.data?.msg || "Erro desconhecido ao publicar.";
            setMsgAlert(`Erro no Mercado Livre: ${erroMsg}`);
            setVisibleAlert(true);
        } finally {
            setMlLoading(false);
        }
    };
   
      if (loading) {
        return (
          <div className="flex justify-center items-center min-h-screen">
           <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
          </div>
        );
      }
    
      if (!user) {
        // Optional: You can show a message or just rely on the redirect
        return (
          <div className="flex justify-center items-center min-h-screen">
           <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
            {/* Or return null; the redirect will happen */}
          </div>
        );
      }

    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
               <div className="flex justify-center my-4"> {/* Container para centralizar */}
               <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
             </div>
           </div>

        );
     }

     if (!data && !isLoading) {
         return (
             <div className="flex flex-col justify-center items-center min-h-screen p-4">
                 <p className="text-xl text-red-600 mb-4">Produto não encontrado ou erro ao carregar.</p>
                 <Button onClick={() => router.push('/produtos')}>
                     <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Produtos
                 </Button>
                 <AlertDemo content={msgAlert} title="Aviso" visible={visibleAlert} setVisible={setVisibleAlert} />
             </div>
         );
     }


    return (
 <div className= " h-screen flex flex-col sm:ml-14 p-4 w-full   justify-itens-center items-center    bg-slate-100"  >

            <ScrollArea className="flex-1 w-full max-w-screen-2xl bg-white rounded-lg shadow-md mb-20">

                <AlertDemo content={msgAlert} title="Aviso" visible={visibleAlert} setVisible={setVisibleAlert} to={'/produtos'}/>

                <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 pb-24"> {/* Added pb-24 */}

                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-xl md:text-2xl font-bold font-sans text-gray-800">
                            Detalhes do Produto
                        </h1>
                       
                        <div className='flex gap-3'>
                           <Button variant="outline" onClick={() => router.push('/produtos')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                          </Button>
                              <Button variant="outline" onClick={() => router.push(`/produtos/${data.codigo}/tributacao`)}>
                            <ChartCandlestick  className="mr-2 h-4 w-4" />
                            Tributação
                        </Button>
                        </div>
                       
                    </div>
                    
            <Dialog open={showMlModal} onOpenChange={setShowMlModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-800">
                            <Store className="h-5 w-5" /> Publicar no Mercado Livre
                        </DialogTitle>
                        <DialogDescription>
                            Revise os dados antes de criar o anúncio. Isso não altera o produto no seu ERP.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        
                        {/* Aviso de Categoria */}
                        <div className="bg-slate-100 p-3 rounded-md border flex items-center gap-3">
                            <AlertTriangle className="text-yellow-600 h-5 w-5" />
                            <div className="text-sm">
                                <span className="font-bold text-gray-700">Categoria Detectada:</span>
                                <br />
                                {categoryName || "Carregando..."} <span className="text-xs text-gray-500">({categoryId})</span>
                            </div>
                        </div>

                        {/* Título */}
                        <div className="grid gap-2">
                            <Label htmlFor="ml-title">Título do Anúncio (Máx 60 chars)</Label>
                            <Input 
                                id="ml-title" 
                                value={mlTitle} 
                                onChange={(e) => setMlTitle(e.target.value)}
                                maxLength={60} 
                            />
                            <p className="text-xs text-right text-gray-400">{mlTitle.length}/60</p>
                        </div>

                        {/* Preço e Estoque */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ml-price">Preço (R$)</Label>
                                <Input 
                                    id="ml-price" 
                                    type="number" 
                                    value={mlPrice} 
                                    onChange={(e) => setMlPrice(e.target.value)} 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ml-stock">Estoque ML</Label>
                                <Input 
                                    id="ml-stock" 
                                    type="number" 
                                    value={mlStock} 
                                    onChange={(e) => setMlStock(e.target.value)} 
                                />
                            </div>
                        </div>

                        {/* Configurações ML */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Tipo de Anúncio</Label>
                                <Select value={mlListingType} onValueChange={setMlListingType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gold_special">Clássico (Exposição Alta)</SelectItem>
                                        <SelectItem value="gold_pro">Premium (Parc. s/ Juros)</SelectItem>
                                        <SelectItem value="free">Grátis</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Condição</Label>
                                <Select value={mlCondition} onValueChange={setMlCondition}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">Novo</SelectItem>
                                        <SelectItem value="used">Usado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Simulador de Taxas (Opcional visual) */}
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded text-right">
                            * Taxas podem variar conforme a categoria e reputação.
                        </div>

                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMlModal(false)} disabled={mlLoading}>
                            Cancelar
                        </Button>
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handlePublishToML} 
                            disabled={mlLoading || !categoryId}
                        >
                            {mlLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" /> Confirmar Envio
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
                    <Card>
                        <CardContent className="p-4 md:p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-2 justify-between">
                                <div>
                                   <Label htmlFor="codigo" className=" text-xs md:text-lg font-semibold text-gray-700">Código:</Label>
                                   <span id="codigo" className="text-xs md:text-lg font-bold text-gray-900"> {data.codigo}</span>
                                </div>
     
                                <div  >
                                  <Label htmlFor="codigo" className=" text-xs md:text-lg  font-semibold text-gray-700">Data cadastro:</Label>
                                   <span id="codigo" className=" text-xs md:text-lg font-bold text-gray-900">
                                     {  new Date(data?.data_cadastro).toLocaleDateString('pt-br', { year:'numeric',month:'numeric', day:'2-digit'})}
                                     </span>
                                      

                                </div>
                            </div>

                   

                            <div>
                                <Label htmlFor="descricao" className="text-base font-medium text-gray-600 mb-1 block">Descrição:</Label>
                                <Input
                                    id="descricao"
                                    value={data.descricao || ''}
                                    className="text-base"
                                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>


                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg">Imagens</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center p-4 min-h-[200px]">
                                {fotos.length > 0 ? (
                                    <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-xs">
                                        <CarouselContent>
                                            {fotos.map((foto) => (
                                                <CarouselItem key={foto.sequencia}>
                                                    <img
                                                        className="object-contain aspect-square w-full h-auto rounded-md"
                                                        src={String(foto.link)}
                                                        alt={`Produto ${data.codigo} - Imagem ${foto.sequencia}`}
                                                        onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}
                                                    />
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                                    </Carousel>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        Nenhuma foto encontrada.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Detalhes Principais</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                                <div>
                                    <Label htmlFor="preco" className="text-sm font-medium text-gray-600">Preço (R$):</Label>
                                    <Input
                                        id="preco"
                                        type="number"
                                        step="0.01"
                                        value={data.preco ?? ''}
                                        onChange={(e) => handleInputChange('preco', Number(e.target.value))}
                                        className="mt-1"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="estoque" className="text-sm font-medium text-gray-600">Estoque:</Label>
                                    <Input
                                        id="estoque"
                                        type="number"
                                        step="1"
                                        value={data.estoque ?? ''}
                                        onChange={(e) => handleInputChange('estoque', Number(e.target.value))}
                                        className="mt-1"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sku" className="text-sm font-medium text-gray-600">SKU:</Label>
                                    <Input
                                        id="sku"
                                        value={data.sku || ''}
                                        onChange={(e) => handleInputChange('sku', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="gtin" className="text-sm font-medium text-gray-600">GTIN / Nº Fabricante:</Label>
                                    <Input
                                        id="gtin"
                                        value={data.num_fabricante || ''}
                                        onChange={(e) => handleInputChange('num_fabricante', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <Label htmlFor="ncm" className="text-sm font-medium text-gray-600">NCM / Class. Fiscal:</Label>
                                    <Input
                                        id="ncm"
                                        value={data.class_fiscal || ''}
                                        onChange={(e) => handleInputChange('class_fiscal', e.target.value)}
                                        className="mt-1"
                                        maxLength={8}
                                        placeholder="00000000"
                                    />
                                </div>
 
                                <div>
                                  <Label htmlFor="ncm" className="text-sm font-medium text-gray-600">Categoria:  { data.grupo &&  data.grupo.descricao }</Label>
                                   <SelectCategorias setCodigoCategoria={  handleCategory } codigoCategoria={ data.grupo ? data.grupo.codigo : null} />
                                 </div>
                                <div>
                                  <Label htmlFor="ncm" className="text-sm font-medium text-gray-600"> Marca:  { data.marca &&  data.marca.descricao }</Label>
                                  <SelectMarca setMarca={handleMarca} codigoMarca={data.marca ? data.marca.codigo : null} />
                                 </div>



                                {/* Active Component */}
                                <div className="md:col-span-2 pt-4">
                                    <Label className="text-sm font-medium text-gray-600 mb-2 block">Status:</Label>
                                    <Active active={data?.ativo} handleActive={handleActive} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>


                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Observações</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 p-4">
                            <div>
                                <Label htmlFor="obs1" className="text-sm font-medium text-gray-600">Observação 1:</Label>
                                <Textarea
                                    id="obs1"
                                    value={data.observacoes1 || ''}
                                    onChange={(e) => handleInputChange('observacoes1', e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="obs2" className="text-sm font-medium text-gray-600">Observação 2:</Label>
                                <Textarea
                                    id="obs2"
                                    value={data.observacoes2 || ''}
                                    onChange={(e) => handleInputChange('observacoes2', e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="obs3" className="text-sm font-medium text-gray-600">Observação 3:</Label>
                                <Textarea
                                    id="obs3"
                                    value={data.observacoes3 || ''}
                                    onChange={(e) => handleInputChange('observacoes3', e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>


                </div>  

            </ScrollArea> {/* End ScrollArea */}

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md p-3 z-10 sm:ml-14">
                <div className="w-full max-w-7xl mx-auto flex justify-between">
                   
                 <Button 
                    className='bg-[#185FED] gap-2'
                    onClick={handleOpenMlModal} // <--- ALTERADO AQUI
                    disabled={isLoading || predicting} // Desabilita se estiver carregando ou prevendo categoria
                > 
                    {predicting ? <Loader2 className="animate-spin h-4 w-4"/> : <Store />}
                    Enviar para marketplace
                </Button>

                    <Button
                        onClick={gravar}
                        disabled={isSaving || isLoading} // Also disable during initial load
                        size="lg"
                    >
                        <Save className="mr-2 h-5 w-5 " />
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
 
                </div>
            </div>

        </div> // End Main Container
    );
}