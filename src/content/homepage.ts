/**
 * Homepage copy & navigation — edit this file to change marketing text and suite links.
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
  statusBadge: "Real-Time Data - 24/7",
  mascotLabel: "aliasist",
  mascotAlt: "Aliasist mascot",
  mascotTitle: "Aliasist mascot",
  eyeline: "Aliasist Projects // Creating tools for people.",
  wordmark: "ALIASIST",
  tagline: "Real-time data, real-world tools.",
  subcopy: "Welcome to the site, My name is Blake and I build data-centric tools for users. This is my portfolio of live projects. Please reach out if you have feedback or want to collbaborate, I'd love to hear from you, thanks. Enjoy the Tools. ^_^",
  ctaWork: "View work",
  ctaContact: "Contact me",
  statusRow: ["Open Source", "Check out my projects below", "More coming soon!"],
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
    sub: "AI Data Center Intel",
    href: "https://datasist-frontend.pages.dev",
    icon: "🌐",
  },
  {
    label: "PulseSist",
    sub: "Stock Market Intelligence",
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
    sub: "Ecological Intelligence",
    href: "https://ecosist.aliasist.com",
    icon: "🌱",
  },
] as const;

// ── Footer ────────────────────────────────────────────────────────────────────

export const footer = {
  brandName: "Aliasist",
  mascotAlt: "Aliasist Mascot UFO",
  versionLine: "Aliasist Portfolio // Creating tools for the future.",
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
      "Live environmental intelligence platform for storm signals, atmospheric conditions, and ecosystem monitoring. EcoSist turns weather and earth-system data into a cleaner operational view with real-time mapping, hazard awareness, and a darker cinematic interface built for environmental situational awareness.",
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
    tech: ["Python", "CLI", "File Automation"],
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
    codename: "PROJECT ClearSight",
    description: "still deciding on on the next app",
    eta: "Planning projects for 2027",
  },
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
  headline: "Who am I?",
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
      body: "I started building on the web since I was a kid — my first real project was a simple HTML site for an online clan. That early dive into HTML, CSS, set the pattern of work flow.",
    },
  ] as const,

  /**
   * Your own phases — optional space to grow the About column.
   * • Leave `body` as "" and the slot won’t appear on the site.
   * • When you’re ready, paste or write your paragraph in `body` and adjust `kicker`.
   * • Copy a full `{ kicker: "…", body: "" },` line to add more slots.
   */
  authorSlots: [
    { kicker: "Your section title (rename me)", body: "" },
    { kicker: "Another angle (optional)", body: "" },
    { kicker: "Third slot (optional)", body: "" },
  ] as const,

  stats: [
    { num: "5", label: "Live apps in the Aliasist suite", sym: "" as const },
    { num: "OSS", label: "Public repos, documented deploys, verifiable behavior", sym: "" as const },
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
