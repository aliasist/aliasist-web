import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/lib/clerk";
import { initBrowserObservability } from "@/lib/observability";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);

void initBrowserObservability();
