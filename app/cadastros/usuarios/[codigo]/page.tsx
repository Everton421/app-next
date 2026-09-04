import { getServerApi } from "@/lib/server-api";
import { redirect, notFound } from "next/navigation";
import { userRequest } from "../interfaces/user-resquest";
import { Perfil } from "@/types/perfil";
import UserDetailClient from "../_components/user-detail-client";

type Props = { params: { codigo: string } };

export default async function EditarUsuarioPage({ params }: Props) {
  const api = getServerApi();
  if (!api) redirect("/");

  const codigo = String(Number(params.codigo));

  let user: userRequest | undefined;
  let perfis: Perfil[] = [];
  try {
    const [userArray, perfilData] = await Promise.all([
      api.get<userRequest[]>("/usuarios/search", { codigo }),
      api.get<Perfil[]>("/bulk/perfis"),
    ]);
    user = userArray?.[0];
    perfis = perfilData || [];
  } catch (e) {
    user = undefined;
    perfis = [];
  }

  if (!user) notFound();

  const perfil = perfis.find((p) => p.codigo === user.codigo_perfil);

  return <UserDetailClient user={user} perfilNome={perfil?.nome || `Perfil ${user.codigo_perfil}`} />;
}
