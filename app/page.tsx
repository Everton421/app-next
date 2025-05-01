 
 
 'use client'
import LoginForm from "@/components/login";
import Home from "./home/page";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ThreeDot } from "react-loading-indicators";

 
export default function init( ) {
  const { user, loading }:any = useAuth();
  const router = useRouter();

 

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login'); // Redireciona para a página de login (ajuste se for outra)
      }
    }
  }, [user, loading, router]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
      <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
      </div>
    );
  }

 
    if (!user) {
      router.push('/login'); // Redireciona para a página de login (ajuste se for outra)
    }
  

    if (user) {
      router.push('/home'); // Redireciona para a página de login (ajuste se for outra)
    }
   
    }
 


    /*  
import { ChartOverView } from "@/components/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {   DollarSign } from "lucide-react";
import { getServerSession } from "next-auth";
import { getServerActionDispatcher } from "next/dist/client/components/app-router";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default  async function Home() {

  const session = await getServerSession();
  
    if(!session){
       redirect('/')

     }else{
       console.log('session ',session )
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
      */
