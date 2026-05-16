// ============================================================
// DataNest - Skeleton de carga del dashboard
// Next.js muestra este componente mientras se cargan los datos del server
// ============================================================

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-7 w-36 rounded-xl" />
          <div className="skeleton h-4 w-56 rounded-lg" />
        </div>
        <div className="skeleton h-9 w-28 rounded-xl" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="flex items-start justify-between">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>
            <div className="skeleton h-8 w-32 rounded-lg" />
            <div className="skeleton h-4 w-44 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="card">
        <div className="skeleton h-5 w-56 rounded-lg mb-5" />
        <div className="skeleton h-60 w-full rounded-2xl" />
      </div>

      {/* Bottom grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[0, 1].map((i) => (
          <div key={i} className="card space-y-3">
            <div className="skeleton h-5 w-36 rounded-lg" />
            {[...Array(5)].map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="skeleton h-6 w-6 rounded-full" />
                <div className="skeleton h-10 flex-1 rounded-xl" />
                <div className="skeleton h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
