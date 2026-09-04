export type userRequest =   
 {   codigo: number,
     nome:  string ,
     email: string,
     cnpj: string,
     responsavel: "S" | "N",
     ativo: "S" | "N",
     codigo_perfil: number
}