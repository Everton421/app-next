"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/app/services/api";
import { ThreeDot } from "react-loading-indicators";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NovoPerfilPage() {
  const router = useRouter();
  const { user, loading }: any = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.id.trim() || !formData.nome.trim()) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      setSaving(true);
      const api = configApi();
      const response = await api.post(
        "/perfis",
        {
          id: formData.id.trim(),
          nome: formData.nome.trim(),
        },
        {
          headers: { token: user?.token },
        }
      );

      if (response.data.success) {
        router.push(`/perfis/${response.data.data.codigo}`);
      } else {
        setError(response.data.message || "Erro ao criar perfil");
      }
    } catch (err: any) {
      console.error("Erro ao criar perfil:", err);
      setError(
        err.response?.data?.message || "Erro ao criar perfil"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/perfis")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Novo Perfil
            </h1>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  ID do Perfil
                </label>
                <Input
                  placeholder="Ex: gerente-vendas"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-500">
                  Identificador único do perfil (sem espaços)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nome do Perfil
                </label>
                <Input
                  placeholder="Ex: Gerente de Vendas"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/perfis")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <ThreeDot
                        variant="pulsate"
                        color="#ffffff"
                        size="small"
                      />
                      <span className="ml-2">Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Perfil
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
