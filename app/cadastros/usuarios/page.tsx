import { getServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { userRequest } from "./interfaces/user-resquest";
import ListUsersComponent from "./_components/list-users-client-component";
import { Perfil } from "@/types/perfil";

export default async function UsuariosPage() {
  const api = getServerApi();
  if (!api) redirect("/");

  let datausers: userRequest[] = [];
  let perfis: Perfil[] = [];
  try {
    const [users, profileData] = await Promise.all([
      api.get<userRequest[]>("/bulk/usuarios"),
      api.get<Perfil[]>("/bulk/perfis"),
    ]);
    datausers = users || [];
    perfis = profileData || [];
  } catch (error) {
    console.log(`Erro ao buscar dados dos usuários ${error}`);
  }

  const perfilMap = new Map<number, string>();
  perfis.forEach((p) => perfilMap.set(p.codigo, p.nome));

  return <ListUsersComponent users={datausers} perfis={perfilMap} />;
}
