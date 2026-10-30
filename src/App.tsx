import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ClickToComponent } from "click-to-react-component";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

const Entertainment = lazy(() => import("./pages/Entertainment"));
const Sensor = lazy(() => import("./pages/Sensor"));
const TechLanding = lazy(() => import("./pages/TechLanding"));
const BlogCosmicOs = lazy(() => import("./pages/BlogCosmicOs"));

const queryClient = new QueryClient();

// spawnOS is a static page in public/os/, outside the React app. In-app links to
// /os would otherwise render NotFound, so leave the router with a full page load.
const SpawnOs = () => {
  useEffect(() => window.location.replace("/os/"), []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {import.meta.env.DEV && <ClickToComponent />}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<main className="flex min-h-screen items-center justify-center" role="status">Loading page…</main>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tech" element={<TechLanding />} />
              <Route path="/agsc" element={<Navigate to="/tech" replace />} />
              <Route path="/agsc/*" element={<Navigate to="/tech" replace />} />
              <Route path="/sensor" element={<Sensor />} />
              <Route path="/entertainment" element={<Entertainment />} />
              <Route path="/os" element={<SpawnOs />} />
              <Route path="/apps" element={<SpawnOs />} />
              <Route path="/blog" element={<BlogCosmicOs />} />
              <Route path="/blog/cosmic-os" element={<BlogCosmicOs />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
