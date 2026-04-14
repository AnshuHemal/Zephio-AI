"use server"

import { getAuthServer } from "@/lib/insforge-server"
import { UIMessage } from "ai"

export const generateProjectTitle = async (message: string) => {
  try {
    const { insforge } = await getAuthServer()
    const result = await insforge.ai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: `
    You are an AI assistant that generates very short project names based on the user's prompt.
    - Keep it under 5 words.
    - Capitalize words appropriately.
    - Do not include special characters.
    - Return ONLY the name, nothing else.`,
        },
        {
          role: "user",
          content: message
        }
      ]
    })
    const text = result.choices[0].message.content;
    return text.trim() || "Untitled Project"
  } catch (error) {
    console.log(error, "Project title error")
    return "Untitled Project"
  }
}


export const convertModelMessages = async (messages: UIMessage[]) => {
  const modelMessages = messages.map((message: UIMessage) => {
    const contentParts: any[] = [];

    for (const part of message.parts) {
      if (part.type === "text" && typeof part.text === "string"
        && part.text.trim()
      ) {
        contentParts.push({
          type: "text",
          part: part.text
        })
      } else if (part.type === "file") {
        if (part.mediaType?.startsWith('image/') && part.url) {
          contentParts.push({
            type: "image",
            image: part.url
          })
        }
      }
    }

    const content = contentParts.length === 1 && contentParts?.[0].type === "text" ? contentParts[0].text : contentParts;

    return {
      role: message.role,
      content
    }
  })

  return modelMessages
}

export const deletePageAction = async (slugId: string, pageId: string) => {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    const { data: project } = await insforge.database.from("projects")
      .select("id")
      .eq("slugId", slugId)
      .single();
    if (!project) return { error: "Project not found" }

    await insforge.database.from("pages")
      .delete()
      .eq("projectId", project.id)
      .eq("id", pageId)

    return { success: true }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Internal server error" }
  }
}

export const renamePageAction = async (pageId: string, name: string) => {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    const trimmed = name.trim();
    if (!trimmed) return { error: "Name cannot be empty" };
    if (trimmed.length > 60) return { error: "Name too long (max 60 characters)" };

    const { error } = await insforge.database
      .from("pages")
      .update({ name: trimmed, updatedAt: new Date().toISOString() })
      .eq("id", pageId);

    if (error) return { error: "Failed to rename page" };
    return { success: true, name: trimmed };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Internal server error" };
  }
}

/**
 * Duplicates a page within the same project.
 * The copy is inserted immediately after the original in creation order.
 * Returns the full new page so the canvas can add it optimistically.
 */
export const duplicatePageAction = async (pageId: string) => {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    // Fetch the source page
    const { data: source, error: fetchError } = await insforge.database
      .from("pages")
      .select("id, name, rootStyles, htmlContent, projectId")
      .eq("id", pageId)
      .single();

    if (fetchError || !source) return { error: "Page not found" };

    // Verify the user owns the project
    const { data: project } = await insforge.database
      .from("projects")
      .select("id")
      .eq("id", source.projectId)
      .eq("userId", user.id)
      .single();

    if (!project) return { error: "Unauthorized" };

    // Insert the duplicate with a " (copy)" suffix on the name
    const { data: newPage, error: insertError } = await insforge.database
      .from("pages")
      .insert([{
        projectId: source.projectId,
        name: `${source.name} (copy)`,
        rootStyles: source.rootStyles,
        htmlContent: source.htmlContent,
      }])
      .select("id, name, rootStyles, htmlContent, projectId, createdAt")
      .single();

    if (insertError || !newPage) return { error: "Failed to duplicate page" };

    return {
      success: true,
      page: {
        id: newPage.id,
        name: newPage.name,
        rootStyles: newPage.rootStyles,
        htmlContent: newPage.htmlContent,
        projectId: newPage.projectId,
        createdAt: newPage.createdAt,
        isLoading: false,
      } satisfies PageType,
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Internal server error" };
  }
}

/**
 * Adds a blank page to a project.
 * The page has no HTML content — it's a clean slate for the user to describe.
 */
export const addBlankPageAction = async (slugId: string, name: string) => {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    const { data: project } = await insforge.database
      .from("projects")
      .select("id")
      .eq("slugId", slugId)
      .eq("userId", user.id)
      .single();

    if (!project) return { error: "Project not found" };

    const trimmed = name.trim() || "New Page";

    const { data: newPage, error: insertError } = await insforge.database
      .from("pages")
      .insert([{
        projectId: project.id,
        name: trimmed,
        rootStyles: "",
        htmlContent: "",
      }])
      .select("id, name, rootStyles, htmlContent, projectId, createdAt")
      .single();

    if (insertError || !newPage) return { error: "Failed to add page" };

    return {
      success: true,
      page: {
        id: newPage.id,
        name: newPage.name,
        rootStyles: newPage.rootStyles,
        htmlContent: newPage.htmlContent,
        projectId: newPage.projectId,
        createdAt: newPage.createdAt,
        isLoading: false,
      } satisfies PageType,
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Internal server error" };
  }
}

export const renameProjectBySlugAction = async (slugId: string, title: string) => {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    const trimmed = title.trim();
    if (!trimmed) return { error: "Title cannot be empty" };
    if (trimmed.length > 80) return { error: "Title too long (max 80 characters)" };

    const { error } = await insforge.database
      .from("projects")
      .update({ title: trimmed, updatedAt: new Date().toISOString() })
      .eq("slugId", slugId)
      .eq("userId", user.id);

    if (error) return { error: "Failed to rename project" };
    return { success: true, title: trimmed };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Internal server error" };
  }
}

// ── Page Version History ──────────────────────────────────────────────────────

const MAX_VERSIONS_PER_PAGE = 3;

/**
 * Saves the current state of a page as a new version before it gets overwritten.
 * Automatically prunes old versions so only the last MAX_VERSIONS_PER_PAGE are kept.
 * Safe to call fire-and-forget — errors are swallowed so they never block generation.
 */
export async function savePageVersionAction(pageId: string): Promise<{ error?: string; versionId?: string }> {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    // Fetch the current page state
    const { data: page, error: fetchError } = await insforge.database
      .from("pages")
      .select("id, name, htmlContent, rootStyles")
      .eq("id", pageId)
      .single();

    if (fetchError || !page) return { error: "Page not found" };
    if (!page.htmlContent) return {}; // nothing to snapshot

    // Get existing versions to determine next version number
    const { data: existing } = await insforge.database
      .from("page_versions")
      .select("id, versionNumber, createdAt")
      .eq("pageId", pageId)
      .order("versionNumber", { ascending: false });

    const nextVersionNumber = ((existing?.[0]?.versionNumber ?? 0) as number) + 1;

    // Insert the new version
    const { data: newVersion, error: insertError } = await insforge.database
      .from("page_versions")
      .insert([{
        pageId,
        htmlContent: page.htmlContent,
        rootStyles: page.rootStyles,
        versionNumber: nextVersionNumber,
        label: page.name,
      }])
      .select("id")
      .single();

    if (insertError) return { error: "Failed to save version" };

    // Prune: keep only the last MAX_VERSIONS_PER_PAGE versions
    if (existing && existing.length >= MAX_VERSIONS_PER_PAGE) {
      const toDelete = existing
        .slice(MAX_VERSIONS_PER_PAGE - 1) // keep newest (MAX-1), delete the rest
        .map((v: any) => v.id);

      if (toDelete.length > 0) {
        await insforge.database
          .from("page_versions")
          .delete()
          .in("id", toDelete);
      }
    }

    return { versionId: newVersion?.id };
  } catch {
    return { error: "Internal server error" };
  }
}

/**
 * Restores a page to a specific version.
 * Saves the current state as a new version first so the restore is itself undoable.
 */
export async function restorePageVersionAction(
  pageId: string,
  versionId: string
): Promise<{ error?: string; page?: { id: string; htmlContent: string; rootStyles: string; name: string } }> {
  try {
    const { user, insforge } = await getAuthServer();
    if (!user) return { error: "Unauthorized" };

    // Fetch the target version
    const { data: version, error: versionError } = await insforge.database
      .from("page_versions")
      .select("id, htmlContent, rootStyles, label")
      .eq("id", versionId)
      .single();

    if (versionError || !version) return { error: "Version not found" };

    // Save current state as a new version before overwriting
    await savePageVersionAction(pageId);

    // Restore the page to the selected version
    const { data: updatedPage, error: updateError } = await insforge.database
      .from("pages")
      .update({
        htmlContent: version.htmlContent,
        rootStyles: version.rootStyles,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", pageId)
      .select("id, name, htmlContent, rootStyles")
      .single();

    if (updateError || !updatedPage) return { error: "Failed to restore version" };

    return { page: updatedPage };
  } catch {
    return { error: "Internal server error" };
  }
}
