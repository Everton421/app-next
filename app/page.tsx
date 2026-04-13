 
 
 'use client'
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ThreeDot } from "react-loading-indicators";

 
export default function init( ) {
  const { user, loading }:any = useAuth();
  const router = useRouter();

 

  useEffect(() => {
      if (!user) {
        router.push('/login'); // Redireciona para a página de login (ajuste se for outra)
      }
  }, []);


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
 

 