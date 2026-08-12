import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cài đặt" };

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Cài đặt</h1>
      <p className="mt-2 text-gray-500">Cài đặt hệ thống sẽ được triển khai tại F4+.</p>
    </div>
  );
}
