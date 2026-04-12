'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado</h2>
        <p className="text-gray-600 mb-6">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        {error.message && (
          <p className="text-sm text-gray-500 mb-4 bg-gray-100 p-2 rounded">
            {error.message}
          </p>
        )}
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Tentar novamente
          </button>
          <button
            onClick={() => router.push('/home')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}