import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { useState } from "react";
  
export const SelectPessoa = ({ defaultTipoPessoa, onchange }: any) => {

    const handleSelect = (value) => {
        onchange(value)
    };

    return (
        <Select defaultValue={defaultTipoPessoa} onValueChange={handleSelect}   >
            <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Tipo de Pessoa" /> {/* Adicione um placeholder para melhor UX */}
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="f">Física</SelectItem>
                <SelectItem value="j">Jurídica</SelectItem>
            </SelectContent>
        </Select>
    );
};