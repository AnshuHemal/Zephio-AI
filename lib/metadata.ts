import type { Metadata } from "next";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const SITE_NAME = "Zephio";
export const SITE_TAGLINE = "AI that designs. You that decides.";
export const SITE_DESCRIPTION =
  "Describe your vision and watch Zephio transform your ideas into stunning, production-ready web designs in seconds. No code required.";

/**
 * Builds a full Metadata object for a given page.
 * All fields are optional — defaults fall back to site-level values.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  ogImage,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const pageTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — ${SITE_TAGLINE}`;

  const pageDescription = description ?? SITE_DESCRIPTION;
  const canonical = `${APP_URL}${path}`;
  const image = ogImage ?? `${APP_URL}/opengraph-image`;

  return {
    title: pageTitle,
    description: pageDescription,
    metadataBase: new URL(APP_URL),

    alternates: {
      canonical,
    },

    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [image],
      creator: "@zephioapp",
      site: "@zephioapp",
    },

    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}
