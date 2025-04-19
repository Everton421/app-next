 
'use client'
 
 import React, { createContext, useState, useContext, useEffect, Children } from "react";
import { cookies } from "next/headers";
import { configApi } from "@/app/services/api";
import { redirect, useRouter } from "next/navigation"

// 1. Criar o contexto 
const AuthContext:any = createContext({});


// 2. criar o provedor do contexto
export const AuthProvider = ({children}: any )=>{
  const router = useRouter();
    
    const [ user, setUser ]= useState(null); //armazena os dados do usuario, { usuario, cnpj, etc..}
    const [ loading, setloading ] = useState(true); // para saber se já foi verificado o localStorage
   // const router = useRouter();
    
    const api = configApi() 

    // 3. efeito para carregar dados do usuario do localStorage ao iniciar 
    useEffect(()=>{
        const storedUser = localStorage.getItem('authUser');

        if(storedUser)  {
            try{
                setUser(JSON.parse(storedUser));
            }catch(e){
                console.error('Erro ao transformar usuario do localStorage ', e );
                localStorage.removeItem('authUser');
            }
        }
        setloading(false);
    },[]);


    // 4. função de login.
    const login = async (email:string, senha:string) => {
       
        const data =  { email:email, senha:senha }

        try{
            const response = await api.post(`/login`, data );

            if( response.status === 200 && response.data.ok){
                console.log(response.data)
                 
                    const userData:any = {
                        cnpj: response.data.empresa,
                        vendedor:response.data.codigo,
                    }
                    setUser(userData);
                    router.push('/home')
                    localStorage.setItem('authUser', JSON.stringify(userData));

            }else{
                throw new Error( response.data.msg)
            }
        }catch(e){
            console.log('Ocorreu um erro ao tentar fazer o login', e );
            setUser(null)
            localStorage.removeItem('authUser')
            throw e;
        }
    }

    // 5. função de logout 
    const logout = ()=>{
        setUser(null);
        localStorage.removeItem('authUser')
    }

    // 6. valor fornecido pelo contexto 
    const value = {
        user,
        loading,
        login,
        logout,setUser
    }

    return ( 
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
    )
}

export const useAuth = ()=>{
    return useContext(AuthContext);
}
