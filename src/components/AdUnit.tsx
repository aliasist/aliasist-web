import { useEffect, useRef } from "react";

// To activate ads: go to adsense.google.com → Ads → By ad unit → Create ad unit
// Create two units (Display ad + In-feed ad), then replace the values below.
export const AD_SLOTS = {
  banner: "REPLACE_WITH_BANNER_SLOT_ID",
  inFeed: "REPLACE_WITH_IN_FEED_SLOT_ID",
} as const;

const PUB_ID = "ca-pub-7854258145125205";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export function AdUnit({ slot, format = "auto", className = "" }: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || slot.startsWith("REPLACE_")) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // script not loaded yet
    }
  }, [slot]);

  if (slot.startsWith("REPLACE_")) return null;

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block" }}
      data-ad-client={PUB_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
