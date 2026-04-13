import { NextRequest, NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";

/**
 * POST /api/feedback
 * Body: { pageId: string, rating: "up" | "down", comment?: string }
 * Stores page feedback in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pageId, rating, comment } = await req.json();

    if (!pageId || !["up", "down"].includes(rating)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Upsert — one rating per user per page
    const { error } = await insforge.database
      .from("page_feedback")
      .upsert(
        {
          pageId,
          userId: user.id,
          rating,
          comment: comment ?? null,
          createdAt: new Date().toISOString(),
        },
        { onConflict: "pageId,userId" }
      );

    if (error) {
      // Table may not exist yet — fail silently so it doesn't break the UI
      console.warn("[feedback] DB error (table may not exist):", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[feedback]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
