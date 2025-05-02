 'use client';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { configApi } from '../services/api'; // Assuming correct path
import { Button } from '@/components/ui/button';
import { Check, Edit, X, Search, Plus, AlignLeft, Tag } from 'lucide-react'; // Added Search and Plus icons
import { ScrollArea } from '@/components/ui/scroll-area'; // Use Shadcn ScrollArea
import { useAuth } from '@/contexts/AuthContext'; // Assuming correct path
import { ThreeDot } from 'react-loading-indicators';

// Define Product type (optional but good practice)
interface Product {
  codigo: number;
  descricao: string;
  preco: number;
  estoque: number;
  ativo: 'S' | 'N';
}

export default function Produtos() {

  const [pesquisa, setPesquisa] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');  
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);  

  const [ msgApi, setMsgApi ] = useState();
  const [ filtroAtivo, setFiltroAtivo ] = useState<'S'| 'N' >('S');

  const api = configApi();
  const { user, loading: authLoading }: any = useAuth();
  const router = useRouter();



  async function busca(term: string) {
    setProdutos([])
    setIsLoading(true);

    const query = term.trim() === '' ? 'a' : term.trim();
    try {
      const aux = await api.get(`/produtos`, {
        headers: {
          token:  user.token ,
        },
        params:{
          descricao: term,
          ativo: filtroAtivo
        }
      });
      if(aux.status === 200 ){
        setProdutos(aux.data || []);
      }
    } catch (e) {
      console.error('Erro ao buscar produtos:', e);
      setProdutos([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEditClick(codigo: number) {
    router.push(`/produtos/${codigo}`);
  }
 
 
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');  
    }
  }, [user, authLoading, router]);


  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(pesquisa);
    }, 500);  

    return () => {
      clearTimeout(handler);
    };
  }, [pesquisa]);

  useEffect(() => {
       busca(searchTerm);
  }, [searchTerm, filtroAtivo   ]);  
  

  if (authLoading) {
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




    return (

 <div className=" min-h-screen flex flex-col sm:ml-14 p-4 w-full h-full justify-itens-center items-center   bg-slate-100 "  >
   <div className="w-5/6 p-8 mt-22 min-h-screen    rounded-lg bg-white shadow-md " >
       <div className="p-2 rounded-sm bg-slate-100">

         <div className="m-5  flex justify-between   ">
        <h1 className="text-3xl md:text-4xl font-bold font-sans text-gray-800">
          Produtos
        </h1>
        </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6  ">
        <div className="  md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3" >

          <Input
            placeholder="Pesquisar por código ou descrição..."
            className="shadow-md flex-grow bg-white" // Takes available space
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />

          <div className="flex items-center justify-center sm:justify-start gap-4 m-3">

            <div className="flex items-center gap-1" title="Ativo">
             { filtroAtivo === 'S' ?
                 ( <Button onClick={()=> setFiltroAtivo('S')}
                  className="bg-green-600 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                  <Check size={16} color="#FFF" strokeWidth={3} />
                </Button> ) :(
                  <Button onClick={()=> setFiltroAtivo('S')}
                     className="bg-gray-400 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                   <Check size={16} color="#FFF" strokeWidth={3} />
                 </Button>    
                )
              } 
            </div>

            <div className="flex items-center gap-1" title="Inativo">
            { filtroAtivo === 'N' ? (
                 <Button  onClick={()=> setFiltroAtivo('N')}
                 className="bg-red-600 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                  <X size={16} color="#FFF" strokeWidth={3} />
                </Button>
                ) : (
                  <Button onClick={()=> setFiltroAtivo('N')}
                   className="bg-gray-400 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                  <X size={16} color="#FFF" strokeWidth={3} />
                </Button>
                )
              }
              
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 md:mt-0">
          <Button type="button" className="shadow-sm w-full sm:w-auto" 
          onClick={()=> router.push('/produtos/novo')}
          >
            <Plus className="h-4 w-4 mr-2" /> Novo
          </Button>

          <Button type="button" className="shadow-sm w-full sm:w-auto"
          onClick={()=> router.push('/categorias')}
          >
            <AlignLeft className="h-4 w-4 mr-2"/>
            Categorias
          </Button>

          <Button type="button" className="shadow-sm w-full sm:w-auto"
          onClick={()=> router.push('/marcas')}
          >
            <Tag  className="h-4 w-4 mr-2"/>
              Marcas
          </Button>

   
        </div>

      </div>  
       </div>  

       <div className="w-full mt-4  h-screen shadow-lg ">
                <Table  className="w-full  bg-gray-100 rounded-sm ">
                      <TableHead className= " w-[7%]   text-base">Codigo</TableHead>
                      <TableHead className= " w-[50%]  text-base   " >Descricao</TableHead>
                      <TableHead className="  w-[15%] text-base " > Preco</TableHead>
                      <TableHead  className=" text-base"   >Estoque</TableHead>
                      <TableHead className="  w-[15%] text-base " > </TableHead>
                      <TableHead className="  w-[15%] text-base " > </TableHead>
                  </Table >
   
          <ScrollArea className="w-full mt-4  h-[80%] overflow-auto  shadow-lg rounded-lg  ">
                <Table  className="w-full bg-white rounded-xl ">
    
                <TableBody>
            {
              produtos.length > 0 ? (
                produtos.map((produto) => (
                  <TableRow
                    key={produto.codigo}
                    className="hover:bg-gray-50 h-14"
                  >
                    <TableCell className="p-3 text-left font-medium text-gray-700 whitespace-nowrap w-[80px]">{produto.codigo}</TableCell>
                    <TableCell className="p-3 text-left text-gray-600 w-[45%]">{produto.descricao}</TableCell>
                    <TableCell className="p-3 text-left text-gray-600 whitespace-nowrap w-[100px]">R$ {produto.preco?.toFixed(2) ?? '0.00'}</TableCell>
                    <TableCell className="p-3 text-left text-gray-600 whitespace-nowrap w-[100px]">{produto.estoque}</TableCell>
                    <TableCell className="p-3 text-center w-[120px]">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditClick(produto.codigo)}
                          title="Editar Produto"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <div
                        className={`p-1 w-5 h-5 rounded-full flex items-center justify-center ${
                                                      produto.ativo === 'S' ? 'bg-green-500' : 'bg-red-500'
                                                  }`}
                          title={produto.ativo === 'S' ? 'Ativo' : 'Inativo'}
                        >
                          {produto.ativo === 'S' ? (
                            <Check size={16} color="#FFF" strokeWidth={3} />
                          ) : (
                            <X size={16} color="#FFF" strokeWidth={3}  />
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                isLoading ? 
                (
                  <div className="flex justify-center my-4"> {/* Container para centralizar */}
                  <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
                </div>
            ):
            <p  className="text-xl text-gray-500   ml-7"> nenhum pedido encontrado!</p>  
        
              ) }
                
                </TableBody>
                
                </Table>
          </ScrollArea>
    
               
      </div>

      
   </div>
  
  </div>
    
)
}