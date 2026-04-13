"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet , SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {
  Car,
  Home,
  Package,
  Settings,
  ShoppingCart,
  User,
  Wrench,
  Menu,
  LayoutDashboard,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  
   { href: "/cadastros/produtos", label: "Produtos", icon: Package },
   { href: "/cadastros/clientes", label: "Clientes", icon: User },
   { href: "/cadastros/servicos", label: "Serviços", icon: Wrench },
   { href: "/cadastros/veiculos", label: "Veículos", icon: Car },
];

const NavItem = ({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  collapsed?: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
      collapsed ? "justify-center" : "",
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
    )}
  >
    <Icon className="h-5 w-5 shrink-0" />
    {!collapsed && <span>{label}</span>}
  </Link>
);

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r border-sidebar-border bg-sidebar sm:flex print:hidden">
        {/* Logo */}
         <Link  href={'/home'} >
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent">
              <LayoutDashboard className="h-5 w-5 text-sidebar-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">
            </span>
          </div>
         </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Menu Principal
          </p>
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname === item.href || pathname?.startsWith(item.href + "/")}
            />
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <NavItem
            href="/configuracoes"
            label="Configurações"
            icon={Settings}
            isActive={pathname === "/configuracoes"}
          />
        </div>
      </aside>

      {/* Mobile Header & Sheet */}
      <div className="sm:hidden print:hidden">
        <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-4 border-b bg-sidebar px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 bg-sidebar p-0 border-sidebar-border">
              {/* Mobile Logo */}
              <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent">
                  <LayoutDashboard className="h-5 w-5 text-sidebar-foreground" />
                </div>
                <span className="text-lg font-semibold text-sidebar-foreground">
                  Gestão Pro
                </span>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 space-y-1 px-3 py-4">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  Menu Principal
                </p>
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href || pathname?.startsWith(item.href + "/")}
                  />
                ))}
              </nav>

              {/* Mobile Settings */}
              <div className="border-t border-sidebar-border px-3 py-4">
                <NavItem
                  href="/configuracoes"
                  label="Configurações"
                  icon={Settings}
                  isActive={pathname === "/configuracoes"}
                />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-lg font-semibold text-sidebar-foreground">
            Gestão Pro
          </span>
        </header>
        {/* Spacer for fixed header */}
        <div className="h-14" />
        
      </div>
    </>
  );
}
