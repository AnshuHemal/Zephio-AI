"use client";

import React, { createContext, useContext, useState } from "react";
import { signOutAction } from "@/app/auth/actions";

type AuthContextType = {
  isSignedIn: boolean;
  user: any | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  user: null,
  signOut: async () => {},
});

export const AuthProvider = ({ children, initialUser }: { children: React.ReactNode, initialUser?: any }) => {
  const [user, setUser] = useState<any | null>(initialUser ?? null);

  const handleSignOut = async () => {
    setUser(null);
    await signOutAction();
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: !!user,
        user,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return null;
  return <>{children}</>;
};

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return null;
  return <>{children}</>;
};
