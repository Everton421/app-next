// import type { Metadata } from "next";
// import localFont from "next/font/local";

  'use client'

import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import Navbar from "@/components/navbar";

 import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
 

 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const novaConta = pathname === '/novaConta';
    const init = pathname === '/';


  return (
    <AuthProvider>
    <html lang="pt-br">
      <body
        className={ cn("  bg-background font-sans antialiased  overflow-x-hidden "  )}
      >
         {
         !isLoginPage && !novaConta && !init &&
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
