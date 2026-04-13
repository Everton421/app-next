'use client'

import { Package, Users, Wrench, Car, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const categories = [
  {
    title: "Produtos",
    description: "Cadastre e gerencie seu catálogo de produtos",
    icon: Package,
    href: "/cadastros/produtos",
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Clientes",
    description: "Gerencie sua base de clientes",
    icon: Users,
    href: "/cadastros/clientes",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Serviços",
    description: "Registre e controle seus serviços",
    icon: Wrench,
    href: "/cadastros/servicos",
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Veículos",
    description: "Cadastre e gerencie veículos",
    icon: Car,
    href: "/cadastros/veiculos",
    color: "bg-purple-100 text-purple-600",
  },
];

export default function Cadastros() {
  return (
    <main className="sm:ml-56 min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Cadastros
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie seus dados cadastrais
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.href}
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-200 bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className={`p-4 rounded-2xl ${category.color} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-8 w-8" />
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {category.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <Link href={category.href}>
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
