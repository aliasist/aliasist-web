import { useEffect } from "react";

const SCRIPT_SRC = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
const SCRIPT_ID = "bmc-widget-script";

const ATTRS: Record<string, string> = {
  "data-name": "bmc-button",
  "data-slug": "aliasist",
  "data-color": "#a3ff66",
  "data-emoji": "☕",
  "data-font": "Bree",
  "data-text": "Buy me a coffee",
  "data-outline-color": "#000000",
  "data-font-color": "#000000",
  "data-coffee-color": "#FFDD00",
};

// The widget's own script injects a floating button into the page once it
// loads, so this component just needs to mount that script tag once.
export default function BuyMeACoffee() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "text/javascript";
    script.src = SCRIPT_SRC;
    for (const [key, value] of Object.entries(ATTRS)) {
      script.setAttribute(key, value);
    }
    document.body.appendChild(script);
  }, []);

  return null;
}
