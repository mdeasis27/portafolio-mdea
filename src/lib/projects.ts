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
}

export interface Project {
  frontmatter: ProjectFrontmatter;
  content: string;
}

async function readContentDir(): Promise<string[]> {
  try {
    const entries = await fs.readdir(CONTENT_DIR);
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

export async function getAllProjects(): Promise<Project[]> {
  const files = await readContentDir();
  const projects = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(CONTENT_DIR, filename);
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

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await getAllProjects();
  return all.find((p) => p.frontmatter.slug === slug) ?? null;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.frontmatter.featured);
}

export async function getProjectSlugs(): Promise<string[]> {
  const all = await getAllProjects();
  return all.map((p) => p.frontmatter.slug);
}
