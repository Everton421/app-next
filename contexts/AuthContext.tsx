'use client'

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  codigo: number;
  cnpj?: string;
  vendedor?: number;
  nome: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Erro ao transformar usuario do localStorage ', e);
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    document.cookie = 'authUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    loading,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};