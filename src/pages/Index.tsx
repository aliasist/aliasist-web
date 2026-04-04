import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import TransmissionsSection from "@/components/TransmissionsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import Starfield from "@/components/Starfield";
import ScrollProgress from "@/components/ScrollProgress";
import AliasistChat from "@/components/AliasistChat";
import AISplashScreen from "@/components/AISplashScreen";

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
    <div className="min-h-screen bg-background relative">
      {showSplash && (
        <AISplashScreen onDismiss={() => setShowSplash(false)} />
      )}
      <Starfield />
      <ScrollProgress />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <TransmissionsSection />
        <ContactSection />
        <Footer />
      </main>
      <AliasistChat />
    </div>
  );
};

export default Index;
