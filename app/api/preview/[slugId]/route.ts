import { NextRequest, NextResponse } from "next/server";
import { createInsForgeServerClient } from "@/lib/insforge-server";

/**
 * Public preview endpoint — no auth required.
 * Returns project metadata + pages for the share preview page.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slugId: string }> }
) {
  try {
    const { slugId } = await params;

    // Use anon client (no user token needed — public read)
    const insforge = await createInsForgeServerClient();

    const { data: project, error: projectError } = await insforge.database
      .from("projects")
      .select("id, title, slugId")
      .eq("slugId", slugId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { data: pages } = await insforge.database
      .from("pages")
      .select("id, name, rootStyles, htmlContent")
      .eq("projectId", project.id)
      .order("createdAt", { ascending: true });

    return NextResponse.json({
      title: project.title,
      slugId: project.slugId,
      pages: pages ?? [],
    });
  } catch (err) {
    console.error("[preview]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
