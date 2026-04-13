import { getCurrentUser } from "@/lib/insforge-server";
import { redirect } from "next/navigation";

// /app now redirects to /dashboard — the dashboard is the home screen
export default async function AppPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  redirect("/dashboard");
}
