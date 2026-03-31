import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import "./index.css";

// Production Clerk key — also set VITE_CLERK_PUBLISHABLE_KEY in Cloudflare env vars
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string ?? "pk_live_Y2xlcmsuYWxpYXNpc3QuY29tJA";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY ?? ""} afterSignOutUrl="/">
    <App />
  </ClerkProvider>
);
