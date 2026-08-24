// The official JS widget (button.prod.min.js) calls document.write()
// internally, which browsers block when a script is injected dynamically
// after page load ("Failed to execute 'write' on 'Document'") — confirmed
// via headless-browser console capture, the button silently never rendered.
// Using the static image-button link instead avoids that entirely.
export default function BuyMeACoffee() {
  return (
    <a
      href="https://www.buymeacoffee.com/aliasist"
      target="_blank"
      rel="noopener noreferrer"
      // AliasistChat already floats bottom-right (fixed bottom-6 right-6,
      // z-[210]) — bottom-left keeps this visible without stacking on it.
      className="fixed z-[200] bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] sm:bottom-6 sm:left-6 shadow-lg rounded-lg transition-transform hover:scale-105"
    >
      <img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
        alt="Buy me a coffee"
        className="h-[50px] w-[178px]"
        width={178}
        height={50}
      />
    </a>
  );
}
