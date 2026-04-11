'use client'

import { Sidebar } from "./_components/sidebar";
import Navbar from "./_components/navbar";

export default function MarketplacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}
