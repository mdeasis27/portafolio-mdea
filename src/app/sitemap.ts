import type { MetadataRoute } from "next";

import { getAllProjects } from "@/lib/projects";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const projects = await getAllProjects();
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${site.url}/projects/${project.frontmatter.slug}`,
    lastModified: new Date(
      project.frontmatter.updatedAt ?? project.frontmatter.publishedAt,
    ),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return ["en", "es"].flatMap(locale => [...staticRoutes, ...projectRoutes].map(entry => ({...entry, url: entry.url.replace(site.url, `${site.url}/${locale}`), alternates: {languages: {en: entry.url.replace(site.url, `${site.url}/en`),es: entry.url.replace(site.url, `${site.url}/es`)}}})));
}
