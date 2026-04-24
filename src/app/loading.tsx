export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading">
      <section className="text-center py-12">
        <div className="h-3 w-64 mx-auto bg-border mb-6" />
        <div className="h-12 w-3/4 max-w-2xl mx-auto bg-border mb-3" />
        <div className="h-12 w-2/3 max-w-2xl mx-auto bg-border mb-6" />
        <div className="h-4 w-2/3 max-w-xl mx-auto bg-border mb-8" />
        <div className="h-12 max-w-xl mx-auto bg-border mb-4 rounded-md" />
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-16 bg-border rounded-md" />
          ))}
        </div>
      </section>
      <div className="rounded-md border border-border bg-panel p-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="h-3 w-36 bg-border" />
          <div className="h-3 w-16 bg-border" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 bg-border rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
