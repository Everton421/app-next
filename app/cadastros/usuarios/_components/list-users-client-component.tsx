"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/lib/api";
import { userRequest } from "../interfaces/user-resquest";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Edit, Plus, X } from "lucide-react";
import { ThreeDot } from "react-loading-indicators";

export default function ListUsersComponent({
  users,
  perfis,
}: {
  users: userRequest[];
  perfis?: Map<number, string>;
}) {
  const router = useRouter();
  const { user, loading: authLoading }: any = useAuth();
  const api = configApi();

  const [pesquisa, setPesquisa] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<"S" | "N">("S");
  const [dados, setDados] = useState<userRequest[]>(users);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(pesquisa), 500);
    return () => clearTimeout(handler);
  }, [pesquisa]);

  const busca = async () => {
    if (!user?.token) return;
    setIsLoading(true);
    setDados([]);
    try {
      const headers = { token: user.token };
      const params: Record<string, any> = { ativo: filtroAtivo };
      if (searchTerm) params.search = searchTerm;
      const result = await api.get("/usuarios/search", { headers, params });
      if (result.status === 200) setDados(result.data || []);
    } catch (e) {
      console.error(e);
      setDados([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    busca();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filtroAtivo]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ThreeDot variant="pulsate" color="#2563eb" size="medium" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col sm:ml-52 p-2 sm:p-4 lg:p-6 w-full h-full items-start bg-slate-100">
      <div className="md:w-[85%] p-2 mt-22 min-h-screen rounded-lg bg-white">
        <div className="p-2 rounded-sm bg-slate-100 w-full">
          <div className="m-2 flex flex-col md:flex-row justify-between">
            <h1 className="text-2xl md:text-4xl font-bold font-sans text-gray-800">
              Usuários
            </h1>
            <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
              <Button
                type="button"
                variant="outline"
                className="shadow-sm w-full sm:w-auto"
                onClick={() => router.push("/cadastros/usuarios/novo")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo
              </Button>
            </div>
          </div>

          <div className="flex md:flex-row md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3">
            <Input
              placeholder="Pesquisar por nome ou e-mail..."
              className="flex-grow bg-white"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
            <div className="flex items-center justify-center sm:justify-start gap-4 m-3">
              <div className="flex items-center gap-1" title="Ativo">
                <Button
                  onClick={() => setFiltroAtivo("S")}
                  className="bg-green-600 p-1 w-5 h-5 rounded-full flex items-center justify-center"
                >
                  <Check size={16} color="#FFF" strokeWidth={3} />
                </Button>
              </div>
              <div className="flex items-center gap-1" title="Inativo">
                <Button
                  onClick={() => setFiltroAtivo("N")}
                  className="bg-red-600 p-1 w-5 h-5 rounded-full flex items-center justify-center"
                >
                  <X size={16} color="#FFF" strokeWidth={3} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 h-screen shadow-lg">
          <Table className="w-full bg-gray-100 rounded-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs md:text-base font-semibold text-gray-700 w-[25%]">
                  Nome
                </TableHead>
                <TableHead className="text-xs md:text-base font-semibold text-gray-700 max-md:hidden">
                  E-mail
                </TableHead>
                <TableHead className="text-xs md:text-base font-semibold text-gray-700 w-[20%]">
                  Perfil
                </TableHead>
                <TableHead className="text-xs md:text-base font-semibold text-gray-700 max-md:hidden">
                  Empresa
                </TableHead>
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
                      <TableCell className="text-xs md:text-base font-medium text-gray-700 whitespace-nowrap">
                        {item.nome}
                      </TableCell>
                      <TableCell className="text-xs md:text-base font-medium text-gray-700 whitespace-nowrap max-md:hidden">
                        {item.email}
                      </TableCell>
                      <TableCell className="text-xs md:text-base font-medium text-gray-700 whitespace-nowrap">
                        {perfis?.get(item.codigo_perfil) || `Perfil ${item.codigo_perfil}`}
                      </TableCell>
                      <TableCell className="text-xs md:text-base font-medium text-gray-700 whitespace-nowrap max-md:hidden">
                        {item.cnpj}
                      </TableCell>
                      <TableCell className="text-left font-bold text-gray-600">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push(`/cadastros/usuarios/${item.codigo}`)}
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
            <p className="text-xl text-gray-500 ml-7">Nenhum usuário encontrado!</p>
          )}
        </div>
      </div>
    </div>
  );
}
