'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Edit, Plus, X } from "lucide-react";
import { ThreeDot } from "react-loading-indicators";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/lib/api";

export type CadastroColumn<T = any> = {
  key: string;
  label: string;
  width?: string;
  className?: string;
  hiddenOnMobile?: boolean;
  render?: (item: T) => React.ReactNode;
};

export type CadastroListaConfig<T = any> = {
  title: string;
  entityPath: string;
  data: T[];
  columns: CadastroColumn<T>[];
  searchPlaceholder?: string;
  searchParam?: string;
  apiEndpoint: string;
  emptyMessage?: string;
  extraFilters?: React.ReactNode;
  extraFilterValues?: Record<string, any>;
  onBeforeSearch?: (params: Record<string, any>, searchTerm: string, filtroAtivo: string) => Record<string, any>;
};

export function CadastroListaClient<T extends { codigo: number; ativo?: string }>({
  title,
  entityPath,
  data: initialData,
  columns,
  searchPlaceholder = "Pesquisar por código ou descrição...",
  searchParam = "descricao",
  apiEndpoint,
  emptyMessage,
  extraFilters,
  extraFilterValues,
  onBeforeSearch,
}: CadastroListaConfig<T>) {
  const router = useRouter();
  const { user, loading: authLoading }: any = useAuth();
  const api = configApi();

  const [pesquisa, setPesquisa] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dados, setDados] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState<"S" | "N">("S");

  const busca = useCallback(async () => {
    if (!user || !user.token) return;
    setDados([]);
    setIsLoading(true);

    try {
      const headers = { token: user.token };
      let params: Record<string, any> = {
        ativo: filtroAtivo,
      };

      if (searchTerm) {
        params = { ...params, [searchParam]: searchTerm };
      }

      if (onBeforeSearch) {
        params = onBeforeSearch(params, searchTerm, filtroAtivo);
      }

      const result = await api.get(apiEndpoint, { headers, params });

      if (result.status === 200) {
        setDados(result.data || []);
      }
    } catch (e) {
      console.error(e);
      setDados([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, searchTerm, filtroAtivo, apiEndpoint, searchParam, onBeforeSearch, extraFilterValues]);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(pesquisa), 500);
    return () => clearTimeout(handler);
  }, [pesquisa]);

  useEffect(() => {
    busca();
  }, [searchTerm, filtroAtivo, extraFilterValues]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ThreeDot variant="pulsate" color="#2563eb" size="medium" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col sm:ml-52 p-2 sm:p-4 lg:p-6 w-full h-full justify-itens-center items-start bg-slate-100">
      <div className="md:w-[85%] p-2 mt-22 min-h-screen rounded-lg bg-white">
        <div className="p-2 rounded-sm bg-slate-100 w-full">
          <div className="m-2 flex flex-col md:flex-row justify-between">
            <h1 className="text-2xl md:text-4xl font-bold font-sans text-gray-800">
              {title}
            </h1>
            <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
              <Button
                type="button"
                variant="outline"
                className="shadow-sm w-full sm:w-auto"
                onClick={() => router.push(`${entityPath}/novo`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo
              </Button>
            </div>
          </div>

          <div className="flex md:flex-row md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3">
            <Input
              placeholder={searchPlaceholder}
              className="flex-grow bg-white"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />

            {extraFilters}

            <div className="flex items-center justify-center sm:justify-start gap-4 m-3">
              <div className="flex items-center gap-1" title="Ativo">
                {filtroAtivo === "S" ? (
                  <Button
                    onClick={() => setFiltroAtivo("S")}
                    className="bg-green-600 p-1 w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    <Check size={16} color="#FFF" strokeWidth={3} />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setFiltroAtivo("S")}
                    className="bg-gray-400 p-1 w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    <Check size={16} color="#FFF" strokeWidth={3} />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1" title="Inativo">
                {filtroAtivo === "N" ? (
                  <Button
                    onClick={() => setFiltroAtivo("N")}
                    className="bg-red-600 p-1 w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    <X size={16} color="#FFF" strokeWidth={3} />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setFiltroAtivo("N")}
                    className="bg-gray-400 p-1 w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    <X size={16} color="#FFF" strokeWidth={3} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 h-screen shadow-lg">
          <Table className="w-full bg-gray-100 rounded-sm">
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`${col.width ? `w-[${col.width}]` : ""} text-xs md:text-base font-semibold text-gray-700 ${col.hiddenOnMobile ? "max-md:hidden" : ""} ${col.className || ""}`}
                  >
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-[60px] text-base"></TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          {dados.length > 0 ? (
            <ScrollArea className="w-full mt-4 h-[80%] overflow-auto rounded-lg">
              <Table className="w-full bg-white rounded-xl">
                <TableBody>
                  {dados.map((item) => (
                    <TableRow
                      key={item.codigo}
                      className="hover:bg-gray-50 h-14 justify-center items-center"
                    >
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          className={`text-xs md:text-base font-medium text-gray-700 whitespace-nowrap ${col.width ? `w-[${col.width}]` : ""} ${col.hiddenOnMobile ? "max-md:hidden" : ""} ${col.className || ""}`}
                        >
                          {col.render
                            ? col.render(item)
                            : (item as any)[col.key] ?? ""}
                        </TableCell>
                      ))}
                      <TableCell className="text-left font-bold text-gray-600">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push(`${entityPath}/${item.codigo}`)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <div
                            className={`p-1 w-5 h-5 rounded-full flex items-center justify-center ${
                              item.ativo === "S" ? "bg-green-500" : "bg-red-500"
                            }`}
                            title={item.ativo === "S" ? "Ativo" : "Inativo"}
                          >
                            {item.ativo === "S" ? (
                              <Check size={16} color="#FFF" strokeWidth={3} />
                            ) : (
                              <X size={16} color="#FFF" strokeWidth={3} />
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : isLoading ? (
            <div className="flex justify-center my-4">
              <ThreeDot variant="pulsate" color="#2563eb" size="medium" />
            </div>
          ) : (
            <p className="text-xl text-gray-500 ml-7">
              {emptyMessage || `Nenhum ${title.toLowerCase()} encontrado!`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
