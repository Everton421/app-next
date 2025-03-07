
'use client'

import AuthContex from "@/contexts/AuthContext";
import Image from "next/image";
import { useContext, useState } from "react";
import { signIn } from 'next-auth/react';
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";


export default function LoginForm() {

        const router = useRouter()

    const [ email, setEmail] = useState<string>();
    const [senha, setSenha ] = useState<string>();
    


    async function login (e){
        e.preventDefault()
        const data = { 
            email: email, senha: senha
        }
        
               signIn("credentials",{
                ...data,
                callbackUrl:"/home"
            })
    }

        
       

    return (
        <div className="flex items-center w-full justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
                <div className="w-full items-center flex justify-center">
                    <Image
                        className="rounded-sm ml-1"
                        src="/images/next.jpg"
                        alt="img"
                        width={180}
                        height={180}
                    />
                </div>

                <form
                //onSubmit={handleSubmit}
                 onSubmit={login}
                >
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            onChange={(e)=>{ setEmail(e.target.value)}}
                            placeholder="Email"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Senha
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            onChange={(e)=>{ setSenha(e.target.value)}}
                            placeholder="Senha"
                        />
                        {/* <p className="text-red-500 text-xs italic">Please choose a password.</p> */}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Entrar
                        </button>
                        <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                            Esqueceu a senha?
                        </a>
                    </div>
                </form>
                <p className="text-center text-gray-500 text-xs mt-4">
                    © {new Date().getFullYear()} Minha Empresa. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}