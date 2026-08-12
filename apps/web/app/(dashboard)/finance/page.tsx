import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tài chính" };

export default function FinancePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Tài chính</h1>
      <p className="mt-2 text-gray-500">Module Finance sẽ được triển khai tại F5.</p>
    </div>
  );
}
