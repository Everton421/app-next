import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { PerfisFormClient } from "../_components/perfis-form-client";
import { Perfil, Permissao } from "@/types/perfil";

type Props = { params: { codigo: string } };

export default async function EditarPerfilPage({ params }: Props) {
    const api = getServerApi();
    if (!api) redirect("/");

    const codigo = String(Number(params.codigo));

    let perfil: Perfil | undefined;
    let todasPermissoes: Permissao[] = [];
    try {
        const [perfilArray, permissoesArray] = await Promise.all([
            api.get<Perfil[]>("/perfis/search", { codigo, withPermissoes: "S" }),
            api.get<Permissao[]>("/permissoes"),
        ]);
        perfil = perfilArray?.[0];
        todasPermissoes = permissoesArray || [];
    } catch {
        perfil = undefined;
        todasPermissoes = [];
    }

    if (!perfil) notFound();

    return <PerfisFormClient perfil={perfil} todasPermissoes={todasPermissoes || []} />;
}