'use client'

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/lib/api";

type FilterOption = { codigo: number; descricao: string };

type Props = {
  marcaFiltro: string;
  setMarcaFiltro: (v: string) => void;
  categoriaFiltro: string;
  setCategoriaFiltro: (v: string) => void;
};

export function ProdutosExtraFilters({
  marcaFiltro,
  setMarcaFiltro,
  categoriaFiltro,
  setCategoriaFiltro,
}: Props) {
  const { user }: any = useAuth();
  const api = configApi();
  const [marcas, setMarcas] = useState<FilterOption[]>([]);
  const [categorias, setCategorias] = useState<FilterOption[]>([]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const headers = { token: user.token };
      const [mRes, cRes] = await Promise.all([
        api.get("/marcas/search", { headers }),
        api.get("/categorias/search", { headers }),
      ]);
      if (mRes.status === 200) setMarcas(mRes.data || []);
      if (cRes.status === 200) setCategorias(cRes.data || []);
    }
    load();
  }, [user]);

  return (
    <>
      <Select value={marcaFiltro} onValueChange={(v) => setMarcaFiltro(v === "all" ? "" : v)}>
        <SelectTrigger className="bg-white w-[180px]">
          <SelectValue placeholder="Marca" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {marcas.length > 0 ? (
            marcas.map((m) => (
              <SelectItem key={m.codigo} value={String(m.codigo)}>
                {m.codigo} - {m.descricao}
              </SelectItem>
            ))
          ) : (
            <Label>Nenhuma marca encontrada</Label>
          )}
        </SelectContent>
      </Select>

      <Select value={categoriaFiltro} onValueChange={(v) => setCategoriaFiltro(v === "all" ? "" : v)}>
        <SelectTrigger className="bg-white w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {categorias.length > 0 ? (
            categorias.map((c) => (
              <SelectItem key={c.codigo} value={String(c.codigo)}>
                {c.codigo} - {c.descricao}
              </SelectItem>
            ))
          ) : (
            <Label>Nenhuma categoria encontrada</Label>
          )}
        </SelectContent>
      </Select>
    </>
  );
}
