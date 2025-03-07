// import type { Metadata } from "next";
// import localFont from "next/font/local";

  'use client'

import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import Navbar from "@/components/navbar";
import Login from "./login/page";
import { useContext } from "react";
import AuthContex, { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
 

 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const pathname = usePathname();
    const isLoginPage = pathname === '/';


  return (
    <AuthProvider>
    <html lang="en">
      <body
        className={ cn("min-h-screen bg-background font-sans antialiased"  )}
      >
         {
         !isLoginPage &&
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
