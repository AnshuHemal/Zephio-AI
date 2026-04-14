import { NextRequest, NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";

/**
 * GET /api/folders
 * Returns all folders for the current user, ordered by creation date.
 */
export async function GET() {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await insforge.database
      .from("folders")
      .select("id, name, color, createdAt")
      .eq("userId", user.id)
      .order("createdAt", { ascending: true });

    if (error) return NextResponse.json({ error: "Failed to fetch folders" }, { status: 400 });

    return NextResponse.json({ folders: data ?? [] });
  } catch (err) {
    console.error("[folders GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/folders
 * Body: { name: string; color?: string }
 * Creates a new folder.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, color = "gray" } = await req.json();
    const trimmed = name?.trim();
    if (!trimmed) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const { data, error } = await insforge.database
      .from("folders")
      .insert([{ userId: user.id, name: trimmed, color }])
      .select("id, name, color, createdAt")
      .single();

    if (error || !data) return NextResponse.json({ error: "Failed to create folder" }, { status: 400 });

    return NextResponse.json({ folder: data }, { status: 201 });
  } catch (err) {
    console.error("[folders POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
