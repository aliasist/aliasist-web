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

import dataBanner from "@images/aliasist_banner_orbit.png";
import pulseBanner from "@images/aliasist_banner_command.png";
import spaceBanner from "@images/a_planet_in_space_with_clouds.jpg";
import abduction1 from "@images/aliasist-abduction-1774688862693.png";
import tikaLogo from "@images/aliasist_icon_final.png";

// ── Hero ─────────────────────────────────────────────────────────────────────

export const hero = {
  statusBadge: "Ready // 2026",
  mascotLabel: "aliasist",
  mascotAlt: "Aliasist mascot",
  mascotTitle: "Aliasist mascot",
  eyeline: "AI security // adversarial defense",
  wordmark: "ALIASIST",
  tagline: "Intelligence for the systems that shape the world.",
  subcopy:
    "Shipping DataSist (flagship) and SpaceSist (brand-world): data systems, live dashboards, and tooling that turns messy signals into decisions. Portfolio and writing live here; the app hub routes to aliasist.tech.",
  ctaWork: "View work",
  ctaContact: "Contact",
  statusRow: ["Open Source", "AI Security", "Live suite"],
} as const;

// ── Navbar ───────────────────────────────────────────────────────────────────

export const pageNavLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "#transmissions" },
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
    label: "Ecosist",
    sub: "Ecological Intelligence",
    href: "https://ecosist.aliasist.com",
    icon: "🌱",
  },
] as const;

// ── Footer ────────────────────────────────────────────────────────────────────

export const footer = {
  brandName: "Aliasist",
  mascotAlt: "Aliasist Mascot UFO",
  versionLine: "Aliasist v1.1.0 // Signal Active",
  githubLabel: "GitHub",
  emailLabel: "Email",
  githubHref: "https://github.com/aliasist",
  emailHref: "mailto:dev@aliasist.com",
} as const;

// ── Projects section ──────────────────────────────────────────────────────────

const releaseTag = "v2.7.0";
const releaseBaseUrl = `https://github.com/aliasist/aliasistabductor/releases/download/${releaseTag}`;

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
    name: "TikaSist",
    description:
      "TikTok keyword intelligence platform — track hashtags, creators, and topics. Run automated scans, collect matching videos with full engagement metrics (likes, comments, shares, saves), browse results in a searchable grid, and monitor scan history. Built on Cloudflare Workers + D1.",
    tech: ["Vite", "Cloudflare Workers", "D1", "TikTok", "Keyword AI"],
    github: "https://github.com/aliasist",
    downloads: [] as { label: string; href: string }[],
    status: "Live",
    icon: "👁️",
    link: "https://tikasist-api.bchooper0730.workers.dev",
    linkLabel: "Open TikaSist →",
    banner: tikaLogo,
  },
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
    name: "Aliasist-Files-Abductor",
    description:
      "A file organization and automation tool that abducts your messy directories and deposits them exactly where they belong. Built with a clean CLI interface and an alien theme that doesn't apologize for itself. Does the work. No questions asked.",
    tech: ["Python", "CLI", "File Automation"],
    github: `https://github.com/aliasist/aliasistabductor/releases/tag/${releaseTag}`,
    downloads: [
      { label: "AppImage", href: downloadLinks.appImage },
      { label: "Snap", href: downloadLinks.snap },
      { label: "Windows", href: downloadLinks.windowsExe },
    ],
    status: "Live",
    icon: "🛸",
    link: null as string | null,
    linkLabel: null as string | null,
    banner: abduction1,
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
    codename: "PROJECT CIPHER",
    description: "// adversarial_ml_toolkit — pending clearance",
    eta: "Q3 2026",
  },
  {
    codename: "PROJECT SPECTER",
    description: "// ai_threat_modeling_suite — in development",
    eta: "Q4 2026",
  },
] as const;

export type ProjectCard = (typeof projects)[number];

// ── About ─────────────────────────────────────────────────────────────────────

export const about = {
  dividerLabel: "About me",
  headline: "Aliasist origin story.",
  pathBadge: "◈ Path: AI Security Research",
  skillsLabel: "// skill_set",
  skills: [
    "Python",
    "JavaScript",
    "HTML / CSS",
    "React / Vite",
    "Node.js",
    "UI Design",
    "CLI Tools",
    "File Automation",
    "Security Research",
    "AiSec (Learning)",
  ],
  bio: {
    p1Before: "I've been interested in coding since I was a kid — started with a simple HTML website for my online clan.",
    p1Strong: "HTML, CSS, Python",
    p1After:
      ". Always a passion project. The advent of AI changed the trajectory entirely — this is the frontier I want to be on.",
    p2Before: "Currently studying ",
    p2Strong: "Computer Information Systems",
    p2After:
      ", learning the adversarial side of machine learning, and building open-source tools. Aliasist is where I ship real things while I work toward that goal.",
    p3Before: "The tools change. ",
    p3Strong: "The obsession doesn't.",
    p3After: "",
  },
  stats: [
    { num: "4", label: "Live apps in the Aliasist suite", sym: "" as const },
    { num: "1→", label: "Clear target: AiSec", sym: "→" as const },
    // Add new stats here, e.g. { num: "?", label: "Your new stat", sym: "" as const },
  ],
} as const;

// ── Contact ─────────────────────────────────────────────────────────────────

export const contact = {
  dividerLabel: "Channel Open // Contact",
  signalLabel: "Signal open",
  headline: "Make contact.",
  introStrong: "Open to collaborations, internships, and interesting problems.",
  introRest: "Building in public, pursuing AiSec.",
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
