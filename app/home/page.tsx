
'use client'
import { ChartOverView } from "@/components/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {   ClipboardList, DollarSign, Package, PlusCircle, Users } from "lucide-react";
 import { useEffect } from "react";

 import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";



export default function Home() {
  const { user, loading }:any = useAuth();
  const router = useRouter();


  
 function mostrarUsuario(){
  console.log(user)
 }




  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/'); // Redireciona para a página de login (ajuste se for outra)
      }
    }
  }, [user, loading, router]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
         <p>Verificando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex justify-center items-center h-screen">
          <p>Redirecionando para login...</p>
       </div>
    );
  }


  return (

    <main className="sm:ml-14 p-4 bg-slate-100 min-h-screen  h-full  " > {/* Garantir altura mínima */}
    <ScrollArea className="w-full   h-full " >
      

    {/* Mensagem de Boas-vindas */}
    <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">
        Olá, {user?.nome || 'Usuário'}! {/* Exibir nome do usuário */}
    </h1>

    {/* Seção de Ações Rápidas */}
    <section className="mb-6 flex flex-wrap gap-2 sm:gap-4">
        <Button onClick={() => router.push('/pedidos/novo')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Pedido
        </Button>
        <Button variant="outline" onClick={() => router.push('/clientes')}>
            <Users className="mr-2 h-4 w-4" /> Clientes
        </Button>
        <Button variant="outline" onClick={() => router.push('/produtos')}>
             <Package className="mr-2 h-4 w-4" /> Produtos
        </Button>
         <Button variant="outline" onClick={() => router.push('/pedidos')}>
             <ClipboardList className="mr-2 h-4 w-4" /> Meus Pedidos
        </Button>
    </section>

    {/* Seção de KPIs (Cards) */}
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"> {/* Layout responsivo */}
        {/* Seus 4 Cards com KPIs diferentes aqui */}
        {/* Exemplo Card 1 */}
        <Card>
          
            {/* ... conteúdo do card 1 ... */}
        </Card>
        {/* Exemplo Card 2 */}
        <Card className="cursor-pointer hover:bg-sky-50" onClick={() => router.push('/pedidos?status=pendente')}>
             {/* ... conteúdo do card 2 com link ... */}
        </Card>
         {/* ... Card 3 ... */}
         {/* ... Card 4 ... */}
    </section>

    {/* Seção do Gráfico */}
    <section className="w-full bg-white p-4 rounded-lg shadow"> {/* Envolver gráfico em card/seção */}
         <h2 className="text-lg font-semibold mb-3 text-gray-700">Visão Geral de Vendas (Últimos 30 dias)</h2>
         {/* Adicionar talvez um seletor de período para o gráfico */}
        <div className="w-full items-center justify-center flex">
            <ChartOverView /> {/* Passar dados dinâmicos se possível */}
        </div>
    </section>

     {/* Seção Adicional Opcional: Últimos Pedidos / Atividade Recente */}
     <section className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Últimos Pedidos</h2>
        {/* Aqui você pode listar os 5 últimos pedidos com status e link */}
        {/* Exemplo: */}
        <ul>
            <li className="py-2 border-b border-gray-200 last:border-b-0 flex justify-between items-center">
                <span>Pedido #1234 - Cliente X</span>
                <span className="text-sm text-green-600 font-medium">Aprovado</span>
                <Button variant="ghost" size="sm" onClick={() => router.push('/pedidos/1234')}>Ver</Button>
            </li>
             <li className="py-2 border-b border-gray-200 last:border-b-0 flex justify-between items-center">
                <span>Pedido #1233 - Cliente Y</span>
                <span className="text-sm text-amber-600 font-medium">Pendente</span>
                 <Button variant="ghost" size="sm" onClick={() => router.push('/pedidos/1233')}>Ver</Button>
            </li>
            {/* ... mais itens */}
        </ul>
        {/* Ou mostrar uma mensagem se não houver pedidos */}
        {/* <p className="text-gray-500 text-center py-4">Nenhum pedido recente.</p> */}
     </section>

     </ScrollArea >
    
    </main>
  );
}
