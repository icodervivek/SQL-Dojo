import type { MetadataRoute } from "next";
import { lessons } from "@/lib/content/lessons";
import { problems } from "@/lib/content/problems";
import { SITE_URL } from "@/lib/seo";

/**
 * /sitemap.xml — every public page: home, the learning path, all lessons, the problem list and
 * all problems. Private pages (profile, sign-in/up) are left out; see robots.ts.
 * Generated at build time, so new problems and lessons are included automatically.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path}`;

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/learn"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/problems"), changeFrequency: "weekly", priority: 0.9 },
    ...lessons.map((l) => ({
      url: url(`/learn/${l.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...problems.map((p) => ({
      url: url(`/problems/${p.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
