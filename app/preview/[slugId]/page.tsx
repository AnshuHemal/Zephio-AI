import { Metadata } from "next";
import PreviewClient from "./preview-client";
import { buildMetadata, APP_URL } from "@/lib/metadata";

type Props = { params: Promise<{ slugId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugId } = await params;
  try {
    const res = await fetch(`${APP_URL}/api/preview/${slugId}`, { cache: "no-store" });
    if (!res.ok) return buildMetadata({ title: "Preview", path: `/preview/${slugId}` });

    const data = await res.json();
    const title = data.title || "Untitled Project";
    const ogImage = `${APP_URL}/preview/${slugId}/opengraph-image`;

    return buildMetadata({
      title: `${title} — Preview`,
      description: `"${title}" — a web design built with Zephio. AI that designs. You that decides.`,
      path: `/preview/${slugId}`,
      ogImage,
    });
  } catch {
    return buildMetadata({ title: "Preview", path: `/preview/${slugId}` });
  }
}

export default async function PreviewPage({ params }: Props) {
  const { slugId } = await params;
  return <PreviewClient slugId={slugId} />;
}
