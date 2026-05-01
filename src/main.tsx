import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/lib/clerk";
import { ClerkSignInModalRoot } from "@/components/ClerkSignInModalRoot";
import { initBrowserObservability } from "@/lib/observability";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ClerkSignInModalRoot>
      <App />
    </ClerkSignInModalRoot>
  </AuthProvider>,
);

void initBrowserObservability();
