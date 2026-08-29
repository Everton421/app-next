"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/lib/api";
import { Perfil } from "@/types/perfil";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThreeDot } from "react-loading-indicators";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const { user, loading }: any = useAuth();
  const api = configApi();

  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cnpj: "",
    senha: "",
    responsavel: "N",
    telefone: "",
    ativo: "S",
    codigo_perfil: 0,
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user?.token) return;
    api
      .get("/bulk/perfis", { headers: { token: user.token } })
      .then((res) => setPerfis(res.data || []))
      .catch(() => setPerfis([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nome.trim() || !formData.email.trim() || !formData.cnpj.trim() || !formData.senha) {
      setError("Preencha os campos obrigatórios (nome, e-mail, CNPJ e senha)");
      return;
    }

    try {
      setSaving(true);
      const response = await api.post(
        "/usuarios",
        {
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          cnpj: formData.cnpj.trim(),
          senha: formData.senha,
          responsavel: formData.responsavel,
          telefone: formData.telefone,
          ativo: formData.ativo,
          codigo_perfil: formData.codigo_perfil,
        },
        { headers: { token: user?.token } }
      );

      if (response.data.success) {
        router.push("/cadastros/usuarios");
      } else {
        setError(response.data.message || "Erro ao criar usuário");
      }
    } catch (err: any) {
      console.error("Erro ao criar usuário:", err);
      setError(err.response?.data?.message || "Erro ao criar usuário");
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
            <Button variant="outline" size="sm" onClick={() => router.push("/cadastros/usuarios")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Novo Usuário</h1>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Nome *</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">E-mail *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">CNPJ *</label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="Apenas números"
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Telefone</label>
                  <Input
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Senha *</label>
                  <Input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Perfil</label>
                  <select
                    value={formData.codigo_perfil}
                    onChange={(e) => setFormData({ ...formData, codigo_perfil: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:ring-gray-900"
                  >
                    <option value={0}>Sem perfil</option>
                    {perfis.map((p) => (
                      <option key={p.codigo} value={p.codigo}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Responsável</label>
                  <select
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:ring-gray-900"
                  >
                    <option value="N">Não</option>
                    <option value="S">Sim</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => router.push("/cadastros/usuarios")}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white" disabled={saving}>
                  {saving ? (
                    <>
                      <ThreeDot variant="pulsate" color="#ffffff" size="small" />
                      <span className="ml-2">Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Usuário
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
