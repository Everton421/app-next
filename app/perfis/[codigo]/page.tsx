"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/app/services/api";
import { ThreeDot } from "react-loading-indicators";
import {
  Perfil,
  Permissao,
  PERMISSOES_POR_MODULO,
  MODULOS_LABELS,
} from "@/types/perfil";
import {
  ArrowLeft,
  Save,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditarPerfilPage() {
  const router = useRouter();
  const params = useParams();
  const codigo = Number(params.codigo);
  const { user, loading }: any = useAuth();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [todasPermissoes, setTodasPermissoes] = useState<Permissao[]>([]);
  const [selectedPermissoes, setSelectedPermissoes] = useState<number[]>([]);
  const [formData, setFormData] = useState({ id: "", nome: "" });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(Object.keys(PERMISSOES_POR_MODULO))
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user && codigo) {
      fetchData();
    }
  }, [user, codigo]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const api = configApi();

      const [perfilResponse, permissoesResponse] = await Promise.all([
        api.get("/perfis/search", {
          params: { codigo, withPermissoes: "S" },
          headers: { token: user?.token },
        }),
        api.get("/permissoes", {
          headers: { token: user?.token },
        }),
      ]);

      const perfilData = perfilResponse.data?.[0];
      if (perfilData) {
        setPerfil(perfilData);
        setFormData({ id: perfilData.id, nome: perfilData.nome });
        setSelectedPermissoes(
          perfilData.permissoes?.map((p: Permissao) => p.codigo) || []
        );
      }

      setTodasPermissoes(permissoesResponse.data || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError("Erro ao carregar dados do perfil");
    } finally {
      setLoadingData(false);
    }
  };

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const toggleAllInModule = (module: string) => {
    const modulePermissoes = todasPermissoes.filter((p) =>
      p.id.startsWith(module)
    );
    const moduleCodes = modulePermissoes.map((p) => p.codigo);
    const allSelected = moduleCodes.every((code) =>
      selectedPermissoes.includes(code)
    );

    if (allSelected) {
      setSelectedPermissoes((prev) =>
        prev.filter((code) => !moduleCodes.includes(code))
      );
    } else {
      setSelectedPermissoes((prev) => [...new Set([...prev, ...moduleCodes])]);
    }
  };

  const togglePermissao = (codigo: number) => {
    setSelectedPermissoes((prev) =>
      prev.includes(codigo)
        ? prev.filter((c) => c !== codigo)
        : [...prev, codigo]
    );
  };

  const isAllSelectedInModule = (module: string) => {
    const modulePermissoes = todasPermissoes.filter((p) =>
      p.id.startsWith(module)
    );
    const moduleCodes = modulePermissoes.map((p) => p.codigo);
    return moduleCodes.every((code) => selectedPermissoes.includes(code));
  };

  const isSomeSelectedInModule = (module: string) => {
    const modulePermissoes = todasPermissoes.filter((p) =>
      p.id.startsWith(module)
    );
    const moduleCodes = modulePermissoes.map((p) => p.codigo);
    const selectedInModule = moduleCodes.filter((code) =>
      selectedPermissoes.includes(code)
    );
    return selectedInModule.length > 0 && !isAllSelectedInModule(module);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!formData.id.trim() || !formData.nome.trim()) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      setSaving(true);
      const api = configApi();

      await api.put(
        "/perfis",
        {
          codigo,
          id: formData.id.trim(),
          nome: formData.nome.trim(),
        },
        {
          headers: { token: user?.token },
        }
      );

      await api.post(
        `/perfis/${codigo}/permissoes`,
        { permissoes: selectedPermissoes },
        {
          headers: { token: user?.token },
        }
      );

      setSuccess("Perfil salvo com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setError(err.response?.data?.message || "Erro ao salvar perfil");
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-center py-12">
              <ThreeDot variant="pulsate" color="#4B5563" size="medium" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <p className="text-center text-gray-500">Perfil não encontrado</p>
            <div className="mt-4 text-center">
              <Button onClick={() => router.push("/perfis")}>
                Voltar para lista
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
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
              Editar Perfil
            </h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <X className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    ID do Perfil
                  </label>
                  <Input
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Nome do Perfil
                  </label>
                  <Input
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Permissões do Perfil
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Selecione as permissões que este perfil terá acesso
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(PERMISSOES_POR_MODULO).map(
                ([module, actions]) => {
                  const moduleLabel =
                    MODULOS_LABELS[module] || module.charAt(0).toUpperCase() + module.slice(1);
                  const isExpanded = expandedModules.has(module);
                  const allSelected = isAllSelectedInModule(module);
                  const someSelected = isSomeSelectedInModule(module);

                  return (
                    <div
                      key={module}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div
                        className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleModule(module)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="font-medium text-gray-900">
                            {moduleLabel}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAllInModule(module);
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            allSelected
                              ? "bg-green-100 text-green-800"
                              : someSelected
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          {allSelected ? (
                            <>
                              <Check className="h-3 w-3" />
                              Todos
                            </>
                          ) : someSelected ? (
                            <>
                              <Check className="h-3 w-3" />
                              Alguns
                            </>
                          ) : (
                            "Selecionar todos"
                          )}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-white">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {actions.map((action) => {
                              const permissao = todasPermissoes.find(
                                (p) => p.id === action.id
                              );
                              const isChecked = permissao
                                ? selectedPermissoes.includes(permissao.codigo)
                                : false;

                              return (
                                <label
                                  key={action.id}
                                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                    isChecked
                                      ? "bg-blue-50 border-blue-300"
                                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                      permissao &&
                                      togglePermissao(permissao.codigo)
                                    }
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {action.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
            <p className="text-sm text-gray-500">
              {selectedPermissoes.length} permissão(
              {selectedPermissoes.length !== 1 ? "ões" : ""}) selecionada
              {selectedPermissoes.length !== 1 ? "s" : ""}
            </p>
            <Button
              onClick={handleSave}
              className="bg-gray-900 hover:bg-gray-800 text-white"
              disabled={saving}
            >
              {saving ? (
                <>
                  <ThreeDot variant="pulsate" color="#ffffff" size="small" />
                  <span className="ml-2">Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
