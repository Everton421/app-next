
'use client'
import { ChartOverView } from "@/components/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {   DollarSign } from "lucide-react";
 import { useEffect } from "react";

 import { redirect, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";



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

     <main className="sm:ml-14 p-4  bg-slate-100  ">
  
      <section className="grid grid-cols-2 gap-4">
           <Card    >
              <CardHeader>
                 <div className="flex items-center justify-center">
                   <CardTitle className="text-lg sm:text-xl text-gray-800">
                    total vendas
                   </CardTitle>
                  <DollarSign className="ml-auto w-4 h-4"/>
                 </div>
                  <CardDescription>
                    total vendas em 90 dias 
                  </CardDescription>
              </CardHeader>
              <CardContent  >
            <p className="text-base sm:text-lg font-bold" > R$:10.00</p>
              </CardContent>
          </Card>

          <Card>
              <CardHeader>
                 <div className="flex items-center justify-center">
                   <CardTitle className="text-lg sm:text-xl text-gray-800">
                    total vendas
                   </CardTitle>
                  <DollarSign className="ml-auto w-4 h-4"/>
                 </div>
                  <CardDescription>
                    total vendas em 90 dias 
                  </CardDescription>
              </CardHeader>
              <CardContent  >
            <p className="text-base sm:text-lg font-bold" > R$:10.00</p>
              </CardContent>
          </Card>


          <Card>
              <CardHeader>
                 <div className="flex items-center justify-center">
                   <CardTitle className="text-lg sm:text-xl text-gray-800">
                    total vendas
                   </CardTitle>
                  <DollarSign className="ml-auto w-4 h-4"/>
                 </div>
                  <CardDescription>
                    total vendas em 90 dias 
                  </CardDescription>
              </CardHeader>
              <CardContent  >
            <p className="text-base sm:text-lg font-bold" > R$:10.00</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                 <div className="flex items-center justify-center">
                   <CardTitle className="text-lg sm:text-xl text-gray-800">
                    total vendas
                   </CardTitle>
                  <DollarSign className="ml-auto w-4 h-4"/>
                 </div>
                  <CardDescription>
                    total vendas em 90 dias 
                  </CardDescription>
              </CardHeader>
              <CardContent  >
            <p className="text-base sm:text-lg font-bold" > R$:10.00</p>
              </CardContent>
          </Card>

      </section>
         
        <div className="w-full items-center justify-center flex mt-10">
          <ChartOverView/>
        </div>
      </main>

  );
}
