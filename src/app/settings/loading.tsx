export default function SettingsLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <span className="load-dot" aria-hidden />
      <span className="sr-only">Loading settings</span>
    </div>
  );
}
