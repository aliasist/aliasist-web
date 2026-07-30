/**
 * Homepage copy & navigation — edit this file to change marketing text and suite links.
 *  -_- The homepage is built with React + TypeScript + TailwindCSS. 
 * Images:
 *   • Project banners + assets live under `./images` (imported via `@images/...`).
 *
 * Project links:
 *   • Navbar: open "Projects" in the top bar — same URLs as `suiteApps` below.
 *   • Contact: scroll to Contact → right column "Projects".
 *   • Projects: each card has its own "Open …" button; URLs are in `projects`.
 *
 * Backend/API URLs (for developers): see `src/config/api.ts` (`siteEndpoints`).
 */

import atomicityBanner from "@images/atomicity_banner_cinematic.png";
import aliasistTechBanner from "@images/aliasist_tech_waterfall_banner_cinematic.png";
import clearasistBanner from "@images/clearasist_banner_cinematic.png";
import dataBanner from "@images/datasist_banner_cinematic.png";
import ecosistBanner from "@images/ecosist_banner_tornado.png";
import filesAbductorBanner from "@images/files_abductor_banner_cinematic.png";
import githubCompanionBanner from "@images/github_companion_banner_cinematic.png";
import globalizeBanner from "@images/globalize_banner_cinematic.png";
import pulseBanner from "@images/pulsesist_banner_cinematic.png";
import spaceBanner from "@images/spacesist_banner_cinematic.png";

// ── Suite apps (live products) ───────────────────────────────────────────────

/** Used by Navbar "Projects" menu and Contact section project list — keep in sync. */
export const suiteApps = [
  {
    label: "Waterfall",
    sub: "Waterfall RAG system with AI chatbot and image generation",
    href: "https://www.aliasist.tech",
    icon: "AT",
  },
  {
    label: "Globalize",
    sub: "Global Infrastructure Map",
    href: "https://www.aliasist.world",
    icon: "GL",
  },
  {
    label: "DataSist",
    sub: "Data Center WebApp",
    href: "https://datasist-frontend.pages.dev",
    icon: "DS",
  },
  {
    label: "PulseSist",
    sub: "Stock Market Dashboard",
    href: "https://pulse.aliasist.com",
    icon: "PS",
  },
  {
    label: "SpaceSist",
    sub: "Live Space Portal",
    href: "https://space.aliasist.com",
    icon: "SS",
  },
  {
    label: "ClearSist",
    sub: "Metadata Cleaner",
    href: "https://clearasist.pages.dev",
    icon: "CL",
  },
  {
    label: "GitHub Companion",
    sub: "Guided GitHub project tools",
    href: "/tools/github",
    icon: "GH",
  },
  {
    label: "Atomicity",
    sub: "Stopwatch",
    href: "/atomicity/",
    icon: "AT",
  },
  {
    label: "EcoSist",
    sub: "**UNDER CONSTRUCTION** project paused.",
    href: "/ecosist/",
    icon: "ES",
  },
] as const;

export const suiteAppCount = suiteApps.length;

// ── Hero ─────────────────────────────────────────────────────────────────────

export const hero = {
  mascotLabel: "Aliasist",
  mascotAlt: "Aliasist",
  mascotTitle: "Aliasist",
  wordmark: "ALIASIST",
  tagline: "Tools, dashboards, and experiments for the web",
  subcopy:
    "Aliasist is a growing suite of free tools — data dashboards, live infrastructure maps, and more — built to be useful the moment you open them.",
  ctaContact: "Projects",
  ctaContactHref: "#projects",
  ctaSecondary: "Contact",
  ctaSecondaryHref: "#contact",
} as const;

// ── Navbar ───────────────────────────────────────────────────────────────────

export const pageNavLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Updates", href: "#updates" },
  { label: "NEWS", href: "#transmissions" },
] as const;


// ── Footer ────────────────────────────────────────────────────────────────────

export const footer = {
  brandName: "Aliasist",
  mascotAlt: "",
  versionLine: "The Aliasist Project",
  githubLabel: "GitHub",
  linkedinLabel: "LinkedIn",
  emailLabel: "Email",
  githubHref: "https://github.com/aliasist",
  linkedinHref: "",
  emailHref: "mailto:dev@aliasist.com",
} as const;

// ── Projects section ──────────────────────────────────────────────────────────

// Files Abductor binaries — tag on GitHub includes a leading "#" (see releases/tag/%23v2.7.0).
const releaseTag = "#v2.7.0";
const releaseTagEncoded = encodeURIComponent(releaseTag);
const releaseBaseUrl = `https://github.com/aliasist/aliasistabductor/releases/download/${releaseTagEncoded}`;

const downloadLinks = {
  appImage: `${releaseBaseUrl}/${encodeURIComponent("Aliasist.Files.Abductor-2.7.0.AppImage")}`,
  snap: `${releaseBaseUrl}/aliasist-files-abductor_2.7.0_amd64.snap`,
  windowsExe: `${releaseBaseUrl}/${encodeURIComponent("Aliasist.Files.Abductor.Setup.2.7.0.exe")}`,
};

export const projectsSection = {
  dividerLabel: "Projects",
  headline: "These are tools you can use.",
  subcopy: "These are the Aliasist apps and tools that are currently online.",
} as const;

export const projects = [
  {
    name: "Aliasist Waterfall",
    description:
      "An AI RAG system with an AI chatbot and image generation.",
    tech: ["AI RAG System", "AI Chatbot + Image Generation"],
    github: "https://github.com/aliasist/waterfall",
    downloads: [],
    status: "Live",
    meta: ["AI RAG System", "AI Chatbot + Image Generation"] as const,
    tone: "violet",
    icon: "AT",
    link: "https://www.aliasist.tech",
    linkLabel: "OPEN →",
    banner: aliasistTechBanner,
  },
  {
    name: "Globalize",
    description:
      "A 3D globe mapping global infrastructure — data centers, subsea cables, air traffic, and seismic activity.",
    tech: ["3D globe", "Infrastructure map", "Data signals", "Geospatial views"],
    github: "https://github.com/aliasist",
    downloads: [],
    status: "Live",
    meta: ["Data centers", "Global map", "Live infrastructure"] as const,
    tone: "cyan",
    icon: "GL",
    link: "https://www.aliasist.world",
    linkLabel: "OPEN →",
    banner: globalizeBanner,
  },
  {
    name: "DataSist",
    description:
      "A data center research dashboard for facilities, power, water, risk, and investment data.",
    tech: ["Facility research", "Power data", "Water data", "Risk maps", "Data tables"],
    github: "https://github.com/aliasist/datasist",
    downloads: [],
    status: "Live",
    meta: ["Data centers", "Power + water", "Risk research"] as const,
    tone: "blue",
    icon: "DS",
    link: "https://datasist-frontend.pages.dev",
    linkLabel: "OPEN →",
    banner: dataBanner,
  },
  {
    name: "PulseSist",
    description:
      "A market dashboard with live charts, portfolio tools, and research views.",
    tech: ["Market charts", "Portfolio views", "Research panels", "Live dashboards"],
    github: "https://github.com/aliasist/stockmarket",
    downloads: [],
    status: "Live",
    meta: ["Markets", "Portfolio tools", "Research views"] as const,
    tone: "amber",
    icon: "PS",
    link: "https://pulse.aliasist.com",
    linkLabel: "OPEN →",
    banner: pulseBanner,
  },
  {
    name: "SpaceSist",
    description:
      "A live space dashboard using NASA, SpaceX, ISS, asteroid, and exoplanet data.",
    tech: ["Launch data", "ISS tracking", "Asteroids", "Exoplanets", "Live space feeds"],
    github: "https://github.com/aliasist",
    downloads: [],
    status: "Live",
    meta: ["NASA", "SpaceX", "Live orbital data"] as const,
    tone: "violet",
    icon: "SS",
    link: "https://space.aliasist.com",
    linkLabel: "OPEN →",
    banner: spaceBanner,
  },
  {
    name: "ClearSist",
    description:
      "A browser-based metadata cleaner for images, PDFs, and Office files.",
    tech: ["Metadata removal", "Image cleanup", "PDF cleanup", "Office files", "Browser-based"],
    github: "https://github.com/aliasist/aliasistabductor",
    downloads: [],
    status: "Live",
    meta: ["Privacy tool", "Browser-based", "File cleanup"] as const,
    tone: "cyan",
    icon: "CL",
    link: "https://clearasist.pages.dev",
    linkLabel: "OPEN →",
    banner: clearasistBanner,
  },
  {
    name: "GitHub Companion",
    description:
      "A GitHub tool for repository summaries and pull request review notes.",
    tech: ["Repository maps", "Pull request review", "Project guidance", "Review notes"],
    github: "https://github.com/aliasist/aliasistabductor",
    downloads: [],
    status: "Live",
    meta: ["Project guide", "PR review", "Public tool"] as const,
    tone: "violet",
    icon: "GH",
    link: "/tools/github",
    linkLabel: "OPEN →",
    banner: githubCompanionBanner,
  },
  {
    name: "Aliasist-Files-Abductor",
    description:
      "A desktop GUI tool for downloading files from YouTube and direct URLs.",
    tech: ["Python", "GUI", "CLI", "File Automation", "yt-dlp"],
    github: `https://github.com/aliasist/aliasistabductor/releases/tag/${releaseTagEncoded}`,
    downloads: [
      { label: "AppImage", href: downloadLinks.appImage },
      { label: "Snap", href: downloadLinks.snap },
      { label: "Windows", href: downloadLinks.windowsExe },
    ],
    status: "Live",
    meta: ["Desktop builds", "yt-dlp", "Release assets"] as const,
    tone: "teal",
    icon: "FA",
    link: null as string | null,
    linkLabel: null as string | null,
    banner: filesAbductorBanner,
  },
  {
    name: "Atomicity",
    description:
      "Simple, fast stopwatch. No tasks, no accounts, no data saved. Just start/stop/reset, plus a lightweight intro.",
    tech: ["Vanilla JS", "PWA", "No storage"],
    github: "https://github.com/aliasist/aliasistabductor",
    downloads: [],
    status: "Live",
    meta: ["Simple Stopwatch"] as const,
    tone: "amber",
    icon: "AT",
    link: "/atomicity/",
    linkLabel: "OPEN →",
    banner: atomicityBanner,
  },
  {
    name: "EcoSist",
    description:
      "An environmental dashboard for air quality, climate data, and geospatial views.",
    tech: [
      "Environmental APIs",
      "Geospatial Data",
      "Live Monitoring",
    ],
    github: "https://github.com/aliasist/ecosist",
    downloads: [],
    status: "Live",
    meta: ["Climate data", "Air quality", "Geospatial"] as const,
    tone: "green",
    icon: "ES",
    link: "/ecosist/",
    linkLabel: "OPEN →",
    banner: ecosistBanner,
  },
] as const;

export const COMING_SOON_PROJECTS = [
  {
    codename: "Next project",
    description: "Planning and dvelopment in progress.",
    eta: "2027",
  },
] as const;

export type ProjectCard = (typeof projects)[number];

// ── About ─────────────────────────────────────────────────────────────────────
//
// Copy is split into short blocks (kicker + paragraph) so it’s easy to edit.
// Add your own sections in `authorSlots` (same shape); empty `body` = hidden.
// Typography: body uses Inter (--font-body from index.css); headings use
// Space Grotesk and labels use JetBrains Mono.
//
export const about = {
  dividerLabel: "About",
  headline: "Meet Aliasist.",
  pathBadge: "Working toward a CS degree · building for good",
  skillsLabel: "What I work with",
  skills: [
    "Python",
    "JavaScript",
    "HTML / CSS",
    "Frontend systems",
    "Node.js",
    "Security-minded design",
    "CLI tooling",
    "File automation",
  ] as const,
  /**
   * Each block: optional `kicker` (small label) + `body` (main text).
   * Project-first positioning for the Aliasist suite.
   */
  bioBlocks: [
    {
      kicker: "Who's behind it",
      body: "I'm working toward a degree in computer science because I want to understand how useful technology is built. My hope is to apply that knowledge to projects that help people, improve lives, and make a meaningful difference for good.",
    },
    {
      kicker: "What it is",
      body: "Aliasist is where that intention becomes practice. Each app explores a real need, a new idea, or a better way to make complex technology useful and approachable. The collection will keep growing as those ideas become tools people can actually use.",
    },
    {
      kicker: "Why it exists",
      body: "It exists to learn by building and to give promising ideas room to become something valuable. The larger goal is simple: create technology with care, share it with people, and keep working toward projects that can make a positive difference at a meaningful scale.",
    },
  ] as const,

  /**
   */
  authorSlots: [] as unknown as readonly { kicker: string; body: string }[],

  stats: [
    { num: `${suiteAppCount}`,  label: "Projects online", sym: "" as const },
    { num: "7",  label: "External APIs integrated", sym: "+" as const },
    { num: "100", label: "Open source · github.com/aliasist", sym: "%" as const },
  ],
} as const;

// ── Contact ─────────────────────────────────────────────────────────────────

export const contact = {
  dividerLabel: "Contact",
  introLabel: "Contact",
  headline: "Want to talk?",
  introStrong: "Questions, ideas, and project feedback are welcome.",
  introRest: "Tell me what you're working on or what you need help with.",
  successTitle: "Message received",
  successBody:
    "Thanks for reaching out and hope to get back to you soon.",
  sendAnother: "Send another ↩",
  placeholders: {
    name: "Name",
    email: "Email",
    message: "What would you like to talk about?",
  },
  submitIdle: "Send message ↗",
  submitSending: "Sending...",
  errorPrefix: "Error:",
  errorFallback: "message failed — try dev@aliasist.com",
  suiteColumnLabel: "Projects",
  liveBadge: "Live",
  suiteStats: [
    { n: `${suiteAppCount}`, l: "Projects" },
    { n: "7+", l: "APIs" },
    { n: "340+", l: "Data Centers" },
  ],
  directLinks: [
    { label: "GitHub", href: "https://github.com/aliasist", iconKey: "github" as const },
    { label: "dev@aliasist.com", href: "mailto:dev@aliasist.com", iconKey: "email" as const },
  ],
} as const;

// ── Updates & events ───────────────────────────────────────────────────────

export const updatesSection = {
  dividerLabel: "Log",
  headline: "Updates & events",
  subcopy: "Project news, releases, and upcoming events — posted by hand.",
} as const;

export const updates = [
  {
    id: "u2",
    kind: "update" as const,
    date: "2026-07-30",
    title: "RAG Curation Dashboard is live",
    body: "Upload documents, route them into one of six knowledge corpora, and every Aliasist chatbot can cite them moments later — full lifecycle verified end-to-end. Read the progress report.",
    href: "/reports/rag-dashboard-2026-07.html",
  },
  {
    id: "u1",
    kind: "update" as const, // "update" | "event"
    date: "2026-07-30",
    title: "Homepage gets an updates & events log",
    body: "Project news and upcoming events now live here, separate from the news feed below.",
    href: "#",
  },
  // Add new entries above this line, newest first.
] as const;

export type UpdateEntry = (typeof updates)[number];

// ── Transmissions (blog) section headers ─────────────────────────────────────

export const transmissions = {
  dividerLabel: "Blog",
  headline: "Industry Inquiries",
  scanning: "Updates are live.",
  offline: "Could not load the latest posts. Showing saved posts.",
  liveFeedPrefix: "Updated ",
  liveFeedRecent: "recently",
} as const;
