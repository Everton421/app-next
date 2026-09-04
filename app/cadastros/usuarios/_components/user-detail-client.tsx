"use client";

import { useRouter } from "next/navigation";
import { userRequest } from "../interfaces/user-resquest";
import { ArrowLeft, Check, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserDetailClient({
  user,
  perfilNome,
}: {
  user: userRequest;
  perfilNome: string;
}) {
  const router = useRouter();

  const rows: { label: string; value: string }[] = [
    { label: "Código", value: String(user.codigo) },
    { label: "Nome", value: user.nome },
    { label: "E-mail", value: user.email },
    { label: "CNPJ", value: user.cnpj },
    { label: "Perfil", value: perfilNome },
    {
      label: "Status",
      value: user.ativo === "S" ? "Ativo" : "Inativo",
    },
    {
      label: "Responsável",
      value: user.responsavel === "S" ? "Sim" : "Não",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/cadastros/usuarios")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Detalhes do Usuário</h1>
          </div>

          <div className="p-6">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-700">
                Visualização somente leitura. A edição de usuários (nome, e-mail, senha)
                exige suporte no backend (endpoint de atualização).
              </p>
            </div>

            <dl className="divide-y divide-gray-200">
              {rows.map((row) => (
                <div key={row.label} className="py-3 flex items-center justify-between gap-4">
                  <dt className="text-sm font-medium text-gray-500">{row.label}</dt>
                  <dd className="text-sm text-gray-900 font-medium flex items-center gap-2">
                    {row.label === "Status" ? (
                      user.ativo === "S" ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check className="h-4 w-4" /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <X className="h-4 w-4" /> Inativo
                        </span>
                      )
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/cadastros/usuarios")}
            >
              Voltar para lista
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
