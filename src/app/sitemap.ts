import type { MetadataRoute } from "next";

const SITE_URL = "https://growithm.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/webhook-guide`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
