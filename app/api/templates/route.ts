import { NextRequest, NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";

/**
 * GET /api/templates
 * Returns all user-saved templates, newest first.
 */
export async function GET() {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await insforge.database
      .from("user_templates")
      .select("id, name, description, prompt, rootStyles, createdAt")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (error) return NextResponse.json({ error: "Failed to fetch templates" }, { status: 400 });

    return NextResponse.json({ templates: data ?? [] });
  } catch (err) {
    console.error("[templates GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/templates
 * Body: { name, description?, prompt, htmlContent, rootStyles }
 * Saves a page as a user template.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description, prompt, htmlContent, rootStyles } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!htmlContent?.trim()) return NextResponse.json({ error: "Page has no content to save" }, { status: 400 });

    // Cap at 20 templates per user
    const { count } = await insforge.database
      .from("user_templates")
      .select("id", { count: "exact", head: true })
      .eq("userId", user.id);

    if ((count ?? 0) >= 20) {
      return NextResponse.json(
        { error: "Template limit reached (20 max). Delete an existing template to save a new one." },
        { status: 400 }
      );
    }

    const { data, error } = await insforge.database
      .from("user_templates")
      .insert([{
        userId: user.id,
        name: name.trim(),
        description: description?.trim() ?? "",
        prompt: prompt?.trim() ?? "",
        htmlContent,
        rootStyles: rootStyles ?? "",
      }])
      .select("id, name, description, prompt, rootStyles, createdAt")
      .single();

    if (error || !data) return NextResponse.json({ error: "Failed to save template" }, { status: 400 });

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (err) {
    console.error("[templates POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
