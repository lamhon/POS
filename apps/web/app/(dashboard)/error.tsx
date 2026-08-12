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
      <p className="text-sm text-red-600">Đã xảy ra lỗi. Vui lòng thử lại.</p>
      <button
        onClick={reset}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        Thử lại
      </button>
    </div>
  );
}
