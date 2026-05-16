// ============================================================
// DataNest - Componente Badge reutilizable
// ============================================================

import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "red" | "indigo" | "gray" | "orange" | "yellow";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  green:  "bg-accent-400/15 text-accent-600",
  red:    "bg-danger-400/15 text-danger-500",
  indigo: "bg-brand-100 text-brand-600",
  gray:   "bg-surface-100 text-surface-600",
  orange: "bg-orange-50 text-orange-600",
  yellow: "bg-yellow-50 text-yellow-700",
};

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
