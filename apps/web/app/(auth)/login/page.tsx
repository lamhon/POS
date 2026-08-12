import type { Metadata } from "next";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="mt-2 text-sm text-gray-500">
          Authentication sẽ được triển khai tại F3.
        </p>
      </div>
    </div>
  );
}
