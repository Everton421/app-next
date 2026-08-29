import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Users, Shield, ArrowRightLeft } from "lucide-react";
import Link from "next/link";

const configCards = [
  {
    title: "Usuários",
    description: "Gerencie os usuários da sua empresa e seus acessos",
    icon: Users,
    href: "/cadastros/usuarios",
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Perfis e Permissões",
    description: "Crie perfis e defina as permissões de acesso por módulo",
    icon: Shield,
    href: "/cadastros/perfis",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Integrações",
    description: "Configure as integrações com marketplaces e serviços",
    icon: ArrowRightLeft,
    href: "/integracoes",
    color: "bg-orange-100 text-orange-600",
  },
];

export default function Configuracoes() {
  return (
    <main className="sm:ml-56 min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 flex items-center gap-4">
          <Button variant="outline" asChild className="shadow-md">
            <Link href="/home">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Configurações
          </h1>
        </div>

        <div className="mb-8">
          <p className="text-slate-500">
            Gerencie usuários, perfis de acesso e integrações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {configCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.href}
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-200 bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-2xl ${card.color} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <Link href={card.href}>
                        Acessar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
