import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quân nhân" };

export default function PersonnelPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Quản lý Quân nhân</h1>
      <p className="mt-2 text-gray-500">Module Military Personnel sẽ được triển khai tại F6+.</p>
    </div>
  );
}
