export default function SwipeLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
      <span className="load-dot" aria-hidden />
      <span className="sr-only">Loading jobs</span>
    </div>
  );
}
