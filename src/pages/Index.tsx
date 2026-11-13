import { useState, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import BuyMeACoffee from "@/components/BuyMeACoffee";
import ErrorBoundary from "@/components/ErrorBoundary";
import aliasistLogo from "@/assets/aliasist-logo.png";
import globalizeLogo from "@/assets/globalize-logo.png";
import { siteEndpoints } from "@/config/api";
import { projects } from "@/content/homepage";
import {
  Download,
  ExternalLink,
  Terminal,
  Gamepad2,
  FileText,
  Check,
  Copy,
  Mail,
  Send,
} from "lucide-react";

const filesAbductor = projects.find((p) => p.name === "Files Abductor");
const filesAbductorDownloads = filesAbductor?.downloads ?? [];
const filesAbductorGithub = filesAbductor?.github ?? "https://github.com/aliasist/files-abductor/releases";

interface MirrorLink {
  label: string;
  url: string;
  actionText: string;
  type: "web" | "download" | "github" | "docs" | "terminal" | "game";
  isDirectDownload?: boolean;
}

interface DirectoryService {
  id: string;
  name: string;
  categories: ("apps" | "tools" | "experiments")[];
  categoryBadge: string;
  icon?: string;
  monogram?: string;
  accent?: string;
  statusBadge: string;
  description: string;
  architectureNotes: string;
  tags: string[];
  mirrors: MirrorLink[];
}

const DIRECTORY_SERVICES: DirectoryService[] = [
  {
    id: "aliasist-ai",
    name: "Aliasist AI",
    categories: ["apps", "tools"],
    categoryBadge: "Smart Search",
    icon: aliasistLogo,
    statusBadge: "Reads Your Files",
    description:
      "Chat and make images with a tool that answers from real documents and shows where the answer came from.",
    architectureNotes:
      "Answers questions from your documents and can create images",
    tags: ["Chat With Files", "Cites Sources", "Image Generation"],
    mirrors: [
      {
        label: "www.aliasist.tech",
        url: "https://www.aliasist.tech",
        actionText: "Open App",
        type: "web",
      },
    ],
  },
  {
    id: "globalize",
    name: "Globalize",
    categories: ["apps", "experiments"],
    categoryBadge: "3D Globe",
    icon: globalizeLogo,
    monogram: "GL",
    statusBadge: "Live World Map",
    description:
      "A 3D spinning globe you can explore in your browser. See internet cables under the ocean, giant data centers, planes flying right now, and real earthquakes as they happen.",
    architectureNotes:
      "Pulls live data directly from flight trackers and earthquake monitors & many others.",
    tags: ["3D Earth", "Data Centers", "Ocean Cables", "Earthquakes"],
    mirrors: [
      {
        label: "www.aliasist.world",
        url: "https://www.aliasist.world",
        actionText: "Open App",
        type: "web",
      },
      {
        label: "github.com/aliasist/globalize",
        url: "https://github.com/aliasist",
        actionText: "Source Code",
        type: "github",
      },
    ],
  },
  {
    id: "spacesist",
    name: "SpaceSist",
    categories: ["apps", "experiments"],
    categoryBadge: "Space",
    statusBadge: "Live Tracking",
    description:
      "A live space dashboard that watches rocket launches, tracks where the Space Station is flying right above Earth, and counts down to the next rocket takeoff.",
    architectureNotes:
      "Gets live info from NASA and other space agencies I was able to connect to.",
    tags: ["Rockets", "Space Station", "NASA", "SpaceX", "Asteroids"],
    mirrors: [
      {
        label: "space.aliasist.com",
        url: "https://space.aliasist.com",
        actionText: "Open App",
        type: "web",
      },
      {
        label: "github.com/aliasist/space-asist",
        url: "https://github.com/aliasist",
        actionText: "Source Code",
        type: "github",
      },
    ],
  },
  {
    id: "clearsist",
    name: "ClearSist",
    categories: ["apps", "tools"],
    categoryBadge: "Privacy",
    statusBadge: "100% Private",
    description:
      "Photos you take hide your secret location, time, and camera details. ClearSist wipes that hidden info away before you send your pictures to anyone.",
    architectureNotes:
      "Runs completely in your web browser. Your pictures never leave your phone or computer.",
    tags: ["Clean Photos", "Remove Location", "Stays on Your Device"],
    mirrors: [
      {
        label: "clearasist.pages.dev",
        url: "https://clearasist.pages.dev",
        actionText: "Open App",
        type: "web",
      },
      {
        label: "github.com/aliasist",
        url: "https://github.com/aliasist",
        actionText: "Source Code",
        type: "github",
      },
    ],
  },
  {
    id: "pdfsist",
    name: "PDFSist",
    categories: ["apps", "tools"],
    categoryBadge: "PDF Tool",
    statusBadge: "No Sign-Up",
    description:
      "Sign papers and write on PDFs without printing them. Draw your signature with your mouse or finger, save the file, and you're done.",
    architectureNotes:
      "Free, no accounts, and your papers are never uploaded to the internet.",
    tags: ["Sign PDFs", "Draw Signature", "No Account", "Free"],
    mirrors: [
      {
        label: "pdf.aliasist.com",
        url: "https://pdf.aliasist.com",
        actionText: "Open App",
        type: "web",
      },
      {
        label: "github.com/aliasist/pdfsist",
        url: "https://github.com/aliasist",
        actionText: "Source Code",
        type: "github",
      },
    ],
  },
  {
    id: "files-abductor",
    name: "Files Abductor",
    categories: ["apps", "tools"],
    categoryBadge: "Desktop",
    statusBadge: "Download",
    description:
      "A desktop app for downloading files from YouTube and other links. Linux and Windows builds are ready to grab.",
    architectureNotes:
      "Runs on your computer. Pick the installer for your system and you're set.",
    tags: ["YouTube", "Downloads", "Linux", "Windows"],
    mirrors: [
      ...filesAbductorDownloads.map((d) => ({
        label: d.label,
        url: d.href,
        actionText: `Get ${d.label}`,
        type: "download" as const,
        isDirectDownload: true,
      })),
      {
        label: "github.com/aliasist/files-abductor",
        url: filesAbductorGithub,
        actionText: "Releases",
        type: "github",
      },
    ],
  },
];

const Index = () => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "success" | "error">("idle");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  const filteredServices = DIRECTORY_SERVICES;

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) return;

    setContactSubmitting(true);
    setContactStatus("idle");

    try {
      const res = await fetch(siteEndpoints.contactApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send");
      }

      setContactStatus("success");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch {
      setContactStatus("error");
    } finally {
      setContactSubmitting(false);
    }
  };

  const getSymbolIcon = (type: MirrorLink["type"]) => {
    switch (type) {
      case "web":
        return <ExternalLink size={14} className="text-primary" />;
      case "download":
        return <Download size={14} className="text-primary" />;
      case "github":
        return <Terminal size={14} className="text-primary" />;
      case "terminal":
        return <Terminal size={14} className="text-primary" />;
      case "game":
        return <Gamepad2 size={14} className="text-primary" />;
      case "docs":
        return <FileText size={14} className="text-primary" />;
      default:
        return <ExternalLink size={14} className="text-primary" />;
    }
  };

  return (
    <div className="daunt-shell min-h-screen">
      <Navbar />

      <div className="flex justify-center overflow-hidden px-3 pt-3">
        <h1 className="sr-only">Aliasist</h1>
        <pre
          aria-hidden="true"
          className="select-none whitespace-pre text-center font-mono text-[clamp(5px,1.5vw,11px)] font-black leading-[1.12] tracking-[-0.01em] text-electric"
        >
{` █████╗ ██╗     ██╗ █████╗ ███████╗██╗███████╗████████╗
██╔══██╗██║     ██║██╔══██╗██╔════╝██║██╔════╝╚══██╔══╝
███████║██║     ██║███████║███████╗██║███████╗   ██║${" ".repeat(3)}
██╔══██║██║     ██║██╔══██║╚════██║██║╚════██║   ██║${" ".repeat(3)}
██║  ██║███████╗██║██║  ██║███████║██║███████║   ██║${" ".repeat(3)}
╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝   ╚═╝`}
        </pre>
      </div>

      <ErrorBoundary>
        <main id="main-content" className="daunt-container py-3" tabIndex={-1}>
          {/* Directory List & Controls matching Daunt */}
          <div id="directory" className="dir-list pt-2">

          {/* Items Stack matching Daunt screenshot */}
          <div className="items border-t border-zinc-200 dark:border-border">
            {filteredServices.map(service => {
              return (
                <div
                  key={service.id}
                  className="service-item-daunt"
                  data-category={service.categories.join(" ")}
                >
                  {/* Header Row */}
                  <div className="item-detail">
                    <div className="flex items-center gap-3.5">
                      {service.icon && (
                        <div className="circle-icon" title={service.categoryBadge}>
                          <img
                            src={service.icon}
                            alt=""
                            width={44}
                            height={44}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      )}

                      <div className="text-hold">
                        <div className="flex items-center gap-2">
                          <span className="service-name">{service.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mirror List — always visible, no collapse */}
                  <div className="mirror-list">
                      <p className="mirror-desc">{service.description}</p>

                      <div className="mirror-badges">
                        {service.tags.map(t => (
                          <span key={t} className="mirror-badge">
                            {t}
                          </span>
                        ))}
                      </div>

                      {service.architectureNotes && (
                        <div className="text-[11px] font-mono text-muted-foreground/80 mb-1">
                          {service.architectureNotes}
                        </div>
                      )}

                      <div className="space-y-1.5 mt-1">
                        {service.mirrors.map(m => (
                          <div key={m.url} className="mirror">
                            <div className="symbol" title={m.type}>
                              {getSymbolIcon(m.type)}
                            </div>

                            <a
                              href={m.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link"
                              title={m.url}
                            >
                              {m.label}
                            </a>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => copyToClipboard(m.url)}
                                title="Copy URL"
                                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {copiedLink === m.url ? (
                                  <Check size={12} className="text-primary" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>

                              <a
                                href={m.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`verify ${m.type === "github" ? "verify-secondary" : "verify-primary"}`}
                              >
                                <span>{m.actionText}</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
              );
            })}

            {filteredServices.length === 0 && (
              <div className="p-8 text-center border border-border rounded bg-card font-mono text-xs text-muted-foreground">
                No tools found in this category.
              </div>
            )}
          </div>
        </div>

        {/* Welcome to Aliasist*/}
        <section id="about" className="dir-section">
          <div className="dir-section-header">
            <h2>What it's about</h2>
            <p>This started as a personal project to track data centers being built and how much power they use. It turned into a growing set of tools.</p>
          </div>

          <div className="dir-card space-y-4">
            <p className="text-sm leading-relaxed text-foreground/90">
              Aliasist is my personal collection of free web tools and privacy apps. I'm Blake, a computer science student building things one project at a time.
            </p>

            <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
              <p className="font-semibold text-foreground">Everything here follows three simple rules:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-foreground/85">
                <li>
                  <strong className="text-foreground">Your files stay on your device:</strong> When you use PDFSist or ClearSist, everything happens right inside your web browser. Your photos and papers are never sent to my computer or anyone else's server.
                </li>
                <li>
                  <strong className="text-foreground">No tracking:</strong> No ads, no tracking cookies, and no collecting your personal info on this site. Ever. 
                </li>
                <li>
                  <strong className="text-foreground">Just useful tools:</strong> Each one has a clear job. PDFSist and ClearSist need no account. The live apps pull public data so you can explore.
                </li>
              </ul>
            </div>

            <p className="text-sm leading-relaxed text-foreground/90">
              Right now, I'm not making new apps. I'm focused on making these six tools work great and stay reliable with updates.
            </p>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs font-mono text-muted-foreground">
              <a
                href="mailto:dev@aliasist.tech"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <Mail size={12} />
                dev@aliasist.com
              </a>
            </div>
          </div>
        </section>

        {/* Contact me through email */}
        <section id="contact" className="dir-section">
          <div className="dir-section-header">
            <h2>Open Contact</h2>
            <p>Want to work together, give feedback, or just say hi?</p>
          </div>

          <div className="dir-card">
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="contact-name" className="block font-mono text-xs text-muted-foreground mb-1">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-1.5 font-mono text-xs border border-border bg-background rounded text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block font-mono text-xs text-muted-foreground mb-1">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-1.5 font-mono text-xs border border-border bg-background rounded text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-msg" className="block font-mono text-xs text-muted-foreground mb-1">
                  Message
                </label>
                <textarea
                  id="contact-msg"
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-3 py-1.5 font-mono text-xs border border-border bg-background rounded text-foreground outline-none focus:border-primary resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="standardBtn dir-filter active flex items-center gap-1.5 text-xs py-1.5 px-4 font-mono font-semibold"
                >
                  <Send size={12} />
                  <span>{contactSubmitting ? "Sending..." : "Send it"}</span>
                </button>

                <a
                  href="mailto:dev@aliasist.com"
                  className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                >
                  Or email me directly: dev@aliasist.com
                </a>
              </div>

              {contactStatus === "success" && (
                <div className="p-2 border border-primary/40 bg-primary/10 rounded font-mono text-xs text-primary flex items-center gap-2">
                  <Check size={14} />
                  <span>Got it! I'll get back to you soon.</span>
                </div>
              )}

              {contactStatus === "error" && (
                <div className="p-2 border border-destructive/40 bg-destructive/10 rounded font-mono text-xs text-destructive">
                  That didn't send. Shoot me an email directly at dev@aliasist.com instead.
                </div>
              )}
            </form>
          </div>
        </section>

        {/* ── Daunt 3-Column Footer ── */}
        <footer className="daunt-footer">
          <div className="centerWrap px-0">
            <a href="/" className="dreadLogo flex items-center gap-2.5 text-white no-underline">
              <img src={aliasistLogo} alt="Aliasist" className="w-8 h-8 object-contain rounded" />
              <div className="text font-bold text-xl tracking-tight">Aliasist</div>
            </a>
          </div>

          <div className="columns">
            <div className="item">
              <div className="heading">About</div>
              <div>
                <a href="mailto:dev@aliasist.com">dev@aliasist.com</a>
              </div>
              <div>
                <a href="https://github.com/aliasist" target="_blank" rel="noopener noreferrer">
                  GitHub Profile
                </a>
              </div>
            </div>

            <div className="item">
              <div className="heading">Network</div>
              <div>
                <a href="https://www.aliasist.tech" target="_blank" rel="noopener noreferrer">
                  Aliasist AI
                </a>
              </div>
              <div>
                <a href="https://www.aliasist.world" target="_blank" rel="noopener noreferrer">
                  Globalize
                </a>
              </div>
              <div>
                <a href="https://space.aliasist.com" target="_blank" rel="noopener noreferrer">
                  SpaceSist
                </a>
              </div>
              <div>
                <a href="https://clearasist.pages.dev" target="_blank" rel="noopener noreferrer">
                  ClearSist
                </a>
              </div>
              <div>
                <a href="https://pdf.aliasist.com" target="_blank" rel="noopener noreferrer">
                  PDFSist
                </a>
              </div>
              <div>
                <a
                  href={filesAbductorGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Files Abductor
                </a>
              </div>
            </div>
          </div>

          <div className="bottomLine">
            <div>Aliasist Project 2026 • Made with &lt;3 by Blake • Sharing is caring • No tracking cookies. I care about your security & privacy.</div>
            <div>
              <a href="#directory" className="hover:text-primary transition-colors">
                Back to top ↑
              </a>
            </div>
          </div>
        </footer>
      </main>
    </ErrorBoundary>

      <BuyMeACoffee />
    </div>
  );
};

export default Index;
