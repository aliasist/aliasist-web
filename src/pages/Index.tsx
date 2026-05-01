import { lazy, Suspense, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Starfield from "@/components/Starfield";
import ScrollProgress from "@/components/ScrollProgress";
import SectionRail from "@/components/SectionRail";
import AliasistChat from "@/components/AliasistChat";
import AISplashScreen from "@/components/AISplashScreen";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const ProjectsSection = lazy(() => import("@/components/ProjectsSection"));
const TransmissionsSection = lazy(() => import("@/components/TransmissionsSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));

function SectionFallback() {
  return <div className="min-h-[24vh] w-full" aria-hidden />;
}

// Show the splash screen once per browser session
function shouldShowSplash(): boolean {
  try {
    if (sessionStorage.getItem("aliasist-splash-shown")) return false;
    sessionStorage.setItem("aliasist-splash-shown", "1");
    return true;
  } catch {
    return false;
  }
}

const Index = () => {
  const [showSplash, setShowSplash] = useState(shouldShowSplash);

  // Prevent background scroll while splash is up
  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showSplash]);

  return (
    <div className="min-h-screen relative">
      {showSplash && (
        <AISplashScreen onDismiss={() => setShowSplash(false)} />
      )}
      <Starfield />
      <ScrollProgress />
      <SectionRail />
      <Navbar />
      <main id="main-content" className="relative z-10" tabIndex={-1}>
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <AboutSection />
          <ProjectsSection />
          <TransmissionsSection />
          <ContactSection />
          <Footer />
        </Suspense>
      </main>
      <AliasistChat />
    </div>
  );
};

export default Index;
