import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-500">
        Chào mừng đến với Personal OS. Chọn module từ menu bên trái.
      </p>
    </div>
  );
}
