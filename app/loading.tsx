export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6" aria-label="Cargando dashboard">
      <div className="mx-auto max-w-[1500px] animate-pulse space-y-5">
        <div className="h-20 rounded-2xl bg-[#E7EDF4]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <div className="h-36 rounded-2xl bg-[#E7EDF4]" key={index} />)}
        </div>
        <div className="h-[420px] rounded-2xl bg-[#E7EDF4]" />
      </div>
    </main>
  );
}
