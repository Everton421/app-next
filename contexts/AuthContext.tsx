import { createContext, useState } from "react";


  const AuthContex = createContext(
    { 
        vendedor: 0,
        logado: false,
        setLogado: ()=>{},
        setVendedor: ()=>{}
    }
);


export function AuthProvider   ({children})   {

    const [ logado, setLogado ] = useState<boolean>(false)
    const [ vendedor, setVendedor ] = useState();
    
    const value = {
        logado,
        vendedor,
        setLogado,
        setVendedor
    }
    return(
        <AuthContex.Provider value={ value} >
            {children}
        </AuthContex.Provider>
    )
}

export default AuthContex