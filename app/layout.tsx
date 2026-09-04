import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClientLayout } from "./client-layout";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientLayout inter={inter}>
      {children}
    </ClientLayout>
  );
}