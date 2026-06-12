export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink">Tailoring your resume…</p>
        <p className="mt-1 text-xs text-gray-400">This usually takes 10–20 seconds</p>
      </div>
    </div>
  );
}
