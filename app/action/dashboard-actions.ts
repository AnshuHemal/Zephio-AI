"use server";

import { getAuthServer } from "@/lib/insforge-server";
import { generateSlugId } from "@/lib/utils";

export async function renameProjectAction(projectId: string, title: string) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    const trimmed = title.trim();
    if (!trimmed) return { error: "Title cannot be empty" };

    const { error } = await insforge.database
      .from("projects")
      .update({ title: trimmed, updatedAt: new Date().toISOString() })
      .eq("id", projectId)
      .eq("userId", user.id);

    if (error) return { error: "Failed to rename project" };
    return { success: true, title: trimmed };
  } catch {
    return { error: "Internal server error" };
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    // Delete pages first (cascade)
    await insforge.database
      .from("pages")
      .delete()
      .eq("projectId", projectId);

    // Delete messages
    await insforge.database
      .from("messages")
      .delete()
      .eq("projectId", projectId);

    // Delete project
    const { error } = await insforge.database
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("userId", user.id);

    if (error) return { error: "Failed to delete project" };
    return { success: true };
  } catch {
    return { error: "Internal server error" };
  }
}

export async function duplicateProjectAction(projectId: string) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    // Fetch original project
    const { data: original } = await insforge.database
      .from("projects")
      .select("id, title, slugId")
      .eq("id", projectId)
      .eq("userId", user.id)
      .single();

    if (!original) return { error: "Project not found" };

    // Fetch original pages
    const { data: pages } = await insforge.database
      .from("pages")
      .select("name, rootStyles, htmlContent")
      .eq("projectId", projectId)
      .order("createdAt", { ascending: true });

    // Create new project
    const newSlugId = generateSlugId();
    const { data: newProject, error: projectError } = await insforge.database
      .from("projects")
      .insert([{
        slugId: newSlugId,
        title: `${original.title} (copy)`,
        userId: user.id,
      }])
      .select()
      .single();

    if (projectError || !newProject) return { error: "Failed to duplicate project" };

    // Copy pages
    if (pages && pages.length > 0) {
      await insforge.database.from("pages").insert(
        pages.map((p: any) => ({
          projectId: newProject.id,
          name: p.name,
          rootStyles: p.rootStyles,
          htmlContent: p.htmlContent,
        }))
      );
    }

    return { success: true, slugId: newSlugId, projectId: newProject.id };
  } catch {
    return { error: "Internal server error" };
  }
}

// ── Folder actions ────────────────────────────────────────────────────────────

export async function createFolderAction(name: string, color: string) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    const trimmed = name.trim();
    if (!trimmed) return { error: "Name is required" };

    const { data, error } = await insforge.database
      .from("folders")
      .insert([{ userId: user.id, name: trimmed, color }])
      .select("id, name, color, createdAt")
      .single();

    if (error || !data) return { error: "Failed to create folder" };
    return { success: true, folder: data };
  } catch {
    return { error: "Internal server error" };
  }
}

export async function renameFolderAction(folderId: string, name: string) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    const trimmed = name.trim();
    if (!trimmed) return { error: "Name cannot be empty" };

    const { data, error } = await insforge.database
      .from("folders")
      .update({ name: trimmed })
      .eq("id", folderId)
      .eq("userId", user.id)
      .select("id, name, color, createdAt")
      .single();

    if (error || !data) return { error: "Failed to rename folder" };
    return { success: true, folder: data };
  } catch {
    return { error: "Internal server error" };
  }
}

export async function recolorFolderAction(folderId: string, color: string) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    const { data, error } = await insforge.database
      .from("folders")
      .update({ color })
      .eq("id", folderId)
      .eq("userId", user.id)
      .select("id, name, color, createdAt")
      .single();

    if (error || !data) return { error: "Failed to update folder color" };
    return { success: true, folder: data };
  } catch {
    return { error: "Internal server error" };
  }
}

export async function deleteFolderAction(folderId: string) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    // Unassign projects first
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

    if (error) return { error: "Failed to delete folder" };
    return { success: true };
  } catch {
    return { error: "Internal server error" };
  }
}

export async function moveProjectToFolderAction(
  projectId: string,
  folderId: string | null
) {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    const { error } = await insforge.database
      .from("projects")
      .update({ folderId })
      .eq("id", projectId)
      .eq("userId", user.id);

    if (error) return { error: "Failed to move project" };
    return { success: true };
  } catch {
    return { error: "Internal server error" };
  }
}
