
'use client'
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import { useRouter } from "next/navigation";  

export default function Configuracoes(){
    const router = useRouter();
    return(
    <main className="sm:ml-14 p-4 bg-slate-100 min-h-screen  h-full  " > {/* Garantir altura mínima */}

                <Button variant="outline" onClick={()=> router.push('/home')} className="mb-5 shadow-md">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    
                    <Button variant="outline" onClick={()=> router.push('/integracoes')} className="mb-5 shadow-md">
                            <ArrowRightLeft className="mr-2 h-4 w-4"/>
                            Integrações
                    </Button>
                    

    </main>

    )
}