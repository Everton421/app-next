'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

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
      <html lang="pt-br" className={inter.variable}>
        <body className={cn("min-h-screen bg-background font-sans antialiased")}>
          {!isLoginPage && !novaConta && !init && (
            <>
              <Sidebar />
              <Navbar />
            </>
          )}
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
