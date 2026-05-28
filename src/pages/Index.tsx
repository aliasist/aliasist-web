import { lazy, Suspense, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Starfield from "@/components/Starfield";
import BackgroundRotator from "@/components/BackgroundRotator";
import ScrollProgress from "@/components/ScrollProgress";
import SectionRail from "@/components/SectionRail";
import AliasistChat from "@/components/AliasistChat";
import AISplashScreen from "@/components/AISplashScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AdUnit, AD_SLOTS } from "@/components/AdUnit";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const ProjectsSection = lazy(() => import("@/components/ProjectsSection"));
const TransmissionsSection = lazy(() => import("@/components/TransmissionsSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));

function SectionFallback() {
  return <div className="min-h-[24vh] w-full" aria-hidden />;
}


const INTRO_SEEN_KEY = "aliasist-intro-seen";

const Index = () => {
  // Only show intro splash if not seen before
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return true;
    if (localStorage.getItem(INTRO_SEEN_KEY)) return false;
    if (new URLSearchParams(window.location.search).get("beamed") === "1") {
      localStorage.setItem(INTRO_SEEN_KEY, "1");
      return false;
    }
    return true;
  });

  // Prevent background scroll while splash is up
  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showSplash]);

  // When splash is dismissed, mark intro as seen
  const handleSplashDismiss = () => {
    localStorage.setItem(INTRO_SEEN_KEY, "1");
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen relative">
      {showSplash && (
        <AISplashScreen onDismiss={handleSplashDismiss} />
      )}
      <BackgroundRotator />
      <Starfield />
      <ScrollProgress />
      <SectionRail />
      <Navbar />
      <main id="main-content" className="relative z-10" tabIndex={-1}>
        <HeroSection />
        <ErrorBoundary><Suspense fallback={<SectionFallback />}><AboutSection /></Suspense></ErrorBoundary>
        <div className="mx-auto w-full max-w-site px-4 sm:px-8 lg:px-12 xl:px-16 py-2">
          <AdUnit slot={AD_SLOTS.banner} format="auto" />
        </div>
        <ErrorBoundary><Suspense fallback={<SectionFallback />}><ProjectsSection /></Suspense></ErrorBoundary>
        <ErrorBoundary><Suspense fallback={<SectionFallback />}><TransmissionsSection /></Suspense></ErrorBoundary>
        <div className="mx-auto w-full max-w-site px-4 sm:px-8 lg:px-12 xl:px-16 py-2">
          <AdUnit slot={AD_SLOTS.banner} format="auto" />
        </div>
        <ErrorBoundary><Suspense fallback={<SectionFallback />}><ContactSection /></Suspense></ErrorBoundary>
        <ErrorBoundary><Suspense fallback={<SectionFallback />}><Footer /></Suspense></ErrorBoundary>
      </main>
      <AliasistChat />
    </div>
  );
};

export default Index;
