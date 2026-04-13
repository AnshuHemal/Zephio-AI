import { getCurrentUser } from "@/lib/insforge-server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/dashboard-client";

export const metadata = {
  title: "Dashboard — Zephio",
  description: "All your Zephio projects in one place.",
};

export default async function DashboardPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  return <DashboardClient user={user} />;
}
