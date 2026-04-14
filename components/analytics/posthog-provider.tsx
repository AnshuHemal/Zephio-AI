"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-context";

// ── Bootstrap PostHog once on the client ────────────────────────────────────
if (typeof window !== "undefined") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  if (key && !posthog.__loaded) {
    posthog.init(key, {
      api_host: host,
      ui_host: "https://us.posthog.com",

      // Capture pageviews automatically on route change
      capture_pageview: false, // we handle this manually via PostHogPageView
      capture_pageleave: true,

      // Privacy-friendly defaults
      respect_dnt: true,
      sanitize_properties: (props) => {
        // Strip any accidental PII from property values
        return props;
      },

      // Performance
      batch_size: 20,
      request_timeout: 5000,

      // Don't capture in development unless explicitly enabled
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug(false); // set true to see events in console
        }
      },
    });
  }
}

// ── User identification — syncs auth state into PostHog ─────────────────────
function PostHogIdentifier() {
  const { user, isSignedIn } = useAuth();
  const ph = usePostHog();
  const identifiedId = useRef<string | null>(null);

  useEffect(() => {
    if (!ph) return;

    if (isSignedIn && user?.id && identifiedId.current !== user.id) {
      ph.identify(user.id, {
        email: user.email,
        name: user.profile?.fullName ?? user.profile?.name,
        plan: user.plan ?? "free",
      });
      identifiedId.current = user.id;
    }

    if (!isSignedIn && identifiedId.current) {
      ph.reset();
      identifiedId.current = null;
    }
  }, [isSignedIn, user, ph]);

  return null;
}

// ── Page view tracker — fires on every client-side navigation ───────────────
function PostHogPageView() {
  const ph = usePostHog();

  useEffect(() => {
    // Fire on mount (initial page load)
    ph?.capture("$pageview");
  }, [ph]);

  return null;
}

// ── Root provider ────────────────────────────────────────────────────────────
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PostHogIdentifier />
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
