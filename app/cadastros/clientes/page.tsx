'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Edit, Plus, Search, X, User, Phone, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { configApi } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { ThreeDot } from "react-loading-indicators";


export default function Clientes() {
  type client = {
    codigo: number;
    id: string;
    celular: string;
    nome: string;
    cep: string;
    endereco: string;
    ie: string;
    numero: string;
    cnpj: string;
    ativo: string;
    cidade: string;
    data_cadastro: string;
    data_recadastro: string;
    vendedor: number;
    bairro: string;
    estado: string;
  }

  const [clientes, setClientes] = useState<client[]>([])
  const [pesquisa, setPesquisa] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'S' | 'N' | 'all'>('S');
  const [isLoading, setIsLoading] = useState(false);  
  const [error, setError] = useState<string | null>(null);
  
  const { user, loading }:any = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if(!user){
      return
    }
    if (user && !loading) {
      buscarClientes();
    }
  }, [pesquisa, filtroAtivo, user]);

  async function buscarClientes() {
    setClientes([])
    setIsLoading(true)
    setError(null)
    
    try {
      const api = configApi();
      const params: any = {
        ativo: filtroAtivo === 'all' ? undefined : filtroAtivo
      };
      
    const headers = { token: user.token, } 


      if (pesquisa) {
        params.nome = pesquisa;
      }
      
      const aux = await api.get(`/clientes/search`, {
       headers, params 
      });
      setClientes(aux.data)
    } catch (e: any) {
      console.error(e)
      setError("Erro ao carregar clientes")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <ThreeDot variant="pulsate" color="#4B5563" size="medium" text="" />
      </div>
    );
  }

  function handleClick(item: client) {
    router.push(`/cadastros/clientes/${item.codigo}`)
  }

  function formatCNPJ(cnpj: string) {
    if (!cnpj) return '-';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return (
    <div className="min-h-screen flex flex-col sm:ml-52 p-2 sm:p-4 lg:p-6 w-full h-full justify-itens-center items-start bg-slate-100">
      <div className="md:w-[85%] p-2 mt-22 min-h-screen rounded-lg bg-white">
        <div className="p-2 rounded-sm bg-slate-100 w-full">
          <div className="m-2 flex flex-col md:flex-row justify-between">
            <h1 className="text-2xl md:text-4xl font-bold font-sans text-gray-800">
              Clientes
            </h1>

            <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
              <Button
                type="button"
                variant="outline"
                className="shadow-sm w-full sm:w-auto"
                onClick={() => router.push('/cadastros/clientes/novo')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>

          <div className="flex md:flex-row md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por nome ou CNPJ..."
                className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900 bg-white w-full"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>

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

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <ThreeDot variant="pulsate" color="#4B5563" size="medium" text="" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="text-red-500 text-lg">Erro ao carregar dados</div>
              <Button variant="outline" onClick={buscarClientes}>Tentar novamente</Button>
            </div>
          ) : clientes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-600 font-medium w-20">Código</TableHead>
                    <TableHead className="text-gray-600 font-medium">Nome</TableHead>
                    <TableHead className="text-gray-600 font-medium">CNPJ</TableHead>
                    <TableHead className="text-gray-600 font-medium">Contato</TableHead>
                    <TableHead className="text-gray-600 font-medium text-center w-24">Status</TableHead>
                    <TableHead className="text-gray-600 font-medium text-right w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((item) => (
                    <TableRow 
                      key={item.codigo} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleClick(item)}
                    >
                      <TableCell className="font-medium text-gray-900">{item.codigo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{item.nome}</span>
                        </div>
                        {item.endereco && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {item.endereco}, {item.numero} - {item.bairro}, {item.cidade}-{item.estado}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 font-mono text-sm">
                        {formatCNPJ(item.cnpj)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {item.celular || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.ativo === 'S' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.ativo === 'S' ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick(item);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <User className="h-12 w-12 text-gray-300" />
              <p className="text-gray-500">Nenhum cliente encontrado</p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/cadastros/clientes/novo')}
              >
                Cadastrar primeiro cliente
              </Button>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {clientes.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>{clientes.length} cliente(s) encontrado(s)</span>
            <span>{clientes.filter(c => c.ativo === 'S').length} ativo(s)</span>
          </div>
        )}
      </div>
    </div>
  )
}
