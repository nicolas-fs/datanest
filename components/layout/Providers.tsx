// ============================================================
// DataNest - Wrapper de providers del lado cliente
// Next.js requiere que SessionProvider sea un Client Component
// ============================================================

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
