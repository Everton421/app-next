'use client'
 
import { useCallback, useEffect, useState } from "react";
import ListaProdutos from "./components/produtos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ListaClientes from "./components/clientes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListaServicos from "./components/servicos";
import Parcelas from "./components/parcelas";
import MainPedido from "./components/main";

export default  function  Novo(  ){
  

return(
        <MainPedido codigo_pedido={null} />
    )
} 