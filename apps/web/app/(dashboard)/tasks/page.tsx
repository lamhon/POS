import type { Metadata } from "next";

export const metadata: Metadata = { title: "Công việc" };

export default function TasksPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Quản lý Công việc</h1>
      <p className="mt-2 text-gray-500">Module Tasks sẽ được triển khai tại F6+.</p>
    </div>
  );
}
