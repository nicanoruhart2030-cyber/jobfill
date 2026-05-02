export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-start px-6 py-12">
      <span className="load-dot" aria-hidden />
      <span className="sr-only">Loading</span>
    </div>
  );
}
