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

const aliasistTechBanner = "/retro-banners/aliasist-ai.svg";
const clearasistBanner = "/retro-banners/clearasist.svg";
const filesAbductorBanner = "/retro-banners/files-abductor.svg";
const globalizeBanner = "/retro-banners/globalize.svg";
const spaceBanner = "/retro-banners/spacesist.svg";
const pdfsistBanner = "/retro-banners/pdfsist.svg";

// ── Suite apps (live products) ───────────────────────────────────────────────

/** Used by Navbar "Projects" menu and Contact section project list, keep in sync. */
export const suiteApps = [
  {
    label: "Aliasist AI",
    sub: "Ask questions from your files",
    href: "https://www.aliasist.tech",
    icon: "AT",
  },
  {
    label: "Globalize",
    sub: "Live 3D globe with flights and cables",
    href: "https://www.aliasist.world",
    icon: "GL",
  },
  {
    label: "SpaceSist",
    sub: "Watch live rocket launches and the Space Station",
    href: "https://space.aliasist.com",
    icon: "SS",
  },
  {
    label: "ClearSist",
    sub: "Wipe hidden details from photos and files",
    href: "https://clearasist.pages.dev",
    icon: "CL",
  },
  {
    label: "PDFSist",
    sub: "Sign and write on PDFs in your browser",
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
  tagline: "Tools, dashboards, and experiments for the web",
  subcopy:
    "A group of free tools I'm building for research, data, privacy, and the web. They are simple to use and made to be useful. Pick one and take a look.",
  ctaContact: "Projects",
  ctaContactHref: "#projects",
  ctaSecondary: "Let's talk",
  ctaSecondaryHref: "#contact",
  ctaOs: "Boot spawnOS",
  ctaOsHref: "/os/",
} as const;

// ── Navbar ───────────────────────────────────────────────────────────────────

export const pageNavLinks = [
  { label: "Directory", href: "#directory" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
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
  dividerLabel: "Projects",
  headline: "What's live right now",
  subcopy: "These started as things I wanted to understand better. Now you can use them too.",
} as const;

export const projects = [
  {
    name: "Files Abductor",
    description:
      "A desktop app for downloading files from YouTube and other links.",
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
      "Chat and make images with a tool that answers from real documents and shows where the answer came from.",
    tech: ["Chat", "Image generation", "Cited sources"],
    downloads: [],
    status: "Live" as "Live" | "Archived",
    tone: "teal",
    link: "https://www.aliasist.tech",
    linkLabel: "Open Aliasist AI",
    banner: aliasistTechBanner,
  },
  {
    name: "Globalize",
    description:
      "Use a 3D globe to see data centers, undersea cables, air traffic, and earthquakes in one place.",
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
      "See NASA, SpaceX, the ISS, asteroids, and exoplanets on one live space dashboard.",
    tech: ["Launches", "ISS tracking", "Asteroids", "Exoplanets"],
    downloads: [],
    status: "Live" as "Live" | "Archived",
    tone: "blue",
    link: "https://space.aliasist.com",
    linkLabel: "Open SpaceSist",
    banner: spaceBanner,
  },
  {
    name: "ClearSist",
    description:
      "Remove hidden metadata from photos, PDFs, and Office files before sharing them. It runs in your browser.",
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
      "Add text, draw or type your signature, and download the signed PDF. Your file stays in your browser.",
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
    codename: "New projects are on hold.",
    description: "No new apps until 2027. I'm focusing on making the ones above faster, stronger, and easier to use.",
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
  headline: "A little about me",
  pathBadge: "Studying computer science · Building with systems in mind.",
  skillsLabel: "Tools I use",
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
      kicker: "What Aliasist is",
      body: "Aliasist is an independent directory of web applications and privacy tools built by Blake.",
    },
    {
      kicker: "How it is built",
      body: "Everything here is built around three rules: client-side processing first so files stay on your device, zero tracking or analytics scripts, and pure utility without paywalls.",
    },
    {
      kicker: "Current focus",
      body: "I am a computer science student building software one tool at a time. Right now, I am not adding new apps. I am keeping the five tools in this directory fast, solid, and reliable.",
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
  headline: "Want to get in touch?",
  introStrong: "Have an idea, a question, or found something broken?",
  introRest: "Send it my way. I read everything, and feedback helps me make these tools better.",
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
  headline: "Keep up with updates",
  introStrong: "No spam.",
  introRest: "I'll only email when something new is live or worth sharing.",
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
  headline: "Updates and events",
  subcopy: "What's new, what shipped, and what's next.",
} as const;

export const updates = [
  {
    id: "u2",
    kind: "update" as const,
    date: "2026-07-30",
    title: "Document dashboard is live",
    body: "You can now add documents to a topic, and Aliasist AI will answer from them and show its sources.",
    href: "#",
  },
  {
    id: "u1",
    kind: "update" as const, // "update" | "event"
    date: "2026-07-30",
    title: "Added an updates and events log",
    body: "There is now one place for what I'm building and what's coming up, separate from the news feed.",
    href: "#",
  },
  // Add new entries above this line, newest first.
] as const;

export type UpdateEntry = (typeof updates)[number];

// ── Transmissions (blog) section headers ─────────────────────────────────────

export const transmissions = {
  dividerLabel: "News",
  headline: "Tech news",
  scanning: "Pulling in the latest...",
  offline: "The news feed is unavailable right now, so here are some saved posts.",
  liveFeedPrefix: "Updated ",
  liveFeedRecent: "recently",
} as const;
