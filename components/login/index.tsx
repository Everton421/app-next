'use client'

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/lib/api";
import { ThreeDot } from 'react-loading-indicators';

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

export default function LoginForm() {
  const router = useRouter();
  const { setUser }: { setUser: (user: import("@/contexts/AuthContext").User | null) => void } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState(false);
  const [msgErro, setMsgErro] = useState<string | undefined>();

  const api = configApi();

  const login = async (email: string, senha: string) => {
    if (!email || !senha) {
      setErro(true);
      setMsgErro("Por favor, preencha o email e a senha.");
      throw new Error("Campos obrigatórios não preenchidos.");
    }

    const data = { email, senha };

    try {
      const response = await api.post(`/login`, data);
      if (response.status === 200) {
        setErro(false);
        setMsgErro(undefined);
        const token = response.data.token;

        const resultuser = await api.get('/usuarios', {
          headers: { token }
        });

        const userData = {
          token: response.data.token,
          codigo: resultuser.data.codigo,
          nome: resultuser.data.nome
        };

        setUser(userData);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setCookie('authToken', token);
        setCookie('authUser', JSON.stringify(userData));
        router.push('/home');
      } else {
        setErro(true);
        setMsgErro(response.data.msg || "Ocorreu um erro inesperado.");
        setUser(null);
        localStorage.removeItem('authUser');
        throw new Error(response.data.msg || "Erro na resposta da API");
      }
    } catch (e: unknown) {
      console.error('Ocorreu um erro ao tentar fazer o login', e);
      setErro(true);
      const errorMessage = e instanceof Error ? e.message : "Erro de conexão ou servidor.";
      setMsgErro(e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { msg?: string } } }).response?.data?.msg || errorMessage
        : errorMessage);
      setUser(null);
      localStorage.removeItem('authUser');
      throw e;
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro(false);
    setMsgErro(undefined);
    setIsSubmitting(true);

    try {
      await login(email, senha);
    } catch (e) {
      console.log('Falha no processo de login capturada em handleSubmit.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function navegateNovaConta() {
    router.push('/novaConta');
    setIsSubmitting(false);
  }

  return (
    <div className="flex items-center w-full justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <div className="w-full items-center flex justify-center mb-4">
          <Image
            className="rounded-3xl"
            alt="Logo da Empresa"
            width={200}
            height={200}
            priority
            src="/images/icon.png"
          />
        </div>

        {isSubmitting && (
          <div className="flex justify-center my-4">
            <ThreeDot variant="pulsate" color="#2563eb" size="medium" text="" textColor="" />
          </div>
        )}

        {erro && !isSubmitting && (
          <p className="text-red-500 text-sm text-center mb-4 font-bold">{msgErro}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${erro && !email ? 'border-red-500' : ''} ${isSubmitting ? 'bg-gray-200 cursor-not-allowed' : ''}`}
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
              placeholder="seuemail@exemplo.com"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${erro && !senha ? 'border-red-500' : ''} ${isSubmitting ? 'bg-gray-200 cursor-not-allowed' : ''}`}
              value={senha}
              onChange={(e) => { setSenha(e.target.value) }}
              placeholder="********"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
            <a className={`inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`} href="#">
              Esqueceu a senha?
            </a>
          </div>
        </form>

        <div className="m-3 items-center justify-end flex w-full ">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
            onClick={() => navegateNovaConta()}
          >
            {'Teste Grátis'}
          </button>
        </div>
        <p className="text-center text-gray-500 text-xs mt-4">
          © {new Date().getFullYear()} Minha Empresa. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}