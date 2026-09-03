export function LoadingPanel({ label }: { label: string }) {
  return (
    <section className="panel p-6" aria-live="polite" aria-busy="true">
      <div className="h-3 w-36 rounded bg-white/10" />
      <div className="mt-4 h-7 w-3/4 rounded bg-white/10" />
      <p className="mt-4 text-sm text-muted">{label}</p>
    </section>
  );
}
