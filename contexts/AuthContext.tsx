import React, { createContext, useState } from "react";


  const AuthContex = createContext(
    { 
        nomeVendedor: 0,
        logado: false,
        setLogado: ()=>{},
        setNomeVendedor: ()=>{},
        codigoVendedor:0,
        setCodigoVendedor:()=>{},
        nomeEmpresa:'',
        setNomeEmpresa:()=>{},
        cnpj:'',
        setCnpj:()=>{}
    }
);


export function AuthProvider   ({children})   {

    const [ logado, setLogado ] = useState<boolean>(false)
    const [ nomeVendedor, setNomeVendedor ] = useState();
    const [ codigoVendedor, setCodigoVendedor ] = useState();
    const [ nomeEmpresa, setNomeEmpresa ] = useState();
    const [ cnpj, setCnpj ] = useState();
    
    const value = {
        logado,
        nomeVendedor,
        setNomeVendedor,
        setLogado,
        codigoVendedor,
        setCodigoVendedor,
        nomeEmpresa,
        setNomeEmpresa,
        cnpj,
        setCnpj
    }

    return(
        <AuthContex.Provider value={ value} >
            {children}
        </AuthContex.Provider>
    )
}

export default AuthContex