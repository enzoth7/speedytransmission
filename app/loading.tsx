export default function Loading() {
  return (
    <main className="min-h-screen bg-[#EDF2F7] p-6" aria-label="Loading dashboard">
      <div className="mx-auto max-w-[1500px] animate-pulse space-y-5">
        <div className="h-20 rounded-xl bg-[#DFE7EF]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div className="h-36 rounded-xl bg-[#DFE7EF]" key={index} />)}
        </div>
        <div className="h-[420px] rounded-xl bg-[#DFE7EF]" />
      </div>
    </main>
  );
}
