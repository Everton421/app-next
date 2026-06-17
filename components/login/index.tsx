'use client'

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { configApi } from "@/lib/api";
import { ThreeDot } from 'react-loading-indicators';
import { User, Lock, Eye, EyeOff, LogIn, Sun, Rocket } from "lucide-react";

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

export default function LoginForm() {
  const router = useRouter();
  const { setUser }: { setUser: (user: import("@/contexts/AuthContext").User | null) => void } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
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
        const token = response.data.token;
        const resultuser = await api.get('/usuarios', { headers: { token } });
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
        throw new Error(response.data.msg || "Erro na resposta da API");
      }
    } catch (e: any) {
      setErro(true);
      setMsgErro(e.response?.data?.msg || "Erro de conexão ou servidor.");
      throw e;
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro(false);
    setIsSubmitting(true);
    try {
      await login(email, senha);
    } catch (e) {
      console.log('Falha no login');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#1a202c] text-white">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 border-r border-gray-700 bg-[#1e2533]">
        <div className="flex flex-col items-center">
            {/* Substitua pelo seu logo real */}
          <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-cyan-400 rounded-lg shadow-[4px_4px_0px_0px_rgba(45,55,72,1)]">

               </div>
             <h1 className="text-6xl font-bold tracking-tighter text-gray-200">intersig</h1>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formuário */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-[#FFF]">
        <div className="w-full max-w-md bg-[#2d3748] p-8 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-200">Acessar Sistema</h2>

          {erro && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 text-sm rounded text-center">
              {msgErro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuário / Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Selecione seu usuário</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-[#1a202c] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-200 placeholder-gray-600"
                  placeholder="Selecione seu usuário"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-[#1a202c] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-200 placeholder-gray-600"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Lembrar-me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-400 cursor-pointer">
                Lembrar-me
              </label>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#5a67d8] hover:bg-[#4c51bf] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <ThreeDot color="#fff" size="small" />
              ) : (
                <>
                  <LogIn size={18} /> Entrar
                </>
              )}
            </button>

            <div className="text-center">
              <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Esqueci minha senha
              </button>
                  <button
                type="button"
                onClick={() => router.push('/novaConta')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
              >
                <Rocket size={18} /> Teste Grátis
              </button>
            </div>

            <div className="border-t border-gray-600 pt-6">
          
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-gray-500 text-xs">
          © {new Date().getFullYear()} Intersig Sistemas. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}