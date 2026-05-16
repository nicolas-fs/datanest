// ============================================================
// DataNest - Sidebar de navegación
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  PlugZap,
  MessageSquareText,
  LogOut,
  Database,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const NAV_ITEMS = [
  { href: "/",        label: "Dashboard",      icon: LayoutDashboard },
  { href: "/connect", label: "Conectar fuente", icon: PlugZap },
  { href: "/chat",    label: "Asistente IA",    icon: MessageSquareText },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-surface-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-surface-900 leading-none">DataNest</p>
            <p className="text-xs text-surface-400 mt-0.5">Centro de datos</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-brand-50 text-brand-600"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  active ? "text-brand-500" : "text-surface-400 group-hover:text-surface-600"
                )}
              />
              {label}
              {active && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + Cerrar sesión */}
      <div className="p-4 border-t border-surface-100">
        <div className="flex items-center gap-3 mb-3 px-1">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden text-brand-600 font-bold text-sm flex-shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
            ) : (
              (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-800 truncate">{user.name}</p>
            <p className="text-xs text-surface-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-500
                     hover:text-danger-500 hover:bg-danger-400/5 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
