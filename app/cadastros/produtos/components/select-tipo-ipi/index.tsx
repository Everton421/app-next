import { Label } from "@/components/ui/label";


export const SelectTipoIpi = () => {
    return (
        <>
                <Label   className="text-sm font-medium text-gray-600">Tipo Do IPI  </Label>

        <select id="tipo-ipi" className="border border-gray-300 rounded-md p-2 ml-2">
            <option value="0">Selecione o tipo de IPI</option>
              <option value="1"> 
                <Label   className="text-sm font-medium text-gray-600">IPI (%) </Label>
             </option>
              <option value="2"> 
                 <Label  className="text-sm font-medium text-gray-600">IPI (FIXO) </Label>
             </option>

        </select>
        </>
    );
};
