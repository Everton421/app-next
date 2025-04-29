 
'use client'
 
 import React, { createContext, useState, useContext, useEffect, Children } from "react";
import {   useRouter } from "next/navigation"
type user = {
    codigo:number,
    cnpj:string
    vendedor:number
    nome:string
}
const AuthContext  = createContext({});

export const AuthProvider = ({children}: any )=>{
    
    const [ user, setUser ]= useState<user | null >(null); //armazena os dados do usuario, { usuario, cnpj, etc..}
    const [ loading, setloading ] = useState<boolean>(true); // para saber se já foi verificado o localStorage
    
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


    const logout = ()=>{
        setUser(null);
        localStorage.removeItem('authUser')
    }

    const value = {
        user,
        loading,
        logout,
        setUser,
        
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
