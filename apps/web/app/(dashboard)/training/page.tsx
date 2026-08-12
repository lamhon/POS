import type { Metadata } from "next";

export const metadata: Metadata = { title: "Huấn luyện" };

export default function TrainingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Quản lý Huấn luyện</h1>
      <p className="mt-2 text-gray-500">Module Training sẽ được triển khai tại F6+.</p>
    </div>
  );
}
