import { MetadataRoute } from "next";
import { APP_URL } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth/sign-in", "/auth/sign-up", "/preview/"],
        disallow: [
          "/dashboard",
          "/app",
          "/new",
          "/project/",
          "/api/",
        ],
      },
      // Block AI training crawlers
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
          "Google-Extended",
          "Omgilibot",
          "FacebookBot",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
