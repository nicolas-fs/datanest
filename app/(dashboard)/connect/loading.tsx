// ============================================================
// DataNest - Skeleton de carga para la página Conectar fuente
// ============================================================

export default function ConnectLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="skeleton h-7 w-56 rounded-xl mb-2" />
        <div className="skeleton h-4 w-72 rounded-lg" />
      </div>

      <div className="card">
        <div className="skeleton h-5 w-40 rounded-lg mb-4" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex gap-1 bg-surface-100 rounded-xl p-1 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 skeleton h-9 rounded-lg" />
          ))}
        </div>
        <div className="skeleton h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
