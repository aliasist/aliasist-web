// The official JS widget (button.prod.min.js) calls document.write()
// internally, which browsers block when a script is injected dynamically
// after page load ("Failed to execute 'write' on 'Document'") — confirmed
// via headless-browser console capture, the button silently never rendered.
// Using the static image-button link instead avoids that entirely.
//
// The stock yellow button clashed with the homepage's dark palette, so this
// uses BMC's button-api (server-rendered image, same document.write-free
// approach) with colors pulled from the site's own CSS variables instead of
// the default preset: --primary/--electric (teal) for the fill, and
// --primary-foreground (the same near-black used for text on that teal
// elsewhere on the site) for the text/icon.
const BMC_BUTTON_URL =
  "https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&slug=aliasist&button_colour=0BCB9B&font_colour=0F1115&coffee_colour=0F1115&outline_colour=0BCB9B";

export default function BuyMeACoffee() {
  return (
    <a
      href="https://www.buymeacoffee.com/aliasist"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-[200] bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-6 sm:right-6 shadow-lg rounded-lg transition-transform hover:scale-105"
    >
      <img
        src={BMC_BUTTON_URL}
        alt="Buy me a coffee"
        className="h-[50px] w-[178px]"
        width={178}
        height={50}
      />
    </a>
  );
}
