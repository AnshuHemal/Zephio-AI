import { NextRequest, NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";

type Params = { params: Promise<{ slugId: string; commentId: string }> };

/**
 * PATCH /api/comments/[slugId]/[commentId]
 * Auth required — project owner can toggle resolved state.
 * Body: { resolved: boolean }
 */
export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { slugId, commentId } = await params;
    const { user, insforge } = await getAuthServer();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership via slugId → project → userId
    const { data: project } = await insforge.database
      .from("projects")
      .select("id, userId")
      .eq("slugId", slugId)
      .single();

    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { resolved } = await req.json();

    const { data, error } = await insforge.database
      .from("page_comments")
      .update({ resolved: Boolean(resolved) })
      .eq("id", commentId)
      .eq("slugId", slugId)
      .select("id, resolved")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Failed to update comment" }, { status: 400 });
    }

    return NextResponse.json({ comment: data });
  } catch (err) {
    console.error("[comments PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/comments/[slugId]/[commentId]
 * Auth required — project owner can delete any comment.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: Params
) {
  try {
    const { slugId, commentId } = await params;
    const { user, insforge } = await getAuthServer();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: project } = await insforge.database
      .from("projects")
      .select("id, userId")
      .eq("slugId", slugId)
      .single();

    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await insforge.database
      .from("page_comments")
      .delete()
      .eq("id", commentId)
      .eq("slugId", slugId);

    if (error) {
      return NextResponse.json({ error: "Failed to delete comment" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[comments DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
