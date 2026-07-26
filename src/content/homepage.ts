/**
 * Homepage copy & navigation — edit this file to change marketing text and suite links.
 *
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
    label: "Aliasist Tech",
    sub: "Waterfall workspace",
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
    label: "Clearasist",
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
  mascotLabel: "aliasist",
  mascotAlt: "Aliasist",
  mascotTitle: "Aliasist",
  wordmark: "ALIASIST",
  tagline: "Tools, dashboards, and experiments for the web",
  subcopy:
    "Aliasist is a growing collection of projects I build to learn, solve problems, and make useful things available to anyone who wants them.",
  ctaContact: "Projects",
  ctaContactHref: "#projects",
  ctaSecondary: "Contact",
  ctaSecondaryHref: "#contact",
} as const;

// ── Navbar ───────────────────────────────────────────────────────────────────

export const pageNavLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Updates", href: "#transmissions" },
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
  headline: "Projects you can use now.",
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
    linkLabel: "Open Waterfall →",
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
    linkLabel: "Open Globalize →",
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
    linkLabel: "Open DataSist →",
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
    linkLabel: "Open PulseSist →",
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
    linkLabel: "Open SpaceSist →",
    banner: spaceBanner,
  },
  {
    name: "Clearasist",
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
    linkLabel: "Open Clearasist →",
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
    linkLabel: "Open GitHub Companion →",
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
    meta: ["PWA", "No accounts", "No storage"] as const,
    tone: "amber",
    icon: "AT",
    link: "/atomicity/",
    linkLabel: "Open Atomicity →",
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
    linkLabel: "Open EcoSist →",
    banner: ecosistBanner,
  },
] as const;

export const comingSoonProjects = [
  {
    codename: "Next project",
    description: "A new tool is in early planning. Details will appear when there is something useful to test.",
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
  pathBadge: "Working toward a CS degree · learning by building",
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
      body: "I'm working toward a computer science degree. Aliasist is where I build and test ideas that might be useful to other people. I hope some of these projects eventually solve real problems or help people in a meaningful way.",
    },
    {
      kicker: "What it is",
      body: "Aliasist is the name I use for this collection of projects. Some started because I needed a tool myself, while others started because I wanted to understand a subject or try an idea. If something becomes useful, I put it online so other people can use it too.",
    },
    {
      kicker: "Why it exists",
      body: "Aliasist started as a creative sandbox and school project, but it has grown into a place where I can experiment with AI, data, websites, apps, and whatever new technology catches my attention. The entire point is to learn by actually building things and seeing how different systems can connect and work together. Some of the projects are useful tools, some are experiments, and others are ideas that may eventually grow into something much bigger. I’m using Aliasist to better understand technology, discover patterns in data, and explore what we may be able to learn or predict from it. It’s an ongoing project, and I’m building it one piece at a time.",
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
    "Thanks for reaching out. I'll read your message and reply when I can.",
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

// ── Transmissions (blog) section headers ─────────────────────────────────────

export const transmissions = {
  dividerLabel: "Blog",
  headline: "Project notes.",
  scanning: "Loading posts...",
  offline: "Could not load the latest posts. Showing saved posts.",
  liveFeedPrefix: "Updated ",
  liveFeedRecent: "recently",
} as const;
