// import type { Metadata } from "next";
// import localFont from "next/font/local";

  'use client'

import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { useContext } from "react";

 import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
 

 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const pathname = usePathname();
    const isLoginPage = pathname === '/';
    const novaConta = pathname === '/novaConta';

  return (
    <AuthProvider>
    <html lang="pt-br">
      <body
        className={ cn("min-h-screen bg-background font-sans antialiased overflow-hidden "  )}
      >
         {
         !isLoginPage && !novaConta &&
         (
        <>   
           <Sidebar/>
              <Navbar/>
            </>
             )
          }
          
            {children}

      </body>
    </html>
    </AuthProvider>
  );
}
