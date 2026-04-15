import { NextRequest, NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";

type Params = { params: Promise<{ slugId: string }> };

/**
 * GET /api/activity/[slugId]
 * Returns the activity log for a project, newest first.
 * Auth required — only the project owner can view the log.
 */
export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  try {
    const { slugId } = await params;
    const { user, insforge } = await getAuthServer();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: project } = await insforge.database
      .from("projects")
      .select("id")
      .eq("slugId", slugId)
      .eq("userId", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data, error } = await insforge.database
      .from("project_activity")
      .select("id, projectId, eventType, label, meta, createdAt")
      .eq("projectId", project.id)
      .order("createdAt", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch activity" }, { status: 400 });
    }

    return NextResponse.json({ events: data ?? [] });
  } catch (err) {
    console.error("[activity GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
