import { redirect } from "next/navigation";
import { verifyAuthFromCookies } from "@/lib/auth";
import DashboardClient from "@/components/dashboard-client";

export default async function DashboardPage() {
  const isAuthenticated = await verifyAuthFromCookies();

  if (!isAuthenticated) {
    redirect("/admin");
  }

  return <DashboardClient />;
}
