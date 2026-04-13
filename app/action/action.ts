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