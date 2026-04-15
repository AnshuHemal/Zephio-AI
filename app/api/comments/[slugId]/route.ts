import { NextRequest, NextResponse } from "next/server";
import { createInsForgeServerClient, getAuthServer } from "@/lib/insforge-server";

type Params = { params: Promise<{ slugId: string }> };

/**
 * GET /api/comments/[slugId]
 * Public — returns all non-deleted comments for a preview, grouped by pageId.
 */
export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  try {
    const { slugId } = await params;
    const insforge = await createInsForgeServerClient();

    const { data: project } = await insforge.database
      .from("projects")
      .select("id")
      .eq("slugId", slugId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data, error } = await insforge.database
      .from("page_comments")
      .select("id, pageId, slugId, authorName, text, xPct, yPct, resolved, createdAt")
      .eq("slugId", slugId)
      .order("createdAt", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 400 });
    }

    return NextResponse.json({ comments: data ?? [] });
  } catch (err) {
    console.error("[comments GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/comments/[slugId]
 * Public — anyone with the preview link can leave a comment.
 * Body: { pageId, authorName, text, xPct, yPct }
 */
export async function POST(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { slugId } = await params;
    const { pageId, authorName, text, xPct, yPct } = await req.json();

    if (!pageId?.trim()) {
      return NextResponse.json({ error: "pageId is required" }, { status: 400 });
    }
    if (!text?.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }
    if (typeof xPct !== "number" || typeof yPct !== "number") {
      return NextResponse.json({ error: "Position (xPct, yPct) is required" }, { status: 400 });
    }

    const insforge = await createInsForgeServerClient();

    // Verify the project exists and the pageId belongs to it
    const { data: project } = await insforge.database
      .from("projects")
      .select("id")
      .eq("slugId", slugId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data, error } = await insforge.database
      .from("page_comments")
      .insert([{
        slugId,
        pageId,
        authorName: authorName?.trim() || "Anonymous",
        text: text.trim().slice(0, 1000),
        xPct: Math.min(100, Math.max(0, xPct)),
        yPct: Math.min(100, Math.max(0, yPct)),
        resolved: false,
      }])
      .select("id, pageId, slugId, authorName, text, xPct, yPct, resolved, createdAt")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Failed to save comment" }, { status: 400 });
    }

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (err) {
    console.error("[comments POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
