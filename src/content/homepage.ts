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
import audiosistBanner from "@images/cinematic-suite/audiosist-cinematic-audio-intelligence-hero.png";
import ecosistBanner from "@images/ecosist_banner_tornado.png";
import filesAbductorBanner from "@images/files_abductor_banner_cinematic.png";
import pulseBanner from "@images/pulsesist_banner_cinematic.png";
import spaceBanner from "@images/spacesist_banner_cinematic.png";

// ── Hero ─────────────────────────────────────────────────────────────────────

export const hero = {
  statusBadge: "Aliasist · AI Tools",
  mascotLabel: "aliasist",
  mascotAlt: "Aliasist",
  mascotTitle: "Aliasist",
  eyeline: "AI tools // developer portfolio // projects",
  wordmark: "A L I A S I S T",
  tagline: "Practical AI tools and software builds.",
  subcopy:
    "I'm Blake. I build useful AI tools and software that solves real problems. The projects below show the work.",
  ctaWork: "About",
  ctaWorkHref: "#about",
  ctaContact: "Projects",
  ctaContactHref: "#projects",
  statusRow: ["AI Tools", "Developer Portfolio", "Projects"] as const,
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
    sub: "Data center intelligence",
    href: "https://datasist-frontend.pages.dev",
    icon: "🧠🏢",
  },
  {
    label: "SpaceSist",
    sub: "Orbital mission tools",
    href: "https://space.aliasist.com",
    icon: "🌌🛰️",
  },
  {
    label: "PulseSist",
    sub: "Stock Market Dashboard",
    href: "https://pulse.aliasist.com",
    icon: "📈🤖",
  },
  {
    label: "EcoSist",
    sub: "Under construction · Partially finished",
    href: "https://ecosist.aliasist.com",
    icon: "🌱🛠️",
  },
  {
    label: "Aliasist Files Abductor",
    sub: "File automation and downloads",
    href: "https://github.com/aliasist/aliasistabductor/releases/tag/%23v2.7.0",
    icon: "🛸📦",
  },
  {
    label: "Audiosist",
    sub: "Cinematic audio intelligence",
    href: "https://audiosist.online",
    icon: "🎧🌌",
  },
] as const;

// ── Footer ────────────────────────────────────────────────────────────────────

export const footer = {
  brandName: "Aliasist",
  mascotAlt: "",
  versionLine: "Aliasist",
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
  dividerLabel: "Projects // Proof of work",
  headline: "Built projects, not ideas.",
  subcopy: "These are side projects and live tools that show how I think, design, and ship.",
} as const;

export const projects = [
  {
    name: "DataSist",
    description:
      "A live data center intelligence platform with facility intelligence, environmental context, and AI-assisted analysis.",
    tech: ["React", "Vite", "Cloudflare Pages", "D1", "APIs", "AI"],
    github: "https://github.com/aliasist/datasist",
    downloads: [],
    status: "Live",
    icon: "🧠🏢",
    link: "https://datasist-frontend.pages.dev",
    linkLabel: "Open DataSist →",
    banner: dataBanner,
  },
  {
    name: "SpaceSist",
    description:
      "A live space dashboard using NASA, SpaceX, ISS, asteroid, and exoplanet data.",
    tech: ["React", "Vite", "NASA APIs", "SpaceX API", "Leaflet", "Cloudflare"],
    github: "https://github.com/aliasist",
    downloads: [],
    status: "Live",
    icon: "🌌🛰️👽",
    link: "https://space.aliasist.com",
    linkLabel: "Open SpaceSist →",
    banner: spaceBanner,
  },
  {
    name: "PulseSist",
    description:
      "A market dashboard with live charts, portfolio tools, and AI-assisted analysis.",
    tech: ["React", "Vite", "Cloudflare Workers", "D1", "FMP API", "AI"],
    github: "https://github.com/aliasist/stockmarket",
    downloads: [],
    status: "Live",
    icon: "📈🤖⚡",
    link: "https://pulse.aliasist.com",
    linkLabel: "Open PulseSist →",
    banner: pulseBanner,
  },
  {
    name: "Aliasist Files Abductor",
    description:
      "A GUI tool for downloading files from YouTube and direct URLs with a desktop-first workflow.",
    tech: ["Python", "GUI", "CLI", "File Automation", "yt-dlp"],
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
    name: "EcoSist",
    description:
      "An environmental dashboard for air quality, climate signals, and geospatial data. It is still under construction and partially finished.",
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
    status: "Under Construction",
    icon: "🌱",
    link: "https://ecosist.aliasist.com",
    linkLabel: "Open EcoSist →",
    banner: ecosistBanner,
  },
  {
    name: "Audiosist",
    description:
      "An epic cinematic audio intelligence scene for signal analysis, waveform motion, and futuristic sound design.",
    tech: ["Audio Intelligence", "Cinematic UI", "Signal Analysis", "Waveforms"],
    github: "https://audiosist.online",
    downloads: [],
    status: "Live",
    icon: "🎧🌌",
    link: "https://audiosist.online",
    linkLabel: "Open Audiosist →",
    banner: audiosistBanner,
  },
] as const;

export const comingSoonProjects = [
  {
    codename: "PROJECT Nightfall",
    description: "Signal intercepted. Classification level: Eyes only. Details redacted pending operational clearance.",
    eta: "ETA: 2027",
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
  authorSlots: [] as unknown as readonly { kicker: string; body: string }[],

  stats: [
    { num: "6",  label: "Live apps deployed", sym: "+" as const },
    { num: "7",  label: "External APIs integrated", sym: "+" as const },
    { num: "3",  label: "Years building in public", sym: "" as const },
    { num: "100", label: "Open source · github.com/aliasist", sym: "%" as const },
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
    { n: "6", l: "Live Apps" },
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
