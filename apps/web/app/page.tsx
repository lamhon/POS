import { redirect } from 'next/navigation';

export default function Home() {
  // Simple redirect to the dashboard
  // ProtectedRoute inside DashboardLayout will handle bouncing unauthenticated users to /login
  redirect('/dashboard');
}
