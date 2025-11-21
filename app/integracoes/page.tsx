'use client'
import { useState, useEffect } from "react"; // Adicionado useEffect
import { Button } from "@/components/ui/button";
import { CirclePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import { configApi } from "../services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation"; // Adicionado useSearchParams

export default function Integracoes() {
    const api = configApi();
    const { user }: any = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams(); // Hook para ler a URL
    
    const [isRedirecting, setIsRedirecting] = useState(false);

    // --- EFEITO PARA INTERCEPTAR O SUCESSO ---
    useEffect(() => {
        // Lê os parâmetros da URL
        const status = searchParams.get('status'); // ex: ?status=success
        const message = searchParams.get('message'); // ex: &message=Integrado...

        if (status === 'success') {
            // 1. Mostra o alerta (Aqui você pode usar um Toast/Notification mais bonito)
            alert(message || "Integração realizada com sucesso!");

            // 2. Limpa a URL para remover os parametros visuais (?status=...)
            // O router.replace altera a URL sem recarregar a página
            router.replace('/integracoes'); 
        } else if (status === 'error') {
             alert(message || "Houve um erro na integração.");
        }
    }, [searchParams, router]);
    // -----------------------------------------

    async function handleConnectML() {
        setIsRedirecting(true);
        try {
            const result = await api.post(`/ml/integrations/getCode`, {}, {
                params: { vendedor: user.codigo },
                headers: { token: user.token },
            });

            const externalUrl = result.data.uri;
            if (externalUrl) {
                window.location.href = externalUrl;
            } else {
                setIsRedirecting(false);
            }
        } catch (e) {
            console.log(e);
            setIsRedirecting(false);
            alert("Erro ao iniciar integração.");
        }
    }

    return (
        <main className="sm:ml-14 p-4 bg-slate-100 min-h-screen h-full">
            <Button
                variant='outline'
                className="w-auto h-auto gap-2"
                onClick={() => handleConnectML()}
                disabled={isRedirecting}
            >
                {isRedirecting ? (
                    <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                ) : (
                    <>
                        <Image
                            src="/images/ML-logo.png"
                            alt="Logo Mercado Livre"
                            width={100}
                            height={100}
                        />
                        <CirclePlus className="m-3 mr-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </main>
    )
}