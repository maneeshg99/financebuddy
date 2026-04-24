export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading ticker">
      {/* Header strip */}
      <section className="rounded-md border border-border bg-panel p-5">
        <div className="h-3 w-64 bg-border mb-4" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-28 bg-border" />
            <div className="h-5 w-44 bg-border" />
            <div className="h-3 w-32 bg-border" />
          </div>
          <div className="space-y-2 md:text-right">
            <div className="h-8 w-32 bg-border md:ml-auto" />
            <div className="h-4 w-28 bg-border md:ml-auto" />
            <div className="h-3 w-24 bg-border md:ml-auto" />
          </div>
        </div>
      </section>

      {/* Price panel (collapsed state) */}
      <section className="rounded-md border border-border bg-panel">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="h-3 w-32 bg-border" />
          <div className="h-3 w-5 bg-border" />
        </div>
      </section>

      {/* Tab nav */}
      <div className="rounded-md border border-border bg-panel flex overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-10 border-r border-border last:border-r-0 bg-panel2"
          />
        ))}
      </div>

      {/* Active panel placeholder — score-shaped since it's the default tab */}
      <section className="rounded-md border border-border bg-panel p-5">
        <div className="flex items-baseline justify-between mb-5">
          <div className="h-3 w-48 bg-border" />
          <div className="h-3 w-64 bg-border hidden md:block" />
        </div>
        <div className="h-14 w-24 bg-border mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-md border border-border bg-panel2"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
