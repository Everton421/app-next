'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Edit, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { configApi } from "../services/api";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { ThreeDot } from "react-loading-indicators";

type caracteristica = {
    codigo: number
    descricao: string
    ativo: 'S' | 'N'
}

export default function Caracteristicas() {

    const [pesquisa, setPesquisa] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [dados, setDados] = useState<caracteristica[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filtroAtivo, setFiltroAtivo] = useState<'S' | 'N'>('S');

    const api = configApi();
    const { user, loading }: any = useAuth();
    const router = useRouter();

    async function busca() {
        if (!user || !user.token) return;
        setDados([])
        setIsLoading(true)

        try {
            const result = await api.get(`/caracteristicas/search`, {
                headers: { token: user.token },
                params: { descricao: pesquisa, ativo: filtroAtivo }
            })

            if (result.status === 200) {
                setDados(result.data || [])
            }
        } catch (e) {
            console.error(e)
            setDados([])
        } finally {
            setIsLoading(false)
        }
    }

    function handleClick(codigo: number) {
        router.push(`/caracteristicas-produtos/${codigo}`)
    }

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(pesquisa);
        }, 500);
        return () => clearTimeout(handler);
    }, [pesquisa]);

    useEffect(() => {
        busca();
    }, [searchTerm, filtroAtivo, user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
            </div>
        );
    }

    return (
        <div className=" min-h-screen flex flex-col sm:ml-52 p-2 sm:p-4 lg:p-6 w-full h-full justify-itens-center items-start bg-slate-100 "  >
            <div className="    md:w-[85%]  p-2 mt-22 min-h-screen  rounded-lg bg-white   " >
                <div className="  p-2   rounded-sm bg-slate-100 w-full  ">

                    <div className="m-2 flex flex-col md:flex-row justify-between">
                        <h1 className="text-2xl md:text-4xl font-bold font-sans text-gray-800">
                            Características
                        </h1>

                        <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                className="shadow-sm w-full sm:w-auto"
                                onClick={() => router.push('/caracteristicas-produtos/novo')}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Novo
                            </Button>
                        </div>
                    </div>

                    <div className="flex md:flex-row md:w-auto md:max-w-md md:min-w-[60%] items-center gap-2 mt-3">
                        <Input
                            placeholder="Pesquisar por código ou descrição..."
                            className="flex-grow bg-white "
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                        />

                        <div className="flex items-center justify-center sm:justify-start gap-4 m-3">
                            <div className="flex items-center gap-1" title="Ativo">
                                {filtroAtivo === 'S' ?
                                    (<Button onClick={() => setFiltroAtivo('S')}
                                        className="bg-green-600 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                                        <Check size={16} color="#FFF" strokeWidth={3} />
                                    </Button>) : (
                                        <Button onClick={() => setFiltroAtivo('S')}
                                            className="bg-gray-400 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                                            <Check size={16} color="#FFF" strokeWidth={3} />
                                        </Button>
                                    )
                                }
                            </div>

                            <div className="flex items-center gap-1" title="Inativo">
                                {filtroAtivo === 'N' ? (
                                    <Button onClick={() => setFiltroAtivo('N')}
                                        className="bg-red-600 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                                        <X size={16} color="#FFF" strokeWidth={3} />
                                    </Button>
                                ) : (
                                    <Button onClick={() => setFiltroAtivo('N')}
                                        className="bg-gray-400 p-1 w-5 h-5 rounded-full flex items-center justify-center">
                                        <X size={16} color="#FFF" strokeWidth={3} />
                                    </Button>
                                )
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-4  h-screen shadow-lg ">
                    <Table className="w-full  bg-gray-100 rounded-sm ">
                        <TableHead className=" w-[10%]   text-xs md:text-base ">Codigo</TableHead>
                        <TableHead className=" w-[75%]  text-xs md:text-base   text-start" >Descricao</TableHead>
                        <TableHead className=" text-base" > </TableHead>
                    </Table >

                    {dados.length > 0 ? (
                        <ScrollArea className="w-full mt-4  h-[80%] overflow-auto   rounded-lg  ">
                            <Table className="w-full bg-white rounded-xl ">
                                <TableBody>
                                    {dados.map((i) => (
                                        <TableRow
                                            className="hover:bg-gray-50 h-14 justify-center items-center"
                                            key={i.codigo}
                                        >
                                            <TableCell className=" text-xs md:text-base text-center font-medium text-gray-700 whitespace-nowrap w-[10%]" > {i.codigo} </TableCell>
                                            <TableCell className=" text-xs md:text-base text-left text-gray-600 w-[75%]"> {i.descricao} </TableCell>
                                            <TableCell className=" text-left   font-bold text-gray-600">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleClick(i.codigo)}
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <div
                                                        className={`p-1 w-5 h-5 rounded-full flex items-center justify-center ${
                                                            i.ativo === 'S' ? 'bg-green-500' : 'bg-red-500'
                                                        }`}
                                                        title={i.ativo === 'S' ? 'Ativo' : 'Inativo'}
                                                    >
                                                        {i.ativo === 'S' ? (
                                                            <Check size={16} color="#FFF" strokeWidth={3} />
                                                        ) : (
                                                            <X size={16} color="#FFF" strokeWidth={3} />
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    ) : (
                        isLoading ? (
                            <div className="flex justify-center my-4">
                                <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
                            </div>
                        ) :
                            <p className="text-xl text-gray-500   ml-7"> nenhuma característica encontrada!</p>
                    )}
                </div>
            </div>
        </div>
    )
}
