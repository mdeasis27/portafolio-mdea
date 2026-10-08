export const site = {
  name: "Manuel De Asís",
  shortName: "MDEA",
  title: "Manuel De Asís — AI Product",
  description:
    "Interactive applied AI prototypes for business decisions, product quality, evidence, and reliable workflows.",
  url: "https://portafolio-mdea.vercel.app",
  locale: "en_US",
  author: {
    name: "Manuel De Asís",
    role: "AI Product · Applied AI",
    linkedin: "https://www.linkedin.com/in/manuel-de-asis",
    github: "https://github.com/mdeasis27",
    email: "manueldeasis27@gmail.com",
    location: "Remote — LATAM",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
  ] as const,
  thesis: {
    headline: "From business problem to working AI product.",
    subhead:
      "Finance and operations leader who ships production software. I design, prototype, and deploy the systems I used to brief engineers to build.",
  },
} as const;

export type SiteConfig = typeof site;
