'use client'

import { api } from "@/app/services/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react"
import ListaClientes from "../novo/components/clientes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListaProdutos from "../novo/components/produtos";
import { Button } from "@/components/ui/button";
import ListaServicos from "../novo/components/servicos";
import Parcelas from "../novo/components/parcelas";
import MainPedido from "../novo/components/main";

export default function Pedido({params}){
 
return(
       <>
       {
        params !== null &&
        <MainPedido codigo_pedido={params.codigo}/>
       }
       </>
    )
}