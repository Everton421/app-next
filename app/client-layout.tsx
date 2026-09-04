'use client'

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export function ClientLayout({ 
  children,
  inter
}: { 
  children: React.ReactNode;
  inter: { variable: string };
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/login';
  const novaConta = pathname === '/novaConta';
  const init = pathname === '/';

  return (
    <AuthProvider>
      <html lang="pt-br" className={inter.variable}>
        <body className={cn("min-h-screen bg-background font-sans antialiased")}>
          {mounted && !isLoginPage && !novaConta && !init && (
            <>
              <Sidebar />
              <Navbar />
            </>
          )}
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </AuthProvider>
  );
}