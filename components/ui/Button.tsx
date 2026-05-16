// ============================================================
// DataNest - Componente Button reutilizable con variantes
// ============================================================

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  icon?:     React.ReactNode;
  children:  React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   "bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-glow",
  secondary: "bg-surface-100 text-surface-800 border border-surface-200 hover:bg-surface-200",
  danger:    "bg-danger-500 text-white hover:bg-danger-500/90",
  ghost:     "text-surface-600 hover:text-surface-900 hover:bg-surface-100",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

export function Button({
  variant  = "primary",
  size     = "md",
  loading  = false,
  icon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200",
        "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
