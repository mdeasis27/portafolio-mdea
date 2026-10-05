import type {Locale} from '@/design-system/i18n/locale';
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

export type ProjectStatus = "shipped" | "beta" | "archived";

export interface ProjectFrontmatter {
  title: string;
  slug: string;
  summary: string;
  role?: string;
  stack: string[];
  status: ProjectStatus;
  year: number;
  publishedAt: string;
  updatedAt?: string;
  featured?: boolean;
  repoUrl?: string;
  liveUrl?: string;
  caseStudyUrl?: string;
  tags?: string[];
  cover?: string;
  businessRole?: string;
  businessDecision?: string;
  businessValue?: string;
  visualMechanism?: string;
  scenarios?: {title:string;input:string;observation:string}[];
}

export interface Project {
  frontmatter: ProjectFrontmatter;
  content: string;
}

async function readContentDir(locale: Locale): Promise<string[]> {
  try {
    const entries = await fs.readdir(path.join(CONTENT_DIR, locale));
    return entries.filter((name) => name.endsWith(".mdx"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function assertFrontmatter(
  data: Record<string, unknown>,
  filename: string,
): asserts data is ProjectFrontmatter & Record<string, unknown> {
  const required: (keyof ProjectFrontmatter)[] = [
    "title",
    "slug",
    "summary",
    "stack",
    "status",
    "year",
    "publishedAt",
  ];
  for (const key of required) {
    if (data[key] === undefined || data[key] === null) {
      throw new Error(
        `Missing required frontmatter field "${String(key)}" in ${filename}`,
      );
    }
  }
  if (!Array.isArray(data.stack)) {
    throw new Error(`"stack" must be an array in ${filename}`);
  }
}

export async function getAllProjects(locale: Locale = "en"): Promise<Project[]> {
  const files = await readContentDir(locale);
  const projects = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(CONTENT_DIR, locale, filename);
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);
      assertFrontmatter(data, filename);
      return { frontmatter: data, content };
    }),
  );
  return projects.sort((a, b) => {
    return (
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime()
    );
  });
}

export async function getProjectBySlug(slug: string, locale: Locale = "en"): Promise<Project | null> {
  const all = await getAllProjects(locale);
  return all.find((p) => p.frontmatter.slug === slug) ?? null;
}

export async function getFeaturedProjects(locale: Locale = "en"): Promise<Project[]> {
  const all = await getAllProjects(locale);
  return all.filter((p) => p.frontmatter.featured);
}

export async function getProjectSlugs(locale: Locale = "en"): Promise<string[]> {
  const all = await getAllProjects(locale);
  return all.map((p) => p.frontmatter.slug);
}
