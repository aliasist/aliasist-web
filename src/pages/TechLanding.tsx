import { motion } from "framer-motion";
import { ArrowRight, Code2, Database, Globe, Lock, Server, Terminal } from "lucide-react";

export default function TechLanding() {
  return (
    <div className="min-h-screen relative bg-background text-foreground overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-violet/5 via-transparent to-electric/5" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-sm border border-violet/20 bg-background/55 px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8"
          >
            Aliasist.tech
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-electric to-violet bg-clip-text text-transparent">
              ENGINEERING
            </span>
            <br />
            <span className="text-foreground">SYSTEMS</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            Data systems, browser tools, and backend-connected apps.
          </p>
          
          <a
            href="https://github.com/aliasist"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm bg-electric px-6 py-3 font-mono text-sm uppercase tracking-wider text-background hover:-translate-y-0.5 transition-transform"
          >
            View on GitHub
            <ArrowRight className="size-4" />
          </a>
        </motion.div>

        {/* Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Code2, title: "Frontend", desc: "Readable interfaces and responsive layouts" },
            { icon: Server, title: "Backend", desc: "APIs, routing, storage, and server logic" },
            { icon: Database, title: "Data", desc: "Research tables, imports, and dashboards" },
            { icon: Globe, title: "Deployments", desc: "Live sites, custom domains, and release checks" },
            { icon: Lock, title: "Access", desc: "Private routes, sign-in, and safer defaults" },
            { icon: Terminal, title: "CLI Tools", desc: "Scripts and desktop utility commands" },
          ].map((tech, i) => (
            <motion.div
              key={tech.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-sm border border-violet/10 bg-background/50 p-6 hover:border-violet/30 transition-colors"
            >
              <tech.icon className="size-8 text-electric mb-4" />
              <h3 className="text-lg font-semibold mb-2">{tech.title}</h3>
              <p className="text-sm text-muted-foreground">{tech.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold mb-8">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Globalize", desc: "Live 3D globe with global data signals", link: "https://www.aliasist.world" },
              { name: "DataSist", desc: "Data center research dashboard", link: "https://datasist-frontend.pages.dev" },
              { name: "PulseSist", desc: "Market signal dashboards", link: "https://pulse.aliasist.com" },
              { name: "SpaceSist", desc: "Live space portal", link: "https://space.aliasist.com" },
              { name: "EcoSist", desc: "Environmental observatory", link: "/ecosist/" },
              { name: "Clearasist", desc: "Privacy metadata cleaner", link: "https://clearasist.pages.dev" },
            ].map((project, i) => (
              <motion.a
                key={project.name}
                href={project.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="group rounded-sm border border-violet/10 bg-background/50 p-6 text-left hover:border-electric/50 hover:bg-background/80 transition-all"
              >
                <h3 className="text-lg font-semibold mb-2 group-hover:text-electric transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-muted-foreground">{project.desc}</p>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
