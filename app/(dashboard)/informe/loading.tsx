// ============================================================
// DataNest - Skeleton de carga para /informe
// ============================================================

export default function InformeLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="skeleton h-3 w-16 rounded mb-3" />
        <div className="skeleton h-8 w-52 rounded-xl mb-2" />
        <div className="skeleton h-4 w-64 rounded-lg" />
      </div>

      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-start gap-3">
              <div className="skeleton w-4 h-4 rounded mt-1 flex-shrink-0" />
              <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded-lg" />
                <div className="skeleton h-3 w-full rounded-lg" />
                <div className="skeleton h-3 w-1/2 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card space-y-4">
        <div className="skeleton h-5 w-32 rounded-lg" />
        <div className="skeleton h-3 w-72 rounded-lg" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="skeleton h-11 flex-1 rounded-xl" />
          <div className="skeleton h-11 w-28 rounded-xl" />
          <div className="skeleton h-11 w-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
