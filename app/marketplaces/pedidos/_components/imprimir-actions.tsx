'use client';

import { useRouter } from "next/navigation";

export function ImprimirActions() {
  const router = useRouter();

  return (
    <div className="mb-4 text-center print:hidden">
      <button
        onClick={() => window.print()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Imprimir
      </button>
      <button
        onClick={() => router.back()}
        className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Voltar
      </button>
    </div>
  );
}