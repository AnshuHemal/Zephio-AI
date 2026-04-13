"use client";
import { AuthProvider } from "@/components/auth-context";

export function InsforgeProvider({ children, user }: { children: React.ReactNode, user?: any }) {
  return (
    <AuthProvider initialUser={user}>
      {children}
    </AuthProvider>
  );
}
