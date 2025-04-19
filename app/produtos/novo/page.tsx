 
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
 import { Save, ArrowLeft } from 'lucide-react'; // Add ArrowLeft for back button
 import { useRouter } from 'next/navigation'; // Use useRouter for back navigation
 import { useCallback, useEffect, useState } from 'react';
 import { ScrollArea } from '@/components/ui/scroll-area'; // Ensure ScrollArea is imported
import SelectCategorias from '../components/selectCategorias';
import SelectMarca from '../components/selectMarcas';
 
 interface Produto {
    id?:number;
     codigo?: number;
     descricao: string;
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
     cst:string;
     grupo:number;
     marca?:number;
     num_original?:string;
     origem?:string | number;
     tipo:number
 }
 
 interface FotoProduto {
     sequencia: number;
     link: string;
 }
 
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
 
interface FotoProduto {
    sequencia: number;
    link: string;
}

 export default function NovoProduto() { // Add type for params
 
     const [data, setData] = useState<Produto | null>(null); // Initialize with null
     const [fotos, setFotos] = useState<FotoProduto[]>([]);
     const [visibleAlert, setVisibleAlert] = useState(false);
     const [msgAlert, setMsgAlert] = useState<string>('');
     const [isLoading, setIsLoading] = useState(true); // Add loading state for initial fetch
     const [isSaving, setIsSaving] = useState(false); // Add saving state
 
     const api = configApi();
     const useDateService = UseDateFunction();
     const { user, loading  }: any = useAuth();
     const router = useRouter();
 
 
 
     
     const handleActive = useCallback((param: 'S' | 'N') => {
          setData((prevData) => {
             if (!prevData) return prevData;
             return { ...prevData, ativo: param };
         });
     }, []);
 

     useEffect(()=>{

            function init (){
                let aux:Produto ={
                    ativo:'S',
                    class_fiscal:'0000.00.00',
                     cst:'00',
                     data_cadastro:useDateService.obterDataAtual(),
                     data_recadastro: useDateService.obterDataHoraAtual(),
                     descricao:'',
                     estoque:0,
                     grupo:0,
                     id:0,
                     marca:0,
                     num_fabricante:'',
                     num_original:'',
                     observacoes1:'',
                     observacoes2:'',
                     observacoes3:'',
                     origem:0,
                     preco:0,
                     sku:'',
                     tipo:0,
                }

                    setData(aux)
            }
            init();

     },[])

 
 async function gravar (){
    try {
        let result = await api.post('/produto', data ,{
            headers:{ cnpj: Number(user.cnpj)}
        });
        if (result.status === 200 && result.data.codigo > 0) {
            console.log(result)
            setVisibleAlert(true);
            setMsgAlert(`Produto ${data?.descricao} cadastrado com Sucesso!`);
        }
    } catch(e) {
        console.error("Erro ao gravar produto:", e);
        setMsgAlert(`Erro ao salvar alterações do produto ${data?.codigo}.`);
        setVisibleAlert(true);
    } finally {
         setIsSaving(false);  
    }
          

 }


     const handleCategory =(categoria:grupo) => {
        setData(prevData => {
            if (!prevData) return null;
            return { ...prevData, grupo: categoria };
        });
    }

    const handleMarca =(marca:marca) => {
        setData(prevData  => {
            if (!prevData) return null;
            return { ...prevData, marca: marca };
        });
    }

    const handleInputChange = (field: keyof Produto, value: string | number) => {
         setData(prevData => {
            if (!prevData) return null;
            
             return { ...prevData, [field]: value };
         });
     };



     return (
       <div className= " h-screen flex flex-col sm:ml-14 p-4 w-full   justify-itens-center items-center    bg-slate-100"  >
 
 
             <ScrollArea className="flex-1 w-full max-w-screen-2xl bg-white rounded-lg shadow-md mb-20">
 
                 <AlertDemo content={msgAlert} title="Aviso" visible={visibleAlert} setVisible={setVisibleAlert} to={'/produtos'}/>
 
                 <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 pb-24"> {/* Added pb-24 */}
 
                     <div className="flex justify-between items-center mb-2">
                         <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                             Detalhes do Produto
                         </h1>
                         <Button variant="outline" onClick={() => router.push('/produtos')}>
                             <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                         </Button>
                     </div>
 
                     <Card>
                         <CardContent className="p-4 md:p-6 flex flex-col gap-4">
                             <div className="flex items-center gap-2">
                                 <Label htmlFor="codigo" className="text-lg font-semibold text-gray-700">Código:</Label>
                                 <span id="codigo" className="text-lg font-bold text-gray-900">{data?.codigo}</span>
                             </div>
                             <div>
                                 <Label htmlFor="descricao" className="text-base font-medium text-gray-600 mb-1 block">Descrição:</Label>
                                 <Input
                                     id="descricao"
                                     defaultValue={data?.descricao || ''}
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
                                                         alt={`Produto ${data?.codigo} - Imagem ${foto?.sequencia}`}
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
                                         defaultValue={data?.preco ?? ''}
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
                                         defaultValue={data?.estoque ?? ''}
                                         onChange={(e) => handleInputChange('estoque', Number(e.target.value))}
                                         className="mt-1"
                                         placeholder="0"
                                     />
                                 </div>
                                 <div>
                                     <Label htmlFor="sku" className="text-sm font-medium text-gray-600">SKU:</Label>
                                     <Input
                                         id="sku"
                                         defaultValue={data?.sku || ''}
                                         onChange={(e) => handleInputChange('sku', e.target.value)}
                                         className="mt-1"
                                     />
                                 </div>
                                 <div>
                                     <Label htmlFor="gtin" className="text-sm font-medium text-gray-600">GTIN / Nº Fabricante:</Label>
                                     <Input
                                         id="gtin"
                                         defaultValue={data?.num_fabricante || ''}
                                         onChange={(e) => handleInputChange('num_fabricante', e.target.value)}
                                         className="mt-1"
                                     />
                                 </div>
                                 <div className="md:col-span-1">
                                     <Label htmlFor="ncm" className="text-sm font-medium text-gray-600">NCM / Class. Fiscal:</Label>
                                     <Input
                                         id="ncm"
                                         defaultValue={data?.class_fiscal || ''}
                                         onChange={(e) => handleInputChange('class_fiscal', e.target.value)}
                                         className="mt-1"
                                         maxLength={10}
                                         placeholder="00000000"
                                     />
                                 </div>

                             <div>
                                  <Label htmlFor="ncm" className="text-sm font-medium text-gray-600">Categoria:  { data?.grupo &&  data?.grupo.descricao }</Label>
                                   <SelectCategorias setCodigoCategoria={  handleCategory } codigoCategoria={ data?.grupo ? data?.grupo.codigo : null} />
                                 </div>
                                <div>
                                  <Label htmlFor="ncm" className="text-sm font-medium text-gray-600"> Marca:  { data?.marca &&  data?.marca.descricao }</Label>
                                  <SelectMarca setMarca={handleMarca} codigoMarca={data?.marca ? data?.marca.codigo : null} />
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
                                     defaultValue={data?.observacoes1 || ''}
                                     onChange={(e) => handleInputChange('observacoes1', e.target.value)}
                                     className="mt-1"
                                     rows={3}
                                 />
                             </div>
                             <div>
                                 <Label htmlFor="obs2" className="text-sm font-medium text-gray-600">Observação 2:</Label>
                                 <Textarea
                                     id="obs2"
                                     defaultValue={data?.observacoes2 || ''}
                                     onChange={(e) => handleInputChange('observacoes2', e.target.value)}
                                     className="mt-1"
                                     rows={3}
                                 />
                             </div>
                             <div>
                                 <Label htmlFor="obs3" className="text-sm font-medium text-gray-600">Observação 3:</Label>
                                 <Textarea
                                     id="obs3"
                                     defaultValue={data?.observacoes3 || ''}
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
                 <div className="w-full max-w-7xl mx-auto flex justify-end">
                     <Button
                          onClick={gravar}
                       //  disabled={isSaving || isLoading} // Also disable during initial load
                         size="lg"
                     >
                         <Save className="mr-2 h-5 w-5" />
                         {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                     </Button>
                 </div>
             </div>
 
         </div> // End Main Container
     );
 }