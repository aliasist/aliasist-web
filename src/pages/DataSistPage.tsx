import { useEffect } from "react";

const DATASIST_URL = "https://datasist-frontend.pages.dev";

const DataSistPage = () => {
  useEffect(() => {
    window.location.href = DATASIST_URL;
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="relative h-10 w-10 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-t-electric animate-spin" />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground">
          Launching DataSist…
        </p>
      </div>
    </div>
  );
};

export default DataSistPage;
