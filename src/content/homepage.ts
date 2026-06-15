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
import nexusBanner from "@images/aliasist_banner_command.png";
import pulseBanner from "@images/pulsesist_banner_cinematic.png";
import spaceBanner from "@images/spacesist_banner_cinematic.png";

// ── Hero ─────────────────────────────────────────────────────────────────────

export const hero = {
  statusBadge: "Aliasist · Technology Company",
  mascotLabel: "aliasist",
  mascotAlt: "Aliasist",
  mascotTitle: "Aliasist",
  eyeline: "Intelligent systems · practical software",
  wordmark: "A L I A S I S T",
  tagline: "Software built for clarity, speed, and scale.",
  subcopy:
    "Aliasist develops focused software products that turn complex data and workflows into useful, dependable systems.",
  ctaWork: "Explore products",
  ctaWorkHref: "#projects",
  ctaContact: "About Aliasist",
  ctaContactHref: "#about",
  trustSignals: ["Secure by design", "Privacy conscious", "Built on modern cloud infrastructure"] as const,
  statusRow: ["AI Systems", "Data Intelligence", "Operational Software"] as const,
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
    label: "Nexus",
    sub: "Live planetary intelligence console",
    href: "/nexus/",
    icon: "⌘",
    status: "Live",
  },
  {
    label: "DataSist",
    sub: "Data center intelligence",
    href: "https://datasist-frontend.pages.dev",
    icon: "DS",
    status: "Live",
  },
  {
    label: "SpaceSist",
    sub: "Orbital mission tools",
    href: "https://space.aliasist.com",
    icon: "SS",
    status: "Live",
  },
  {
    label: "PulseSist",
    sub: "Stock Market Dashboard",
    href: "https://pulse.aliasist.com",
    icon: "PS",
    status: "Live",
  },
  {
    label: "EcoSist",
    sub: "Under construction · Partially finished",
    href: "https://ecosist.aliasist.com",
    icon: "ES",
    status: "In development",
  },
  {
    label: "Aliasist Files Abductor",
    sub: "File automation and downloads",
    href: "https://github.com/aliasist/aliasistabductor/releases/tag/%23v2.7.0",
    icon: "FA",
    status: "Available",
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
  dividerLabel: "Products",
  headline: "Focused software for real-world work.",
  subcopy: "A growing portfolio of live products across data intelligence, markets, infrastructure, and automation.",
} as const;

export const projects = [
  {
    name: "Nexus",
    description:
      "A live planetary intelligence console aggregating seismic and space weather signals into a unified dashboard.",
    tech: ["React", "Vite", "Three.js", "USGS API", "NOAA API", "Cloudflare"],
    github: "https://github.com/aliasist/aliasistabductor",
    downloads: [],
    status: "Live",
    icon: "NX",
    link: "/nexus/",
    linkLabel: "Open Nexus →",
    banner: nexusBanner,
  },
  {
    name: "DataSist",
    description:
      "A live data center intelligence platform with facility intelligence, environmental context, and AI-assisted analysis.",
    tech: ["React", "Vite", "Cloudflare Pages", "D1", "APIs", "AI"],
    github: "https://github.com/aliasist/datasist",
    downloads: [],
    status: "Live",
    icon: "DS",
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
    icon: "SS",
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
    icon: "PS",
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
    icon: "FA",
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
    icon: "ES",
    link: "https://ecosist.aliasist.com",
    linkLabel: "Open EcoSist →",
    banner: ecosistBanner,
  },
] as const;

export const comingSoonProjects = [
  {
    codename: "Next product",
    description: "A new Aliasist product is in research and development.",
    eta: "Planned for 2027",
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
  dividerLabel: "Company",
  headline: "Technology should create leverage.",
  pathBadge: "Independent technology company",
  skillsLabel: "Core capabilities",
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
      body: "Aliasist is an independent technology company founded by Blake Hooper. It builds practical web products, AI-assisted workflows, and data-driven applications designed to make complex information easier to understand and act on.",
    },
  ] as const,

  /**
   */
  authorSlots: [] as unknown as readonly { kicker: string; body: string }[],

  stats: [
    { num: "6",  label: "Products and platforms", sym: "" as const },
    { num: "7",  label: "External APIs integrated", sym: "+" as const },
    { num: "3",  label: "Years building in public", sym: "" as const },
    { num: "5", label: "Technology categories", sym: "" as const },
  ],
} as const;

// ── Contact ─────────────────────────────────────────────────────────────────

export const contact = {
  dividerLabel: "Contact",
  signalLabel: "Business inquiries",
  headline: "Start a conversation.",
  introStrong: "Open to strategic partnerships, product opportunities, and selected project work.",
  introRest: "Tell us what you are building.",
  successTitle: "Message received",
  successBody:
    "Thank you. Your message has been received and will be reviewed.",
  sendAnother: "Send another message",
  placeholders: {
    name: "Name",
    email: "Email",
    message: "Message — what are you working on?",
  },
  submitIdle: "Send message ↗",
  submitSending: "Sending...",
  errorPrefix: "Error:",
  errorFallback: "Message failed. Email dev@aliasist.com directly.",
  suiteColumnLabel: "Aliasist products",
  suiteStats: [
    { n: "6", l: "Products" },
    { n: "7+", l: "Integrations" },
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
  dividerLabel: "Insights",
  headline: "Research, technology, and market intelligence.",
  scanning: "Loading latest updates...",
  offline: "Live feed unavailable · showing archive",
  liveFeedPrefix: "Live feed · updated ",
  liveFeedRecent: "recently",
} as const;
