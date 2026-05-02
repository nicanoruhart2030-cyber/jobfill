export default function ResultsLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <span className="load-dot" aria-hidden />
      <span className="sr-only">Loading applications</span>
    </div>
  );
}
