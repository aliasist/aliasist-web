/**
 * Homepage copy & navigation — edit this file to change marketing text and suite links.
 *
 * Images:
 *   • Project banners + assets live under `./images` (imported via `@images/...`).
 *   • Hero backdrop uses `public/background.png` (see `HeroSection`).
 *   • Optional Cloudflare **text-to-image** worker: `apps/phoenix-image-worker`
 *     calls `@cf/leonardo/phoenix-1.0` (Leonardo Phoenix on Workers AI). It
 *     generates **new** images from prompts — not automatic “enhancement” of
 *     these PNGs. To use it for marketing art: deploy the worker, POST a prompt,
 *     save the JPEG/PNG, then commit under `images/` or `public/`.
 *
 * Suite apps (live products):
 *   • Navbar: open "Suite" in the top bar — same URLs as `suiteApps` below.
 *   • Contact: scroll to Contact → right column "The Aliasist Suite".
 *   • Projects: each card has its own "Open …" button; URLs are in `projects`.
 *
 * Backend/API URLs (for developers): see `src/config/api.ts` (`siteEndpoints`).
 */

import dataBanner from "@images/datasist_banner_cinematic.png";
import ecosistBanner from "@images/ecosist_banner_tornado.png";
import filesAbductorBanner from "@images/files_abductor_banner_cinematic.png";
import pulseBanner from "@images/pulsesist_banner_cinematic.png";
import spaceBanner from "@images/spacesist_banner_cinematic.png";

// ── Hero ─────────────────────────────────────────────────────────────────────

export const hero = {
  statusBadge: "GitHub Developer Member",
  mascotLabel: "aliasist",
  mascotAlt: "Aliasist",
  mascotTitle: "Aliasist",
  eyeline: "Aliasist Projects // Creating tools for people.",
  wordmark: "A L I A S I S T",
  tagline: "Real-time data, real-world tools.",
  subcopy:
    "Hey, welcome to the site, I'm Blake(Aliasist) I'm a freelance worker building data-centric tools. This is my portfolio of live projects. Reach out if you have feedback or want to collaborate — I'd love to hear from you. Enjoy the tools.",
  ctaWork: "View work",
  ctaContact: "Contact me",
  statusRow: ["Open Source", "Check out my projects below", "More coming later this year"] as const,
} as const;

// ── Navbar ───────────────────────────────────────────────────────────────────

export const pageNavLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Tech News", href: "#transmissions" },
] as const;

/** Used by Navbar “Suite” menu and Contact section suite list — keep in sync. */
export const suiteApps = [
  {
    label: "DataSist",
    sub: "AI Data Center WebApp",
    href: "https://datasist-frontend.pages.dev",
    icon: "🌐",
  },
  {
    label: "Atomicity",
    sub: "Stopwatch",
    href: "/atomicity/",
    icon: "⏱️",
  },
  {
    label: "PulseSist",
    sub: "Stock Market Dashboard",
    href: "https://pulse.aliasist.com",
    icon: "📈",
  },
  {
    label: "SpaceSist",
    sub: "Live Space Portal",
    href: "https://space.aliasist.com",
    icon: "🌌",
  },
  {
    label: "EcoSist",
    sub: "**UNDER CONSTRUCTION** project paused.",
    href: "https://ecosist.aliasist.com",
    icon: "🌱",
  },
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
  dividerLabel: "Artifacts // Projects",
  headline: "Deployed tools.",
} as const;

export const projects = [
  {
    name: "SpaceSist",
    description:
      "Live space intelligence portal — NASA APOD daily images, real-time ISS tracking (5s updates), SpaceX mission control, near-Earth asteroid radar, 6,000+ exoplanet archive, and NASA image gallery. 7 live APIs. The universe, in real time.",
    tech: ["React", "Vite", "NASA APIs", "SpaceX API", "Leaflet", "Cloudflare"],
    github: "https://github.com/aliasist",
    downloads: [],
    status: "Live",
    icon: "🌌",
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
    icon: "⏱️",
    link: "/atomicity/",
    linkLabel: "Open Atomicity →",
    banner: null,
  },
  {
    name: "PulseSist",
    description:
      "Real-time stock market intelligence platform. Live candlestick charts, portfolio tracking, AI-powered market analysis, and multi-ticker surveillance. Built for traders who think the market is being watched — because it is.",
    tech: ["React", "Vite", "Cloudflare Workers", "D1", "FMP API", "AI"],
    github: "https://github.com/aliasist/stockmarket",
    downloads: [],
    status: "Live",
    icon: "📈",
    link: "https://pulse.aliasist.com",
    linkLabel: "Open PulseSist →",
    banner: pulseBanner,
  },
  {
    name: "EcoSist",
    description:
      "Code being revamped.",
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
    icon: "🌱",
    link: "https://ecosist.aliasist.com",
    linkLabel: "Open EcoSist →",
    banner: ecosistBanner,
  },
  {
    name: "Aliasist-Files-Abductor",
    description:
      "This app can download any file from YouTube.com or any other website or server with a link. Simply Copy, Paste, & Download with your link, this app doesn't apologize for itself. Does the work. No questions asked.",
    tech: ["Python", "CLI", "File Automation", "This was my first program I coded, 3 years ago. I have been improving it ever since, and it is now a full fledged app with a GUI, and support for downloading from any website, not just YouTube."],
    github: `https://github.com/aliasist/aliasistabductor/releases/tag/${releaseTagEncoded}`,
    downloads: [
      { label: "AppImage", href: downloadLinks.appImage },
      { label: "Snap", href: downloadLinks.snap },
      { label: "Windows", href: downloadLinks.windowsExe },
    ],
    status: "Live",
    icon: "🛸",
    link: null as string | null,
    linkLabel: null as string | null,
    banner: filesAbductorBanner,
  },
  {
    name: "DataSist",
    description:
      "Live AI data center intelligence platform — 48 facilities tracked across 13 countries. Real-time EIA electricity prices, power consumption, water usage, investment data, community resistance, and grid stress risk. Groq AI analysis, facility comparison, region filters, and full admin CRUD panel.",
    tech: ["React", "Vite", "D1", "Groq AI", "Leaflet", "EIA API"],
    github: "https://github.com/aliasist/datasist",
    downloads: [],
    status: "Live",
    icon: "🌐",
    link: "https://datasist-frontend.pages.dev",
    linkLabel: "Open DataSist →",
    banner: dataBanner,
  },
] as const;

export const comingSoonProjects = [
  {
    codename: "PROJECT Nightfall",
    description: "still deciding on the next app",
    eta: "Planning projects for 2027",
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
  skillsLabel: "// skill_set_learning",
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
      body: "I coded my first website in 2004, it was for my Age of Empires clan, oXiDe and it started from dabbling in making banners/forum signatures. Fast-forward to today, and I'm a self-taught developer building practical web tools, AI-assisted workflows, and data-driven applications through Aliasist. I'm providing a way to organize and make sense of all the data out there.",
    },
  ] as const,

  /**
   */
  authorSlots: [
    { kicker: "AGSC Updates", body: "" },
    { kicker: "implementing features and improvements", body: "" },
    { kicker: "deploying soon.", body: "" },
  ] as const,

  stats: [
    { num: "5", label: "Open Source", sym: "" as const },
    { num: "OSS", label: "Public repos, documented deploys, verifiable behavior, github.com/aliasist", sym: "" as const },
  ],
} as const;

// ── Contact ─────────────────────────────────────────────────────────────────

export const contact = {
  dividerLabel: "Channel Open // Contact",
  signalLabel: "Welcome, Earthling.",
  headline: "Make contact.",
  introStrong: "Open to collaborations, internships, and project work.",
  introRest: "Creating tools for users.",
  successTitle: "Transmission received",
  successBody:
    "Message logged. Responses prioritized by technical complexity and project alignment.",
  sendAnother: "Send another ↩",
  placeholders: {
    name: "Name",
    email: "Email",
    message: "Message — what are you working on?",
  },
  submitIdle: "Send message ↗",
  submitSending: "// transmitting...",
  errorPrefix: "// error:",
  errorFallback: "transmission failed — try dev@aliasist.com",
  suiteColumnLabel: "// The Aliasist Suite",
  liveBadge: "Live",
  suiteStats: [
    { n: "5", l: "Live Apps" },
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
  scanning: "// scanning frequencies...",
  offline: "// live feed offline — showing archive",
  liveFeedPrefix: "// live feed · updated ",
  liveFeedRecent: "recently",
} as const;
