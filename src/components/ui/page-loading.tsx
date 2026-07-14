export function PageLoading() {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mx-auto max-w-7xl space-y-6"
    >
      <span className="sr-only">Carregando dados...</span>

      <div
        aria-hidden="true"
        className="animate-pulse space-y-6 motion-reduce:animate-none"
      >
        <div className="space-y-3">
          <div className="h-9 w-48 rounded-lg bg-slate-200 sm:w-64" />
          <div className="h-4 w-full max-w-lg rounded bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-28 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-5 h-7 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 sm:px-6">
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="h-10 w-28 rounded-lg bg-slate-200" />
            </div>
            <div className="divide-y divide-slate-100 px-5 sm:px-6">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex h-16 items-center gap-4">
                  <div className="size-9 shrink-0 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/5 rounded bg-slate-200" />
                    <div className="h-3 w-3/5 rounded bg-slate-100" />
                  </div>
                  <div className="h-7 w-20 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          </div>

          <div className="h-72 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-7 space-y-5">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="size-9 shrink-0 rounded-lg bg-slate-100" />
                  <div className="h-3 flex-1 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
