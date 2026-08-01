import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ScrollProgress from "@/components/ScrollProgress";
import AliasistChat from "@/components/AliasistChat";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AdUnit, AD_SLOTS } from "@/components/AdUnit";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const ProjectsSection = lazy(() => import("@/components/ProjectsSection"));
const UpdatesSection = lazy(() => import("@/components/UpdatesSection"));
const TransmissionsSection = lazy(() => import("@/components/TransmissionsSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const SubscribeSection = lazy(() => import("@/components/SubscribeSection"));
const Footer = lazy(() => import("@/components/Footer"));

function SectionFallback() {
  return <div className="min-h-[24vh] w-full" aria-hidden />;
}


const Index = () => {
  return (
    <div className="min-h-screen relative">
      <ScrollProgress />
      <Navbar />
      <main id="main-content" className="relative z-10" tabIndex={-1}>
        <div
          className="relative grid-bg [mask-image:linear-gradient(to_bottom,black_0%,black_calc(100%-9rem),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_calc(100%-9rem),transparent_100%)]"
        >
          {/* Continue the color blend into Contact's dark panel after the lattice itself has faded out. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 bg-gradient-to-b from-transparent to-foreground" aria-hidden />

          <HeroSection />
          <ErrorBoundary><Suspense fallback={<SectionFallback />}><AboutSection /></Suspense></ErrorBoundary>

          <div className="mx-auto w-full max-w-site px-4 sm:px-8 lg:px-12 xl:px-16 py-2">
            <AdUnit slot={AD_SLOTS.banner} format="auto" />
          </div>
          <ErrorBoundary><Suspense fallback={<SectionFallback />}><UpdatesSection /></Suspense></ErrorBoundary>
          <ErrorBoundary><Suspense fallback={<SectionFallback />}><ProjectsSection /></Suspense></ErrorBoundary>
          <ErrorBoundary><Suspense fallback={<SectionFallback />}><TransmissionsSection /></Suspense></ErrorBoundary>
          <div className="mx-auto w-full max-w-site px-4 sm:px-8 lg:px-12 xl:px-16 py-2">
            <AdUnit slot={AD_SLOTS.banner} format="auto" />
          </div>
        </div>
        <div className="relative">
          {/* Bridges the seam between the lattice fade and Contact's own top overlay. */}
          <div className="pointer-events-none absolute inset-x-0 -top-36 z-10 h-36 bg-gradient-to-b from-transparent to-foreground" aria-hidden />
          <ErrorBoundary><Suspense fallback={<SectionFallback />}><ContactSection /></Suspense></ErrorBoundary>
          <ErrorBoundary><Suspense fallback={<SectionFallback />}><SubscribeSection /></Suspense></ErrorBoundary>
        </div>
        <ErrorBoundary><Suspense fallback={<SectionFallback />}><Footer /></Suspense></ErrorBoundary>
      </main>
      <AliasistChat />
    </div>
  );
};

export default Index;
