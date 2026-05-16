// ============================================================
// DataNest - Componente EmptyState reutilizable
// Usado cuando no hay datos para mostrar en una sección
// ============================================================

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon:        LucideIcon;
  title:       string;
  description: string;
  action?:     { label: string; href?: string; onClick?: () => void };
  className?:  string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-surface-400" />
      </div>
      <h3 className="text-sm font-semibold text-surface-700 mb-1">{title}</h3>
      <p className="text-xs text-surface-400 max-w-xs">{description}</p>

      {action && (
        <div className="mt-4">
          {action.href ? (
            <Link href={action.href} className="btn-primary text-sm px-4 py-2">
              {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className="btn-primary text-sm px-4 py-2">
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
