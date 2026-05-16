// ============================================================
// DataNest - Hook personalizado para datos del dashboard
// Maneja fetching, loading, error y re-fetch con polling opcional
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import type { DashboardData } from "@/types";

interface UseDashboardReturn {
  data:    DashboardData | null;
  loading: boolean;
  error:   string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useDashboard(autoRefreshMs?: number): UseDashboardReturn {
  const [data, setData]               = useState<DashboardData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef                   = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Error ${res.status}`);
      }
      const json: DashboardData = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling automático (opcional)
  useEffect(() => {
    if (!autoRefreshMs) return;
    intervalRef.current = setInterval(fetchData, autoRefreshMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefreshMs, fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}
