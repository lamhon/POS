import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sổ tay Quân sự" };

export default function ManualPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Sổ tay Quân sự điện tử</h1>
      <p className="mt-2 text-gray-500">Module Military Manual sẽ được triển khai tại F6+.</p>
    </div>
  );
}
