import { getAuthServer } from "@/lib/insforge-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const { user, insforge } = await getAuthServer();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: versions, error } = await insforge.database
      .from("page_versions")
      .select("id, pageId, htmlContent, rootStyles, versionNumber, label, createdAt")
      .eq("pageId", pageId)
      .order("versionNumber", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
    }

    return NextResponse.json({ versions: versions ?? [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
