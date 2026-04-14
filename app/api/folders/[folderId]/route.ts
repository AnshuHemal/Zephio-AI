import { NextRequest, NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";

type Params = { params: Promise<{ folderId: string }> };

/**
 * PATCH /api/folders/[folderId]
 * Body: { name?: string; color?: string }
 * Renames or recolors a folder.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { folderId } = await params;
    const body = await req.json();
    const updates: Record<string, string> = {};

    if (body.name !== undefined) {
      const trimmed = body.name.trim();
      if (!trimmed) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      updates.name = trimmed;
    }
    if (body.color !== undefined) updates.color = body.color;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data, error } = await insforge.database
      .from("folders")
      .update(updates)
      .eq("id", folderId)
      .eq("userId", user.id)
      .select("id, name, color, createdAt")
      .single();

    if (error || !data) return NextResponse.json({ error: "Failed to update folder" }, { status: 400 });

    return NextResponse.json({ folder: data });
  } catch (err) {
    console.error("[folders PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/folders/[folderId]
 * Deletes the folder and sets folderId = NULL on all its projects.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { folderId } = await params;

    // Unassign all projects in this folder first
    await insforge.database
      .from("projects")
      .update({ folderId: null })
      .eq("folderId", folderId)
      .eq("userId", user.id);

    const { error } = await insforge.database
      .from("folders")
      .delete()
      .eq("id", folderId)
      .eq("userId", user.id);

    if (error) return NextResponse.json({ error: "Failed to delete folder" }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[folders DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
