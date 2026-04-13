"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { signOutAction } from "@/app/auth/actions";
import { setSentryUser, clearSentryUser } from "@/lib/sentry";

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

  // Set Sentry user context whenever the user changes
  useEffect(() => {
    if (user?.id) {
      setSentryUser({
        id: user.id,
        email: user.email,
        name: user.profile?.name,
      });
    } else {
      clearSentryUser();
    }
  }, [user]);

  const handleSignOut = async () => {
    clearSentryUser();
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
