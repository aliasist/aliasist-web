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

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
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
