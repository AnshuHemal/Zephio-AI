import { getCurrentUser } from "@/lib/insforge-server";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/landing-page";

export default async function Home() {
  const { user } = await getCurrentUser();
  if (user) redirect("/app");
  return <LandingPage />;
}