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
  tagline: "Data software tools 24/7 real-time updates",
  subcopy:
    "Hey, I'm Blake. Aliasist is a project I started in spring 2026 to give users access to data that is not always readily available, reliable, or easy to reach 24/7.",
  ctaContact: "Projects",
  ctaContactHref: "#projects",
  ctaSecondary: "Contact",
  ctaSecondaryHref: "#contact",
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
  subcopy: "A focused view of the apps and utilities connected to Aliasist, from data dashboards to privacy tools and developer workflows.",
} as const;

export const projects = [
  {
    name: "Aliasist Tech · Waterfall",
    description:
      "A protected Waterfall workspace for guided chat, image tools, and private access.",
    tech: ["Waterfall", "Secure access", "Chat workspace", "Image tools", "Private sessions"],
    github: "https://github.com/aliasist/waterfall",
    downloads: [],
    status: "Live",
    meta: ["Workspace", "Chat + images", "Protected access"] as const,
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
      "A data center research platform for facilities, power, water, risk, and investment data.",
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
      "A GitHub toolkit that explains repositories and reviews pull requests in plain language.",
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
  pathBadge: "Focus · Software × data × security",
  skillsLabel: "Core capabilities",
  skills: [
    "Python",
    "JavaScript",
    "HTML / CSS",
    "Frontend systems",
    "Node.js",
    "UI design",
    "CLI tooling",
    "File automation",
  ] as const,
  /**
   * Each block: optional `kicker` (small label) + `body` (main text).
   * Project-first positioning for the Aliasist suite.
   */
  bioBlocks: [
    {
      kicker: "What it is",
      body: "Aliasist brings together practical web tools, data-driven applications, privacy utilities, and reliable workflows. If you would like to collaborate on a project or have something built with frontend and backend support, send an email and include the goal, scope, and timeline.",
    },
    {
      kicker: "Background",
      body: "I have been working with web design and software since 2004, starting with Dreamweaver, Photoshop layouts, sliced images, XHTML, CSS, and hand-coded effects.",
    },
  ] as const,

  /**
   */
  authorSlots: [] as unknown as readonly { kicker: string; body: string }[],

  stats: [
    { num: `${suiteAppCount}`,  label: "Projects connected", sym: "" as const },
    { num: "7",  label: "External APIs integrated", sym: "+" as const },
    { num: "100", label: "Open source · github.com/aliasist", sym: "%" as const },
  ],
} as const;

// ── Contact ─────────────────────────────────────────────────────────────────

export const contact = {
  dividerLabel: "Contact",
  introLabel: "Aliasist contact",
  headline: "Make contact.",
  introStrong: "Open to project work, collaborations, and frontend/backend builds.",
  introRest: "Send a clear note with what you want built, what it should connect to, and what success looks like.",
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
