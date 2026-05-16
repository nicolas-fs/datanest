// ============================================================
// DataNest - Skeleton de carga para la página del chatbot
// ============================================================

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div>
            <div className="skeleton h-5 w-28 rounded-lg mb-1" />
            <div className="skeleton h-3 w-44 rounded-lg" />
          </div>
        </div>
        <div className="skeleton h-8 w-20 rounded-xl" />
      </div>

      {/* Mensajes skeleton */}
      <div className="flex-1 py-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
          <div className="skeleton h-20 w-64 rounded-2xl rounded-tl-sm" />
        </div>
      </div>

      {/* Input skeleton */}
      <div className="border-t border-surface-200 pt-4">
        <div className="flex gap-3">
          <div className="skeleton h-11 flex-1 rounded-xl" />
          <div className="skeleton w-11 h-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
