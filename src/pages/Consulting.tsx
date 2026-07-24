import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import BackgroundRotator from "@/components/BackgroundRotator";
import Starfield from "@/components/Starfield";

const services = [
  {
    title: "Find the useful part",
    body: "We look at how you work now and pick one place AI can actually help.",
  },
  {
    title: "Build a first version",
    body: "A small tool, chatbot, dashboard, or workflow you can try for real.",
  },
  {
    title: "Keep it simple",
    body: "No giant platform pitch. We keep what works and improve it from there.",
  },
] as const;

const goodFit = [
  "Chat over your own docs",
  "Internal tools",
  "Workflow automation",
  "Website or app AI features",
  "Dashboards and reports",
] as const;

const Consulting = () => (
  <div className="relative min-h-screen overflow-x-hidden">
    <BackgroundRotator />
    <Starfield />

    <main className="relative z-10 mx-auto w-full max-w-site px-4 pb-20 pt-6 sm:px-8 lg:px-12 xl:px-16">
      <header className="flex min-h-[72px] flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-electric"
        >
          Aliasist
        </Link>
        <a
          href="mailto:aliasist@proton.me?subject=AI consulting"
          className="inline-flex items-center gap-2 border border-border/60 bg-background/45 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground backdrop-blur-md transition-colors hover:border-electric/40 hover:text-electric"
        >
          Contact
          <ArrowRight className="size-4" />
        </a>
      </header>

      <section className="grid gap-10 py-10 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <div className="section-divider mb-8">
            <span>AI Consulting</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Practical AI help for small teams.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            I help people figure out where AI actually makes sense, then build the tool or workflow.
          </p>
        </div>

        <div className="border border-border/60 bg-card/70 p-5 backdrop-blur-xl sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-electric">
            Start here
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Bring the messy process, the repeated task, or the idea you keep thinking about. We will turn it into a clear first build.
          </p>
          <a
            href="mailto:aliasist@proton.me?subject=AI consulting"
            className="mt-6 inline-flex items-center gap-2 bg-electric px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-background shadow-electric-sm transition-colors hover:bg-electric/90"
          >
            Start a conversation
            <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <section aria-labelledby="consulting-services">
        <div className="section-divider mb-6">
          <span>What I can help with</span>
        </div>
        <h2 id="consulting-services" className="sr-only">
          AI consulting services
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <article key={service.title} className="border border-border/55 bg-card/65 p-5 backdrop-blur-xl sm:p-6">
              <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.7fr_1fr] lg:items-start">
        <div>
          <div className="section-divider mb-6">
            <span>Good fit</span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            This is for practical builds, not buzzword consulting.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {goodFit.map((item) => (
            <div key={item} className="flex items-center gap-3 border border-border/45 bg-background/40 px-4 py-3 backdrop-blur-md">
              <CheckCircle2 className="size-4 shrink-0 text-electric" />
              <span className="text-sm text-foreground/85">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  </div>
);

export default Consulting;
