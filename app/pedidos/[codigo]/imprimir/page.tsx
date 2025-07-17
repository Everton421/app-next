'use client';

import { useEffect, useState } from 'react';
import { configApi } from '@/app/services/api';  
import { useAuth } from '@/contexts/AuthContext'; // Ajuste o caminho se necessário
import { useParams, useRouter } from 'next/navigation'; // Use useParams para pegar o [codigo]
import { ThreeDot } from 'react-loading-indicators';

// Defina uma interface para a estrutura detalhada do pedido (ajuste conforme sua API)
interface PedidoDetalhes {
  codigo: number;
  id:string,
  id_externo:number ,
  cliente: cliente;
  nome: string;  
  data_cadastro: string;
  total_geral: number;
  vendedor: string;  
  produtos: produto[];  
  servicos:servico[];
  parcelas:parcelas[];
  observacoes?: string;  
}

interface cliente {
       codigo: number,
			 id: number,
			 celular: string,
			 nome: string,
			 cep: string,
			 endereco: string,
			 ie: string,
			 numero: string,
			 cnpj: string,
			 ativo: string,
			 cidade: string,
			 data_cadastro: string,
			 data_recadastro: string,
			 vendedor: number,
			 bairro: string,
			 estado: string
}


interface produto {
         pedido: number;
				 codigo: number;
				 desconto: number;
				 quantidade: number;
				 preco: number;
				 total: number;
				 descricao: string;
        }

interface servico {
         pedido: number,
				 codigo: number,
				 desconto: number,
				 quantidade: number,
				 valor: number,
				 total: number,
				 aplicacao: string
}

interface parcelas {
   pedido : number,
   parcela : number,
   valor : number,
   vencimento : string
}



export default function ImprimirPedidoPage() {
  const [pedido, setPedido] = useState<PedidoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();  
  const { codigo } = params; 
  const router = useRouter();
  const api = configApi();
  const { user }:any = useAuth(); 






  useEffect(() => {
    const fetchPedidoDetalhes = async () => {
      if (!codigo  ) {
        setError("Código do pedido ou informações do usuário ausentes.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {

    const response = await api.get(`/pedido`,
      {
          params:{ codigo: Number(codigo)  },
          headers:{
               vendedor: user.vendedor ,
               token:  user.token    
          }
      }
  ) 

        if (response.data) {
          setPedido(response.data[0]);
        } else {
          setError("Pedido não encontrado.");
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do pedido:", err);
        setError("Falha ao carregar os dados do pedido para impressão.");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidoDetalhes();
  }, [codigo ]); 


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
       <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
      </div>
    );
  } 

  if (error) {
    return <div className="p-5 text-center text-red-600">Erro: {error}</div>;
  }

  if (!pedido) {
    return <div className="p-5 text-center">Pedido não encontrado.</div>;
  }





  // Opcional: Disparar a impressão automaticamente após carregar
  // useEffect(() => {
  //   if (pedido && !loading && !error) {
  //     // Pequeno delay para garantir a renderização antes de imprimir
  //     const timer = setTimeout(() => {
  //        window.print();
  //     }, 500);
  //     return () => clearTimeout(timer); // Limpa o timer se o componente desmontar
  //   }
  // }, [pedido, loading, error]);

  const handlePrint = () => {
    window.print();  
  };

   

  return (
    <div className="p-4 print:p-0 max-w-2xl mx-auto font-sans">  
      <div className="mb-4 text-center print:hidden">
         <button
           onClick={handlePrint}
           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
         >
           Imprimir
         </button>
          <button
           onClick={() => router.back()} // Botão para voltar
           className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
         >
           Voltar
         </button>
      </div>

      {/* --- Conteúdo do Pedido para Impressão --- */}
      <div className="border border-gray-300 p-4 rounded">
        <div className='flex justify-between'>
          <h1 className="text-base font-bold mb-4 text-center">Pedido #{pedido.id && pedido.id}</h1>
          <h1 className="text-base font-bold mb-4 text-center">Código externo #{pedido.id_externo && pedido.id_externo}</h1>
        </div>

        <div className="grid grid-cols-2 gap-x-4 mb-4">
          <div><strong>Cliente:</strong> {pedido.cliente.nome}</div>
          <div><strong>Data:</strong> {pedido.data_cadastro}</div>
          <div><strong>Endereco:</strong> {pedido.cliente.endereco}</div>
          <div><strong>Numero:</strong> {pedido.cliente.numero}</div>
          <div><strong>Celular:</strong> {pedido.cliente.celular}</div>

          <div><strong>Vendedor:</strong> {pedido.vendedor}</div>  
        </div>

        <hr className="my-4"/>

        <h2 className="text-xl font-semibold mb-2">Produtos </h2>
        <table className="w-full text-sm border-collapse border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1 text-left">Cód.</th>
              <th className="border border-gray-300 p-1 text-left">Descrição</th>
              <th className="border border-gray-300 p-1 text-right">Qtd.</th>
              <th className="border border-gray-300 p-1 text-right">Vlr. Unit.</th>
              <th className="border border-gray-300 p-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {
            pedido.produtos &&     
            pedido.produtos?.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{item.codigo}</td>
                <td className="border border-gray-300 p-1">{item.descricao}</td>
                <td className="border border-gray-300 p-1 text-right">{item.quantidade}</td>
                <td className="border border-gray-300 p-1 text-right">R$ {item.preco?.toFixed(2)}</td>
                <td className="border border-gray-300 p-1 text-right">R$ {item.total?.toFixed(2)}</td>
              </tr>
            ))
             }
          </tbody>
        </table>

         <hr className="my-4"/>
      { pedido.servicos && pedido.servicos.length > 0 && (
        <>
         <h2 className="text-xl font-semibold mb-2">Serviços </h2>
        <table className="w-full text-sm border-collapse border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1 text-left">Cód.</th>
              <th className="border border-gray-300 p-1 text-left">Descrição</th>
              <th className="border border-gray-300 p-1 text-right">Qtd.</th>
              <th className="border border-gray-300 p-1 text-right">Vlr. Unit.</th>
              <th className="border border-gray-300 p-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
       {
            pedido.servicos?.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{item.codigo}</td>
                <td className="border border-gray-300 p-1">{item.aplicacao}</td>
                <td className="border border-gray-300 p-1 text-right">{item.quantidade}</td>
                <td className="border border-gray-300 p-1 text-right">R$ {item.valor?.toFixed(2)}</td>
                <td className="border border-gray-300 p-1 text-right">R$ {item.total?.toFixed(2)}</td>
              </tr>
            ))
             }
          </tbody>
        </table>
        </>
        )
      }
         <hr className="my-4"/>
      { pedido.parcelas && pedido.parcelas.length > 0 && (
        <>
         <h2 className="text-xl font-semibold mb-2">Parcelas </h2>
        <table className="w-full text-sm border-collapse border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1 text-left">Parcela</th>
              <th className="border border-gray-300 p-1 text-right">Valor.</th>
              <th className="border border-gray-300 p-1 text-right">Vencimento</th>
            </tr>
          </thead>
          <tbody>
       {
            pedido.parcelas?.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">{item.parcela}</td>
                <td className="border border-gray-300 p-1 text-right">R$ {item.valor?.toFixed(2)}</td>
                <td className="border border-gray-300 p-1 text-right">R$ {item.vencimento}</td>
              </tr>
            ))
             }
          </tbody>
        </table>
        </>
        )
      }

        {pedido.observacoes && (
           <div className="mb-4">
              <h3 className="font-semibold">Observações:</h3>
              <p className="text-sm whitespace-pre-wrap">{pedido.observacoes}</p>
           </div>
        )}


        <div className="text-right font-bold text-lg">
          Total Geral: R$ {pedido.total_geral?.toFixed(2)}
        </div>

      </div>
    </div>
  );
}