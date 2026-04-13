"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/app/services/api";
import { ThreeDot } from "react-loading-indicators";
import { Perfil } from "@/types/perfil";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PerfisPage() {
  const router = useRouter();
  const { user, loading }: any = useAuth();
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchPerfis();
    }
  }, [user]);

  const fetchPerfis = async () => {
    try {
      setLoadingData(true);
      const api = configApi();
      const response = await api.get("/bulk/perfis", {
        headers: {
          token: user?.token,
        },
      });
      setPerfis(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (codigo: number) => {
    if (!confirm("Tem certeza que deseja deletar este perfil?")) return;

    try {
      const api = configApi();
      await api.delete("/perfis", {
        params: { codigo },
        headers: { token: user?.token },
      });
      fetchPerfis();
    } catch (error) {
      console.error("Erro ao deletar perfil:", error);
      alert("Erro ao deletar perfil");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" />
      </div>
    );
  }


   ///     <div className=" min-h-screen flex flex-col sm:ml-52 p-2 sm:p-4 lg:p-6 w-full h-full justify-itens-center items-start   bg-slate-100 "  >
   ///   <div className="    md:w-[85%]  p-2 mt-22 min-h-screen  rounded-lg bg-white   " >
   ///     <div className="  p-2   rounded-sm bg-slate-100 w-full  ">


  return (
    <div className="min-h-screen sm:ml-52 bg-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/home")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Perfis de Usuário
              </h1>
            </div>
            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white"
              onClick={() => router.push("/perfis/novo")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Perfil
            </Button>
          </div>

          <div className="p-6">
            {loadingData ? (
              <div className="flex justify-center py-8">
                <ThreeDot
                  variant="pulsate"
                  color="#4B5563"
                  size="medium"
                />
              </div>
            ) : perfis.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Nenhum perfil encontrado
                </p>
                <Button
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={() => router.push("/perfis/novo")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro perfil
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Código
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {perfis.map((perfil) => (
                      <tr
                        key={perfil.codigo}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {perfil.codigo}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {perfil.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {perfil.nome}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              perfil.ativo === "S"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {perfil.ativo === "S" ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/perfis/${perfil.codigo}`)
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(perfil.codigo)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
