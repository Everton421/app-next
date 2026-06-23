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
import { configApi } from '../../services/api'; // Assuming correct path
import { Button } from '@/components/ui/button';
import { Check, Edit, X, Search, Plus, AlignLeft, Tag, Columns3Icon, FileSliders, Store } from 'lucide-react'; // Added Search and Plus icons
import { ScrollArea } from '@/components/ui/scroll-area'; // Use Shadcn ScrollArea
import { useAuth } from '@/contexts/AuthContext'; // Assuming correct path
import { ThreeDot } from 'react-loading-indicators';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Define Product type (optional but good practice)
interface Product {
  codigo: number;
  descricao: string;
  preco: number;
  estoque: number;
  ativo: 'S' | 'N';
  fotos?: {
    produto: number;
    sequencia: number;
    descricao: string;
    link: string;
    foto: string;
    data_cadastro: string;
    data_recadastro: string;
  }[];
}

type category = {
     codigo : number,
     id :string,
     data_cadastro : string,
     data_recadastro : string,
     descricao : string,
     ativo : "S" | "N"
}

type brand = {
     codigo : number,
     id :string,
     data_cadastro : string,
     data_recadastro : string,
     descricao : string,
     ativo : "S" | "N"
}


export default function Produtos() {

  const [pesquisa, setPesquisa] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [msgApi, setMsgApi] = useState();
  const [marcas, setMarcas] = useState<brand[]>([]);
  const [categorias, setCategorias] = useState<category[]>([]);
  const [marcaFiltro, setMarcaFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'S' | 'N'>('S');

  const api = configApi();
  const { user, loading: authLoading }: any = useAuth();
  const router = useRouter();



  async function busca(term: string) {
    if(!user || !user.token) return;
    setProdutos([])
    setIsLoading(true);

    const query = term.trim() === '' ? 'a' : term.trim();
    
    const params = { descricao: term, ativo: filtroAtivo, marca: marcaFiltro, categoria: categoriaFiltro }
    const headers = { token: user.token, } 


    try {
      const aux = await api.get(`/produtos/search`, {
        headers,
        params
      });
      console.log(aux)
      if (aux.status === 200) {
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
    router.push(`/cadastros/produtos/${codigo}`);
  }

  useEffect(() => {
    async function loadFilterOptions() {
      const headers = { token: user.token };
      const [mRes, cRes] = await Promise.all([
        api.get('/marcas/search', { headers }),
        api.get('/categorias/search', { headers }),
      ]);
      if (mRes.status === 200) setMarcas(mRes.data || []);
      if (cRes.status === 200) setCategorias(cRes.data || []);
    }
    if (user) loadFilterOptions();
  }, [user]);


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
  }, [searchTerm, filtroAtivo, marcaFiltro, categoriaFiltro, user ]);


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
      </div>
    );
  }


  // backup primeira div
  //  <div className=" min-h-screen flex flex-col sm:ml-56 p-2 sm:p-4 lg:p-6 w-full h-full justify-itens-center items-start   bg-red-500 "  >
  return (
    <div className=" min-h-screen flex flex-col sm:ml-52 p-2 sm:p-4 lg:p-6 w-full h-full justify-itens-center items-start bg-slate-100 "  >
      <div className="    md:w-[85%]  p-2 mt-22 min-h-screen  rounded-lg bg-white   " >
        <div className="  p-2   rounded-sm bg-slate-100 w-full  ">

          <div className="m-2 flex flex-col md:flex-row justify-between">
            <h1 className="text-2xl md:text-4xl font-bold font-sans text-gray-800">
              Produtos
            </h1>

            <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">

              <Button
                type="button"
                variant="outline"
                className="shadow-sm w-full col-span-2 sm:w-auto"
                onClick={() => router.push('/cadastros/produtos/novo')}
              >
                <Plus className="h-4 w-4 mr-2" /> Novo
              </Button>

           
            </div>
          </div>

          <div className=" flex md:flex-row md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3" >

            <Input
              placeholder="Pesquisar por código ou descrição..."
              className=" flex-grow bg-white " // Takes available space
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />

            <Select value={marcaFiltro} onValueChange={(v) => setMarcaFiltro(v === 'all' ? '' : v)}>
              <SelectTrigger className="bg-white w-[180px]">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                { marcas.length > 0 ?  
                  marcas.map(m => (
                    <SelectItem key={m.codigo} value={String(m.codigo)}>{m.codigo} - {m.descricao}</SelectItem>
                  )):(
                      <Label>Nenhuma marca encontrada</Label>
                  )
              
              }
              </SelectContent>
            </Select>

            <Select value={categoriaFiltro} onValueChange={(v) => setCategoriaFiltro(v === 'all' ? '' : v)}>
              <SelectTrigger className="bg-white w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {
                categorias.length > 0 ?  (
                categorias.map(c => (
                  <SelectItem key={c.codigo} value={String(c.codigo)}>{c.codigo} - {c.descricao}</SelectItem>
                ) )
                ):(
                      <Label>Nenhuma categoria encontrada</Label>
                )
              }
              </SelectContent>
            </Select>

            <div className="flex items-center justify-center sm:justify-start gap-4 m-3">
              <div className="flex items-center gap-1" title="Ativo">
                {filtroAtivo === 'S' ?
                  (<Button onClick={() => setFiltroAtivo('S')}

                    className="bg-green-600 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                    <Check size={16} color="#FFF" strokeWidth={3} />
                  </Button>) : (
                    <Button onClick={() => setFiltroAtivo('S')}
                      className="bg-gray-400 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                      <Check size={16} color="#FFF" strokeWidth={3} />
                    </Button>
                  )
                }
              </div>

              <div className="flex items-center gap-1" title="Inativo">
                {filtroAtivo === 'N' ? (
                  <Button onClick={() => setFiltroAtivo('N')}
                    className="bg-red-600 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                    <X size={16} color="#FFF" strokeWidth={3} />
                  </Button>
                ) : (
                  <Button onClick={() => setFiltroAtivo('N')}
                    className="bg-gray-400 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                    <X size={16} color="#FFF" strokeWidth={3} />
                  </Button>
                )
                }

              </div>
            </div>
          </div>

        </div>

        <div className="w-full mt-4  h-screen shadow-lg ">
          <Table className="w-full  bg-gray-100 rounded-sm ">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-[80px] text-xs md:text-base font-semibold text-gray-700">Foto</TableHead>
                <TableHead className="w-[80px] text-xs md:text-base font-semibold text-gray-700">Código</TableHead>
                <TableHead className="w-[50%] text-xs md:text-base font-semibold text-gray-700 text-left">Descrição</TableHead>
                <TableHead className="w-[100px] text-xs md:text-base font-semibold text-gray-700 text-left">Preço</TableHead>
                <TableHead className="w-[100px] text-xs md:text-base font-semibold text-gray-700 text-center">Estoque</TableHead>
                <TableHead className="w-[120px] text-xs md:text-base font-semibold text-gray-700 text-center">Ações</TableHead>
                <TableHead className="w-[60px] text-xs md:text-base font-semibold text-gray-700 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          <ScrollArea className="w-full mt-4  h-[80%] overflow-auto   rounded-lg  ">
            <Table className="w-full bg-white rounded-xl ">

              <TableBody>
                {
                  produtos.length > 0 ? (
                    produtos.map((produto) => (
                      <TableRow
                        key={produto.codigo}
                        className="hover:bg-gray-50 h-14"
                      >
                                <TableCell className="font-medium text-gray-700 whitespace-nowrap w-[80px] text-xs md:text-base p-2">
                          {produto.fotos && produto.fotos.length > 0 ? (
                            <Image
                              alt={produto.descricao}
                              width={60}
                              src={produto.fotos[0].link}
                              height={60}
                              className="rounded-lg object-cover shadow-sm border border-gray-200"
                              unoptimized
                            />
                          ) : (
                            <div className="w-[60px] h-[60px] bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                              <span className="text-gray-400 text-xs">Sem foto</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-gray-700 whitespace-nowrap w-[80px] text-xs md:text-base">{produto.codigo}</TableCell>
                        <TableCell className="text-left text-gray-600 w-[50%] text-xs md:text-base">{produto.descricao}</TableCell>
                        <TableCell className="text-left text-gray-600 w-[100px] text-xs md:text-base">R$ {Number(produto.preco)?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="text-center text-gray-600 w-[100px] text-xs md:text-base">{produto.estoque}</TableCell>
                        <TableCell className="text-center w-[120px]">
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="p-1 w-8 h-8 rounded-full flex items-center justify-center"
                              onClick={() => router.push(`/marketplaces`)}
                            >
                              <Store size={16} color='#185FED' />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center w-[60px]">
                          <div
                            className={`p-1 w-5 h-5 rounded-full flex items-center justify-center ${produto.ativo === 'S' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            title={produto.ativo === 'S' ? 'Ativo' : 'Inativo'}
                          >
                            {produto.ativo === 'S' ? (
                              <Check size={16} color="#FFF" strokeWidth={3} />
                            ) : (
                              <X size={16} color="#FFF" strokeWidth={3} />
                            )}
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
                      ) :
                      <p className="text-xl text-gray-500   ml-7"> nenhum Produto encontrado!</p>

                  )}

              </TableBody>

            </Table>
          </ScrollArea>


        </div>

      </div>

    </div>
    
  )
}
