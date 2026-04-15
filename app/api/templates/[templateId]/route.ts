import { NextRequest, NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";

type Params = { params: Promise<{ templateId: string }> };

/**
 * DELETE /api/templates/[templateId]
 * Deletes a user template.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { templateId } = await params;

    const { error } = await insforge.database
      .from("user_templates")
      .delete()
      .eq("id", templateId)
      .eq("userId", user.id);

    if (error) return NextResponse.json({ error: "Failed to delete template" }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[templates DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
