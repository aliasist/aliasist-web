/**
 * Homepage copy & navigation — edit this file to change marketing text and suite links.
 *
 * Images:
 *   • Project banners + assets live under `./images` (imported via `@images/...`).
 *   • Hero backdrop uses `public/background.png` (see `HeroSection`).
 *   • Optional Cloudflare **text-to-image** worker: `apps/phoenix-image-worker`
 *     calls `@cf/leonardo/phoenix-1.0` on Workers. It
 *     generates **new** images from prompts — not automatic “enhancement” of
 *     these PNGs. To use it for marketing art: deploy the worker, POST a prompt,
 *     save the JPEG/PNG, then commit under `images/` or `public/`.
 *
 * Project links:
 *   • Navbar: open "Projects" in the top bar — same URLs as `suiteApps` below.
 *   • Contact: scroll to Contact → right column "Projects".
 *   • Projects: each card has its own "Open …" button; URLs are in `projects`.
 *
 * Backend/API URLs (for developers): see `src/config/api.ts` (`siteEndpoints`).
 */

import dataBanner from "@images/datasist_banner_cinematic.png";
import ecosistBanner from "@images/ecosist_banner_tornado.png";
import filesAbductorBanner from "@images/files_abductor_banner_cinematic.png";
import pulseBanner from "@images/pulsesist_banner_cinematic.png";
import spaceBanner from "@images/spacesist_banner_cinematic.png";

// ── Suite apps (live products) ───────────────────────────────────────────────

/** Used by Navbar "Projects" menu and Contact section project list — keep in sync. */
export const suiteApps = [
  {
    label: "DataSist",
    sub: "Data Center WebApp",
    href: "https://datasist-frontend.pages.dev",
    icon: "DS",
  },
  {
    label: "Atomicity",
    sub: "Stopwatch",
    href: "/atomicity/",
    icon: "AT",
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
    label: "EcoSist",
    sub: "**UNDER CONSTRUCTION** project paused.",
    href: "/ecosist/",
    icon: "ES",
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
    label: "Literacy Tools",
    sub: "Writing helper",
    href: "https://github.com/aliasist/aliasist-literacy-assistant",
    icon: "LT",
  },
] as const;

export const suiteAppCount = suiteApps.length;

// ── Hero ─────────────────────────────────────────────────────────────────────

export const hero = {
  statusBadge: "Aliasist · Developer Portfolio",
  mascotLabel: "aliasist",
  mascotAlt: "Aliasist",
  mascotTitle: "Aliasist",
  eyeline: "developer portfolio · practical software · security-minded tools",
  wordmark: "ALIASIST",
  tagline: "Software built with care, clarity, and ownership.",
  subcopy:
    "I'm Blake, a self-taught developer building web apps, data tools, privacy utilities, and automation projects under the Aliasist name.",
  proofPoints: [
    { label: "Projects", value: `${suiteAppCount}` },
    { label: "External APIs", value: "7+" },
    { label: "Focus", value: "Security" },
  ] as const,
  ctaWork: "Consulting",
  ctaWorkHref: "Consulting",
  ctaContact: "Projects",
  ctaContactHref: "#projects",
  ctaSecondary: "Contact",
  ctaSecondaryHref: "#contact",
  statusRow: ["Portfolio", "Tools", "Research", "Automation"] as const,
} as const;

// ── Navbar ───────────────────────────────────────────────────────────────────

export const pageNavLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Tech News", href: "#transmissions" },
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
  linkedinHref: "https://www.linkedin.com/in/blake-hooper-b99899400",
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
  headline: "Built projects, not ideas.",
  subcopy: "A tighter view of the apps and utilities I have shipped, from data dashboards to privacy tools and developer workflows.",
} as const;

export const operatingSnapshot = {
  dividerLabel: "Current work",
  headline: "A working portfolio for shipped tools.",
  subcopy:
    "This site is the home base for my projects, notes, contact path, and the tools I use to manage the work behind them.",
  lanes: [
    {
      label: "Projects",
      value: `${suiteAppCount}`,
      eyebrow: "Live index",
      detail: "Public apps and utilities collected under one portfolio surface.",
      href: "#projects",
    },
    {
      label: "Admin",
      value: "Private",
      eyebrow: "Owner only",
      detail: "Admin dashboard access stays gated to the owner account.",
      href: "/agent",
    },
    {
      label: "Contact",
      value: "Direct",
      eyebrow: "Open channel",
      detail: "Project work, internship conversations, and collaboration requests.",
      href: "#contact",
    },
  ],
} as const;

export const projects = [
  {
    name: "GitHub Companion",
    description:
      "A GitHub toolkit that explains repositories and reviews pull requests in plain language.",
    tech: ["React", "GitHub API", "Project Guidance", "Review Heuristics"],
    github: "https://github.com/aliasist/aliasistabductor",
    downloads: [],
    status: "Live",
    meta: ["Project guide", "PR review", "Public tool"] as const,
    tone: "violet",
    icon: "GH",
    link: "/tools/github",
    linkLabel: "Open GitHub Companion →",
    banner: null,
  },
  {
    name: "SpaceSist",
    description:
      "A live space dashboard using NASA, SpaceX, ISS, asteroid, and exoplanet data.",
    tech: ["React", "Vite", "NASA APIs", "SpaceX API", "Leaflet", "Cloudflare"],
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
    name: "Atomicity",
    description:
      "Simple, fast stopwatch. No tasks, no accounts, no data saved. Just start/stop/reset, plus a lightweight intro.",
    tech: ["Vanilla JS", "PWA", "No storage"],
    github: "https://github.com/aliasist/atomicity",
    downloads: [],
    status: "Live",
    meta: ["PWA", "No accounts", "No storage"] as const,
    tone: "amber",
    icon: "AT",
    link: "/atomicity/",
    linkLabel: "Open Atomicity →",
    banner: null,
  },
  {
    name: "PulseSist",
    description:
      "A market dashboard with live charts, portfolio tools, and research views.",
    tech: ["React", "Vite", "Cloudflare Workers", "D1", "FMP API", "Dashboards"],
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
    name: "EcoSist",
    description:
      "An environmental dashboard for air quality, climate data, and geospatial views.",
    tech: [
      "React",
      "Vite",
      "Environmental APIs",
      "Geospatial Data",
      "Cloudflare",
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
  {
    name: "Clearasist",
    description:
      "A browser-based metadata cleaner for images, PDFs, and Office files.",
    tech: ["React", "Vite", "TypeScript", "pdf-lib", "JSZip", "Cloudflare Pages", "D1"],
    github: "https://github.com/aliasist/aliasistabductor",
    downloads: [],
    status: "Live",
    meta: ["Privacy tool", "Browser-based", "D1-backed"] as const,
    tone: "cyan",
    icon: "CL",
    link: "https://clearasist.pages.dev",
    linkLabel: "Open Clearasist →",
    banner: null,
  },
  {
    name: "Aliasist-Files-Abductor",
    description:
      "My first full app: a GUI tool for downloading files from YouTube and direct URLs.",
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
    name: "DataSist",
    description:
      "A data center research platform for facilities, power, water, risk, and investment data.",
    tech: ["React", "Vite", "D1", "Groq", "Leaflet", "EIA API"],
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
    name: "Literacy Tools",
    description:
      "A browser extension that helps with grammar, professional rephrasing, and summarization.",
    tech: ["React", "Vite", "Cloudflare Workers", "Gemini", "Groq", "Ollama"],
    github: "https://github.com/aliasist/aliasist-literacy-assistant",
    downloads: [],
    status: "Live",
    meta: ["Browser extension", "Writing tools", "Draft cleanup"] as const,
    tone: "violet",
    icon: "LT",
    link: "https://github.com/aliasist/aliasist-literacy-assistant",
    linkLabel: "View on GitHub →",
    banner: null,
  },
] as const;

export const comingSoonProjects = [
  {
    codename: "Next project",
    description: "A new tool is in early planning. Details will go here when the work is ready to show.",
    eta: "2027",
  },
] as const;

export type ProjectCard = (typeof projects)[number];

// ── About ─────────────────────────────────────────────────────────────────────
//
// Copy is split into short blocks (kicker + paragraph) so it’s easy to edit.
// Add your own sections in `authorSlots` (same shape); empty `body` = hidden.
// Typography: body uses Space Grotesk (--font-heading from index.css); mono
// labels use JetBrains Mono. No font change required — SG reads clean and modern
// for engineering portfolios; alternatives if you ever switch: IBM Plex Sans, DM Sans.
//
export const about = {
  dividerLabel: "About",
  headline: "Meet Aliasist.",
  pathBadge: "Path · Cybersecurity × tools",
  skillsLabel: "Skills I'm building",
  skills: [
    "Python",
    "JavaScript",
    "HTML / CSS",
    "React / Vite",
    "Node.js",
    "UI design",
    "CLI tooling",
    "File automation",
  ] as const,
  /**
   * Each block: optional `kicker` (small label) + `body` (main text).
   * Same story as before — early start with HTML, stack emphasis, studies, open source, CTA.
   */
  bioBlocks: [
    {
      kicker: "Where I started",
      body: "I coded my first website in 2004 for my Age of Empires clan, oXiDe, after experimenting with banners and forum signatures. Today, I build practical web tools and data-driven applications through Aliasist: a way to organize and make sense of the data around us.",
    },
  ] as const,

  /**
   */
  authorSlots: [] as unknown as readonly { kicker: string; body: string }[],

  stats: [
    { num: `${suiteAppCount}`,  label: "Projects connected", sym: "" as const },
    { num: "7",  label: "External APIs integrated", sym: "+" as const },
    { num: "3",  label: "Years building in public", sym: "" as const },
    { num: "100", label: "Open source · github.com/aliasist", sym: "%" as const },
  ],
} as const;

// ── Contact ─────────────────────────────────────────────────────────────────

export const contact = {
  dividerLabel: "Contact",
  introLabel: "Hi, I'm Blake.",
  headline: "Make contact.",
  introStrong: "Open to collaborations, internships, and project work.",
  introRest: "Creating tools for users.",
  successTitle: "Message received",
  successBody:
    "Message received. I prioritize clear requests, technical detail, and projects with a real path forward.",
  sendAnother: "Send another ↩",
  placeholders: {
    name: "Name",
    email: "Email",
    message: "Message — what are you working on?",
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
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/blake-hooper-b99899400",
      iconKey: "linkedin" as const,
    },
    { label: "dev@aliasist.com", href: "mailto:dev@aliasist.com", iconKey: "email" as const },
  ],
} as const;

// ── Transmissions (blog) section headers ─────────────────────────────────────

export const transmissions = {
  dividerLabel: "Blog",
  headline: "Tech is moving fast.",
  scanning: "Loading posts...",
  offline: "Could not load the latest posts. Showing saved posts.",
  liveFeedPrefix: "Updated ",
  liveFeedRecent: "recently",
} as const;
