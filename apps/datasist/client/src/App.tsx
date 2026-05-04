import { useState, useEffect } from "react";
import { useAuth } from "@clerk/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { hasClerkKey } from "@/lib/clerk";
import { isDatasistAdmin } from "@/lib/adminAccess";
import { DatasistClerkApiBridge } from "@/lib/DatasistClerkApiBridge";
import { Toaster } from "@/components/ui/toaster";
import MapView from "./pages/MapView";
import DashboardView from "./pages/DashboardView";
import AdminPanel from "./pages/AdminPanel";
import Header from "./components/Header";
import Marquee from "./components/Marquee";
import SplashScreen from "./components/SplashScreen";

export type ActiveView = "map" | "dashboard" | "admin";

function AdminViewGuard({
  activeView,
  setActiveView,
}: {
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
}) {
  useEffect(() => {
    if (!hasClerkKey && activeView === "admin") setActiveView("map");
  }, [activeView, setActiveView]);

  if (!hasClerkKey) return null;
  return <AdminViewGuardClerk activeView={activeView} setActiveView={setActiveView} />;
}

function AdminViewGuardClerk({
  activeView,
  setActiveView,
}: {
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
}) {
  const { userId } = useAuth();
  const canAdmin = isDatasistAdmin(userId ?? undefined);

  useEffect(() => {
    if (activeView === "admin" && !canAdmin) setActiveView("map");
  }, [activeView, canAdmin, setActiveView]);

  return null;
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>("map");
  const [splashDone, setSplashDone] = useState<boolean>(
    () => typeof window !== "undefined" && !!sessionStorage.getItem("datasist-splash-shown")
  );

  const handleSplashDone = () => {
    sessionStorage.setItem("datasist-splash-shown", "1");
    setSplashDone(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DatasistClerkApiBridge />
      <AdminViewGuard activeView={activeView} setActiveView={setActiveView} />
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <div className="datasist-shell flex flex-col h-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>
        <div className="scanline-overlay" />
        <Header activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-hidden relative">
          {activeView === "map" && <MapView />}
          {activeView === "dashboard" && <DashboardView />}
          {activeView === "admin" && <AdminPanel />}
        </main>
        <Marquee />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
