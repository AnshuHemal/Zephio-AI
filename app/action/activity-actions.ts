"use server";

import { getAuthServer } from "@/lib/insforge-server";
import { ActivityEventType } from "@/types/activity";

/**
 * Logs a single activity event for a project.
 * Safe to call fire-and-forget — errors are swallowed so they never block the caller.
 *
 * @param projectId  - The UUID of the project (not slugId)
 * @param eventType  - One of the ActivityEventType values
 * @param label      - Human-readable description, e.g. "Hero Section regenerated"
 * @param meta       - Optional key/value metadata
 */
export async function logActivityAction(
  projectId: string,
  eventType: ActivityEventType,
  label: string,
  meta?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user || !projectId) return;

    await insforge.database.from("project_activity").insert([{
      projectId,
      eventType,
      label: label.slice(0, 200),
      meta: meta ?? null,
    }]);
  } catch {
    // Fire-and-forget — never throw
  }
}

/**
 * Resolves a slugId to a projectId, then logs the activity.
 * Use this when you only have the slugId available (e.g. client-side actions).
 */
export async function logActivityBySlugAction(
  slugId: string,
  eventType: ActivityEventType,
  label: string,
  meta?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user || !slugId) return;

    const { data: project } = await insforge.database
      .from("projects")
      .select("id")
      .eq("slugId", slugId)
      .eq("userId", user.id)
      .single();

    if (!project) return;

    await insforge.database.from("project_activity").insert([{
      projectId: project.id,
      eventType,
      label: label.slice(0, 200),
      meta: meta ?? null,
    }]);
  } catch {
    // Fire-and-forget — never throw
  }
}
