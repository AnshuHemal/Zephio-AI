import { NextRequest, NextResponse } from "next/server";
import { getAuthServer } from "@/lib/insforge-server";

/**
 * GET /api/dashboard
 * Returns all projects for the current user with page count and first page thumbnail data.
 * Supports ?search=query&limit=N&offset=N
 */
export async function GET(req: NextRequest) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    let query = insforge.database
      .from("projects")
      .select("id, title, slugId, createdAt, updatedAt")
      .eq("userId", user.id)
      .order("updatedAt", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data: projects, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 400 });
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({ projects: [], total: 0 });
    }

    // Fetch first page (thumbnail data) for each project in parallel
    const projectIds = projects.map((p: any) => p.id);
    const { data: firstPages } = await insforge.database
      .from("pages")
      .select("id, projectId, name, rootStyles, htmlContent")
      .in("projectId", projectIds)
      .order("createdAt", { ascending: true });

    // Group first page per project
    const firstPageMap: Record<string, any> = {};
    for (const page of firstPages ?? []) {
      if (!firstPageMap[page.projectId]) {
        firstPageMap[page.projectId] = page;
      }
    }

    // Count pages per project
    const { data: pageCounts } = await insforge.database
      .from("pages")
      .select("projectId")
      .in("projectId", projectIds);

    const pageCountMap: Record<string, number> = {};
    for (const row of pageCounts ?? []) {
      pageCountMap[row.projectId] = (pageCountMap[row.projectId] ?? 0) + 1;
    }

    const enriched = projects.map((p: any) => ({
      ...p,
      pageCount: pageCountMap[p.id] ?? 0,
      thumbnail: firstPageMap[p.id] ?? null,
    }));

    return NextResponse.json({ projects: enriched });
  } catch (err) {
    console.error("[dashboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
