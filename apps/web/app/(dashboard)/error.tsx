"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Something went wrong!</h1>
        <p className="text-neutral-400 mb-6 max-w-md mx-auto">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
      <button
        onClick={reset}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        Thử lại
      </button>
    </div>
  );
}
