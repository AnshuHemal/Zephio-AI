import { getCurrentUser } from "@/lib/insforge-server";
import { redirect } from "next/navigation";
import ChatInterface from "@/components/chat";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export default async function NewProjectPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner className="size-10 stroke-1" />
        </div>
      }
    >
      <ChatInterface isProjectPage={false} />
    </Suspense>
  );
}
