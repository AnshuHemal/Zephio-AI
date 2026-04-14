/**
 * Zephio Analytics — PostHog event definitions & typed capture helpers.
 *
 * All event names and their property shapes live here so every call-site
 * is type-safe and the event catalogue is easy to audit in one place.
 *
 * Client usage:  import { useAnalytics } from "@/lib/analytics"
 * Server usage:  import { captureServerEvent } from "@/lib/analytics"
 */

// ── Event catalogue ──────────────────────────────────────────────────────────

export type AnalyticsEvents = {
  // Generation lifecycle
  generation_started: {
    slug_id: string;
    prompt_length: number;
    has_image: boolean;
    has_style_preset: boolean;
    intent: "generate" | "regenerate" | "chat";
  };
  generation_completed: {
    slug_id: string;
    page_count: number;
    duration_ms: number;
    intent: "generate" | "regenerate";
  };
  generation_failed: {
    slug_id: string;
    reason: string;
    intent: string;
  };
  generation_canceled: {
    slug_id: string;
  };

  // Export & sharing
  export_downloaded: {
    slug_id: string;
    page_count: number;
    format: "zip" | "single_html";
  };
  share_link_copied: {
    slug_id: string;
    page_count: number;
  };

  // Upgrade funnel
  upgrade_modal_opened: {
    trigger: "limit_reached" | "credits_badge" | "manual";
    used: number;
    limit: number;
    plan: string;
  };
  upgrade_clicked: {
    source: "modal" | "pricing_page" | "banner";
    plan_selected: string;
  };

  // Templates
  template_selected: {
    template_id: string;
    template_label: string;
    template_category: string;
  };

  // Project management
  project_created: {
    slug_id: string;
  };
  project_deleted: {
    slug_id: string;
  };
  project_duplicated: {
    slug_id: string;
  };
  project_renamed: {
    slug_id: string;
  };

  // Auth
  sign_up_completed: {
    method: "email";
  };
  sign_in_completed: {
    method: "email";
  };

  // Page actions
  page_deleted: {
    slug_id: string;
    page_name: string;
  };
  page_regenerated: {
    slug_id: string;
    page_name: string;
  };
  page_renamed: {
    slug_id: string;
  };

  // Feedback
  page_feedback_submitted: {
    slug_id: string;
    page_id: string;
    rating: "up" | "down";
  };
};

export type EventName = keyof AnalyticsEvents;

// ── Client-side hook ─────────────────────────────────────────────────────────

import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

/**
 * useAnalytics — typed wrapper around PostHog's capture().
 *
 * @example
 * const { capture } = useAnalytics()
 * capture("generation_started", { slug_id: "abc", prompt_length: 42, ... })
 */
export function useAnalytics() {
  const posthog = usePostHog();

  const capture = useCallback(
    <E extends EventName>(event: E, properties: AnalyticsEvents[E]) => {
      try {
        posthog?.capture(event, properties);
      } catch {
        // Never let analytics crash the app
      }
    },
    [posthog]
  );

  return { capture };
}

// ── Server-side capture (API routes / Server Actions) ────────────────────────

import { PostHog } from "posthog-node";

let _serverClient: PostHog | null = null;

function getServerClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (!_serverClient) {
    _serverClient = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,   // flush immediately in serverless
      flushInterval: 0,
    });
  }
  return _serverClient;
}

/**
 * captureServerEvent — fire a typed analytics event from a server context.
 * Safe to call from API routes, Server Actions, and middleware.
 * Failures are silently swallowed so they never affect the user.
 */
export async function captureServerEvent<E extends EventName>(
  userId: string,
  event: E,
  properties: AnalyticsEvents[E]
): Promise<void> {
  try {
    const client = getServerClient();
    if (!client) return;
    client.capture({ distinctId: userId, event, properties });
    await client.flush();
  } catch {
    // Never let analytics crash the app
  }
}
