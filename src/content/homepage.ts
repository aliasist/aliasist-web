/**
 * *ALIASIST PROJECT (4/22/2026)
 *
 *
 * Images:
 *   • Project banners + assets live under `./images` (imported via `@images/...`).
 *
 * Project links:
 *   • Navbar: open "Projects" in the top bar, same URLs as `suiteApps` below.
 *     Entries with `isDemo: true` are archived/retired apps; the Navbar
 *     menu hides them, Contact opens them in a demo modal instead of navigating.
 *   • Contact: scroll to Contact → right column "Projects".
 *   • Projects: each card has its own "Open …" button; URLs are in `projects`.
 *
 * Backend/API URLs (for developers): see `src/config/api.ts` (`siteEndpoints`).
 */

import aliasistTechBanner from "@images/aliasist_tech_waterfall_banner_cinematic.webp";
import clearasistBanner from "@images/clearasist_banner_cinematic.webp";
import filesAbductorBanner from "@images/files_abductor_banner_cinematic.webp";
import globalizeBanner from "@images/globalize_banner_cinematic.webp";
import spaceBanner from "@images/spacesist_banner_cinematic.webp";
import pdfsistBanner from "@images/pdfsist_banner_cinematic.svg";

// ── Suite apps (live products) ───────────────────────────────────────────────

/** Used by Navbar "Projects" menu and Contact section project list, keep in sync. */
export const suiteApps = [
  {
    label: "Aliasist AI",
    sub: "Chat, images, and cited answers",
    href: "https://www.aliasist.tech",
    icon: "AT",
  },
  {
    label: "Globalize",
    sub: "Interactive global infrastructure map",
    href: "https://www.aliasist.world",
    icon: "GL",
  },
  {
    label: "SpaceSist",
    sub: "Live space dashboard",
    href: "https://space.aliasist.com",
    icon: "SS",
  },
  {
    label: "ClearSist",
    sub: "Private file metadata cleaner",
    href: "https://clearasist.pages.dev",
    icon: "CL",
  },
  {
    label: "PDFSist",
    sub: "Sign and annotate PDFs in your browser",
    href: "https://pdf.aliasist.com",
    icon: "PDF",
  },
] as const;

export const suiteAppCount = suiteApps.length;

// ── Hero ─────────────────────────────────────────────────────────────────────

export const hero = {
  mascotLabel: "Aliasist",
  mascotAlt: "Aliasist",
  mascotTitle: "Aliasist",
  wordmark: "ALIASIST",
  tagline: "Tools, dashboards, and experiments for the web - Aliasist Arsenal",
  subcopy:
    "A growing set of free tools I'm building for research, data, privacy, and the web. Simple to use, built to actually work. Pick one and jump in.",
  ctaContact: "Projects",
  ctaContactHref: "#projects",
  ctaSecondary: "Let's talk",
  ctaSecondaryHref: "#contact",
  ctaOs: "Boot spawnOS",
  ctaOsHref: "/os/",
} as const;

// ── Navbar ───────────────────────────────────────────────────────────────────

export const pageNavLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Updates", href: "#updates" },
  { label: "News", href: "#transmissions" },
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
  buyMeACoffeeHref: "https://www.buymeacoffee.com/aliasist",
} as const;

// ── Projects section ──────────────────────────────────────────────────────────

// Files Abductor binaries live in the public files-abductor release repo.
const releaseBaseUrl = "https://github.com/aliasist/files-abductor/releases/download/v2.7.0";

const downloadLinks = {
  appImage: `${releaseBaseUrl}/${encodeURIComponent("Aliasist.Files.Abductor-2.7.0.AppImage")}`,
  snap: `${releaseBaseUrl}/aliasist-files-abductor_2.7.0_amd64.snap`,
  windowsExe: `${releaseBaseUrl}/${encodeURIComponent("Aliasist.Files.Abductor.Setup.2.7.0.exe")}`,
};

export const projectsSection = {
  dividerLabel: "Shipped Projects",
  headline: "What's live right now.",
  subcopy: "Each one started as something I wanted to understand better. Now they're out there for you to use too.",
} as const;

export const projects = [
  {
    name: "Files Abductor",
    description:
      "A desktop app for downloading files from YouTube and direct URLs.",
    tech: ["Python", "yt-dlp", "Linux and Windows"],
    github: "https://github.com/aliasist/files-abductor/releases/tag/v2.7.0",
    downloads: [
      { label: "AppImage", href: downloadLinks.appImage },
      { label: "Snap", href: downloadLinks.snap },
      { label: "Windows", href: downloadLinks.windowsExe },
    ],
    status: "Live" as "Live" | "Archived",
    tone: "teal",
    link: null as string | null,
    linkLabel: "Get the app",
    banner: filesAbductorBanner,
  },
  {
    name: "Aliasist AI",
    description:
      "Chat and make images with AI that answers from real documents and shows you exactly where it got the answer.",
    tech: ["Chat", "Image generation", "Cited sources"],
    downloads: [],
    status: "Live" as "Live" | "Archived",
    tone: "violet",
    link: "https://www.aliasist.tech",
    linkLabel: "Open Aliasist AI",
    banner: aliasistTechBanner,
  },
  {
    name: "Globalize",
    description:
      "Spin a 3D globe and see data centers, undersea cables, air traffic, and earthquakes all in one place.",
    tech: ["3D globe", "Data centers", "Air traffic", "Earthquakes"],
    downloads: [],
    status: "Live" as "Live" | "Archived",
    tone: "cyan",
    link: "https://www.aliasist.world",
    linkLabel: "Open Globalize",
    banner: globalizeBanner,
  },
  {
    name: "SpaceSist",
    description:
      "NASA, SpaceX, the ISS, asteroids, and exoplanets, all on one live space dashboard.",
    tech: ["Launches", "ISS tracking", "Asteroids", "Exoplanets"],
    downloads: [],
    status: "Live" as "Live" | "Archived",
    tone: "violet",
    link: "https://space.aliasist.com",
    linkLabel: "Open SpaceSist",
    banner: spaceBanner,
  },
  {
    name: "ClearSist",
    description:
      "Strip the hidden metadata out of your photos, PDFs, and Office files before you share them. It all runs in your browser.",
    tech: ["Photos", "PDFs", "Office files"],
    downloads: [],
    status: "Live" as "Live" | "Archived",
    tone: "cyan",
    link: "https://clearasist.pages.dev",
    linkLabel: "Open ClearSist",
    banner: clearasistBanner,
  },
  {
    name: "PDFSist",
    description:
      "Fill in text, draw or type your signature, and download the signed PDF. Your file never leaves your browser.",
    tech: ["Sign PDFs", "Add text", "Free", "No uploads"],
    downloads: [],
    status: "Live" as "Live" | "Archived",
    tone: "teal",
    link: "https://pdf.aliasist.com",
    linkLabel: "Open PDFSist",
    banner: pdfsistBanner,
  },
] as const;

export const projectCount = projects.length;

export const COMING_SOON_PROJECTS = [
  {
    codename: "Future projects are on hold.",
    description: "FREEZE. No new apps until 2027. I'm putting everything into making the ones above faster, sturdier, and easier to use.",
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
  pathBadge: "Studying computer science · Designed with systems in mind.",
  skillsLabel: "What I work with",
  skills: [
    "TypeScript",
    "JavaScript",
    "Node.js",
    "SQL",
    "Python",
    "React",
    "Tailwind CSS",
    "Cloudflare Workers",
    "D1 databases",
    "Vector databases",
    "AI document systems",
  ] as const,
  /**
   * Each block: optional `kicker` (small label) + `body` (main text).
   * Project-first positioning for the Aliasist suite.
   */
  bioBlocks: [
    {
      kicker: "Who's behind it",
      body: "I'm working toward a degree in computer science because I want to understand how state-of-the-art technology is built. My hope is to apply that knowledge to projects that help people, improve lives, and make a meaningful difference for good.",
    },
    {
      kicker: "What it is",
      body: "Aliasist is where that intention becomes practice. Each app explores a real need or a better way to make complex technology useful and approachable. Right now I'm not adding new apps. I'm making the ones here solid.",
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
    { num: `${projectCount}`, label: "Projects listed", sym: "" as const },
    { num: `${suiteAppCount}`, label: "Web apps", sym: "" as const },
  ],
} as const;

// ── Contact ─────────────────────────────────────────────────────────────────

export const contact = {
  dividerLabel: "Contact",
  introLabel: "Contact",
  headline: "Want to talk?",
  introStrong: "Got an idea, a question, or found something broken?",
  introRest: "Send it my way. I read everything, and honest feedback is how these tools get better.",
  successTitle: "Got it!",
  successBody:
    "Thanks for reaching out. I'll get back to you as soon as I can.",
  sendAnother: "Send another",
  placeholders: {
    name: "Name",
    email: "Email",
    message: "What's on your mind?",
  },
  submitIdle: "Send it",
  submitSending: "Sending...",
  errorFallback: "That didn't go through. Email me at dev@aliasist.com instead.",
  suiteColumnLabel: "Projects",
  liveBadge: "Live",
  demoBadge: "Demo",
  suiteStats: [
    { n: `${projectCount}`, l: "Projects" },
    { n: `${suiteAppCount}`, l: "Web apps" },
    { n: `${projectCount - suiteAppCount}`, l: "Desktop app" },
  ],
  directLinks: [
    { label: "GitHub", href: "https://github.com/aliasist", iconKey: "github" as const },
    { label: "dev@aliasist.com", href: "mailto:dev@aliasist.com", iconKey: "email" as const },
  ],
} as const;

// ── Subscribe (email signup) ────────────────────────────────────────────────

export const subscribeSection = {
  dividerLabel: "Updates",
  introLabel: "Subscribe",
  headline: "Stay in the loop.",
  introStrong: "No spam, I promise.",
  introRest: "I'll only email when something new is live or worth telling you about.",
  placeholder: "your@email.com",
  submitIdle: "Subscribe",
  submitSending: "Sending...",
  successTitle: "You're in!",
  successBody: "Welcome aboard. Talk soon.",
  sendAnother: "Add another email",
  errorFallback: "Hmm, that didn't work. Give it another try.",
  disclaimer: "Unsubscribe anytime.",
} as const;

// ── Updates & events ───────────────────────────────────────────────────────

export const updatesSection = {
  dividerLabel: "Log",
  headline: "Updates & events",
  subcopy: "What's new, what shipped, and what's coming up.",
} as const;

export const updates = [
  {
    id: "u2",
    kind: "update" as const,
    date: "2026-07-30",
    title: "Document curation dashboard is live",
    body: "You can now drop documents into the right topic, and Aliasist AI will answer from them and cite its sources.",
    href: "#",
  },
  {
    id: "u1",
    kind: "update" as const, // "update" | "event"
    date: "2026-07-30",
    title: "Homepage gets an updates & events log",
    body: "One spot for what I'm shipping and what's coming up, separate from the news feed below.",
    href: "#",
  },
  // Add new entries above this line, newest first.
] as const;

export type UpdateEntry = (typeof updates)[number];

// ── Transmissions (blog) section headers ─────────────────────────────────────

export const transmissions = {
  dividerLabel: "News",
  headline: "News from around tech",
  scanning: "Pulling in the latest...",
  offline: "Couldn't reach the feed right now, so here are some saved posts.",
  liveFeedPrefix: "Updated ",
  liveFeedRecent: "recently",
} as const;
