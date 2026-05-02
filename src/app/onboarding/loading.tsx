export default function OnboardingLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <span className="load-dot" aria-hidden />
      <span className="sr-only">Loading</span>
    </div>
  );
}
