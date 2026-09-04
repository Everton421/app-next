'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { configApi } from "@/app/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Perfil, Permissao, PERMISSOES_POR_MODULO, MODULOS_LABELS, getModuloFromId } from "@/types/perfil";
import { ArrowLeft, Save, Check, X, ChevronDown, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PerfisFormClient({
    perfil,
    todasPermissoes,
}: {
    perfil: Perfil;
    todasPermissoes: Permissao[];
}) {
    const router = useRouter();
    const { user }: any = useAuth();
    const codigo = perfil.codigo;

    const [formData, setFormData] = useState({ id: perfil.id?.toString() ?? "", nome: perfil.nome || "" });
    const [selectedPermissoes, setSelectedPermissoes] = useState<number[]>(
        perfil.permissoes?.map((p) => p.codigo) || []
    );
    const [expandedModules, setExpandedModules] = useState<Set<string>>(
        new Set(Object.keys(PERMISSOES_POR_MODULO))
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const permissaoTotal = todasPermissoes.find((p) => p.id === "*");
    const isFullAccess = !!permissaoTotal && selectedPermissoes.includes(permissaoTotal.codigo);
    const normalPermissoes = todasPermissoes.filter((p) => p.id !== "*");

    const toggleModule = (module: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(module)) {
            newExpanded.delete(module);
        } else {
            newExpanded.add(module);
        }
        setExpandedModules(newExpanded);
    };

    const toggleMasterPermission = () => {
        if (isFullAccess) {
            setSelectedPermissoes([]);
        } else {
            setSelectedPermissoes(permissaoTotal ? [permissaoTotal.codigo] : []);
        }
    };

    const toggleAllInModule = (module: string) => {
        const modulePermissoes = normalPermissoes.filter((p) => getModuloFromId(p.id) === module);
        const moduleCodes = modulePermissoes.map((p) => p.codigo);
        const allSelected = isFullAccess || moduleCodes.every((code) => selectedPermissoes.includes(code));

        let base = isFullAccess
            ? selectedPermissoes.filter((c) => c !== permissaoTotal?.codigo)
            : selectedPermissoes;

        if (allSelected) {
            base = base.filter((code) => !moduleCodes.includes(code));
        } else {
            base = Array.from(new Set([...base, ...moduleCodes]));
        }
        setSelectedPermissoes(base);
    };

    const togglePermissao = (codigoPermissao: number) => {
        if (isFullAccess) {
            setSelectedPermissoes(() =>
                normalPermissoes
                    .map((p) => p.codigo)
                    .filter((c) => c !== permissaoTotal?.codigo && c !== codigoPermissao)
            );
            return;
        }
        setSelectedPermissoes((prev) =>
            prev.includes(codigoPermissao)
                ? prev.filter((c) => c !== codigoPermissao)
                : [...prev, codigoPermissao]
        );
    };

    const isAllSelectedInModule = (module: string) => {
        if (isFullAccess) return true;
        const modulePermissoes = normalPermissoes.filter((p) => getModuloFromId(p.id) === module);
        const moduleCodes = modulePermissoes.map((p) => p.codigo);
        return moduleCodes.every((code) => selectedPermissoes.includes(code));
    };

    const isSomeSelectedInModule = (module: string) => {
        if (isFullAccess) return false;
        const modulePermissoes = normalPermissoes.filter((p) => getModuloFromId(p.id) === module);
        const moduleCodes = modulePermissoes.map((p) => p.codigo);
        const selectedInModule = moduleCodes.filter((code) => selectedPermissoes.includes(code));
        return selectedInModule.length > 0 && !isAllSelectedInModule(module);
    };

    const handleSave = async () => {
        if (!user) return;
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
                { headers: { token: user?.token } }
            );

            await api.post(
                `/perfis/${codigo}/permissoes`,
                { permissoes: selectedPermissoes },
                { headers: { token: user?.token } }
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

    return (
        <div className="min-h-screen bg-slate-100 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.push("/cadastros/perfis")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                        <h1 className="text-xl font-semibold text-gray-900">Editar Perfil</h1>
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
                                    <label className="text-sm font-medium text-gray-700">ID do Perfil</label>
                                    <Input
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nome do Perfil</label>
                                    <Input
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Permissões do Perfil</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Selecione as permissões que este perfil terá acesso
                        </p>
                    </div>

                    <div className="p-6">
                        {permissaoTotal && (
                            <label
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors mb-4 ${
                                    isFullAccess
                                        ? "bg-violet-50 border-violet-400"
                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isFullAccess}
                                    onChange={toggleMasterPermission}
                                    className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                />
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-2 rounded-lg ${
                                            isFullAccess ? "bg-violet-500 text-white" : "bg-violet-100 text-violet-600"
                                        }`}
                                    >
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">
                                            Todas as Permissões
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Habilita todas as demais permissões, incluindo pedidos
                                        </p>
                                    </div>
                                </div>
                            </label>
                        )}

                        <div className="space-y-3">
                            {Object.entries(PERMISSOES_POR_MODULO).map(([module, actions]) => {
                                const moduleLabel =
                                    MODULOS_LABELS[module] ||
                                    module.charAt(0).toUpperCase() + module.slice(1);
                                const isExpanded = expandedModules.has(module);
                                const allSelected = isAllSelectedInModule(module);
                                const someSelected = isSomeSelectedInModule(module);

                                return (
                                    <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
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
                                                <span className="font-medium text-gray-900">{moduleLabel}</span>
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
                                                            (p) => getModuloFromId(p.id) === module && p.descricao === action
                                                        );
                                                        const isChecked = permissao
                                                            ? isFullAccess || selectedPermissoes.includes(permissao.codigo)
                                                            : false;

                                                        return (
                                                            <label
                                                                key={action}
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
                                                                        permissao && togglePermissao(permissao.codigo)
                                                                    }
                                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm text-gray-700">{action}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2">
                            {isFullAccess ? (
                                <p className="text-sm font-medium text-violet-700 flex items-center gap-1">
                                    <ShieldCheck className="h-4 w-4" />
                                    Acesso total habilitado (Todas as Permissões)
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    {selectedPermissoes.length} permissão(
                                    {selectedPermissoes.length !== 1 ? "ões" : ""}) selecionada
                                    {selectedPermissoes.length !== 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={handleSave}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                            disabled={saving}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}