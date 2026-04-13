export const site = {
  name: "Manuel De Asís",
  shortName: "MDEA",
  title: "Manuel De Asís — Executive who builds",
  description:
    "Senior finance and operations executive who ships production software. Case studies, projects, and notes on AI-first operating systems for fintech and SaaS.",
  url: "https://manueldeasis.com",
  locale: "en_US",
  author: {
    name: "Manuel De Asís",
    role: "Finance & Ops Executive · Builder",
    linkedin: "https://www.linkedin.com/in/manuel-de-asis",
    email: "manueldeasis27@gmail.com",
    location: "Remote — LATAM",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
  ] as const,
  thesis: {
    headline: "Executive who builds.",
    subhead:
      "Finance and operations leader who ships production software. I design, prototype, and deploy the systems I used to brief engineers to build.",
  },
} as const;

export type SiteConfig = typeof site;
