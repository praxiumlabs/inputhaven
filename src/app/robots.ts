import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://inputhaven.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/auth/", "/api/webhooks/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog/", "/docs/", "/features", "/pricing", "/vs/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/blog/", "/docs/", "/features", "/pricing", "/vs/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/blog/", "/docs/", "/features", "/pricing", "/vs/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: ["/", "/blog/", "/docs/", "/features", "/pricing", "/vs/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blog/", "/docs/", "/features", "/pricing", "/vs/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
