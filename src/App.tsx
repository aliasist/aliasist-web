import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import AgentDashboard from "./pages/AgentDashboard";
import GithubProjectGuide from "./pages/GithubProjectGuide";
import GithubPrReviewer from "./pages/GithubPrReviewer";
import GithubToolkit from "./pages/GithubToolkit";
import Consulting from "./pages/Consulting";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/tools/github" element={<GithubToolkit />} />
          <Route path="/tools/github/project-guide" element={<GithubProjectGuide />} />
          <Route path="/tools/github-pr-reviewer" element={<GithubPrReviewer />} />
          <Route path="/consulting" element={<Consulting />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
