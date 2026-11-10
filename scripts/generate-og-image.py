#!/usr/bin/env python3
"""Generate Aliasist's centered 1200x630 social cards in light and dark themes."""

import base64
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"
LOGO_FILE = PUBLIC_DIR / "apple-touch-icon.png"


def image_data(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode("ascii") if path.exists() else ""


LOGO_B64 = image_data(LOGO_FILE)
ALIASIST_B64 = image_data(PUBLIC_DIR / "aliasist-logo.png")
GLOBALIZE_B64 = image_data(PUBLIC_DIR / "globalize-logo.png")
SPACESIST_B64 = image_data(PUBLIC_DIR / "spacesist-logo.png")
CLEARSIST_B64 = image_data(PUBLIC_DIR / "clearsist-logo.png")
PDFSIST_B64 = image_data(PUBLIC_DIR / "pdfsist-logo.png")


def render_og_svg(theme: str) -> str:
    palette = {
        "light": {
            "bg": "#f4f3ef",
            "ink": "#17191d",
            "muted": "#696d73",
            "quiet": "#858991",
            "line": "#deddd7",
            "panel": "#ffffff",
            "panel_head": "#f8f7f4",
            "accent": "#e24d3e",
            "green": "#14b85f",
        },
        "dark": {
            "bg": "#101216",
            "ink": "#f2f1ec",
            "muted": "#adb0b7",
            "quiet": "#777c85",
            "line": "#2a2d34",
            "panel": "#17191e",
            "panel_head": "#1d2026",
            "accent": "#ef6b5d",
            "green": "#25c773",
        },
    }[theme]

    services = [
        {"name": "Aliasist AI", "category": "AI", "initials": "A", "color": "#14b85f", "logo": ALIASIST_B64},
        {"name": "Globalize", "category": "LIVE DATA", "initials": "G", "color": "#2a6ebf", "logo": GLOBALIZE_B64},
        {"name": "SpaceSist", "category": "SPACE", "initials": "S", "color": "#4f46e5", "logo": SPACESIST_B64},
        {"name": "ClearSist", "category": "PRIVACY", "initials": "C", "color": "#0284c7", "logo": CLEARSIST_B64},
        {"name": "PDFSist", "category": "PDF TOOLS", "initials": "P", "color": "#e24d3e", "logo": PDFSIST_B64},
    ]

    rows = []
    for index, service in enumerate(services, start=1):
        cy = 326 + (index - 1) * 43
        if service.get("logo"):
            icon = f'''<clipPath id="serviceIcon{index}Clip"><circle cx="366" cy="{cy}" r="13" /></clipPath>
      <image href="data:image/png;base64,{service['logo']}" x="353" y="{cy - 13}" width="26" height="26" clip-path="url(#serviceIcon{index}Clip)" />'''
        else:
            font_size = 8 if len(service["initials"]) > 2 else 9
            icon = f'''<circle cx="366" cy="{cy}" r="13" fill="{service['color']}" />
      <text x="366" y="{cy + 3}" text-anchor="middle" font-size="{font_size}" font-weight="700" fill="#ffffff" letter-spacing="-.3">{service['initials']}</text>'''

        divider = "" if index == len(services) else f'<line x1="347" y1="{cy + 21}" x2="853" y2="{cy + 21}" stroke="{palette["line"]}" stroke-width="1" />'
        rows.append(f'''<g>
      {icon}
      <text x="392" y="{cy + 6}" class="service-name">{service['name']}</text>
      <text x="853" y="{cy + 4}" text-anchor="end" class="category">{service['category']}</text>
      {divider}
    </g>''')

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title description">
  <title id="title">Aliasist — Tools for data, privacy, and the web</title>
  <desc id="description">Aliasist and its projects: Aliasist AI, Globalize, SpaceSist, ClearSist, and PDFSist.</desc>
  <defs>
    <style>
      text {{ font-family: "DejaVu Sans", Arial, sans-serif; }}
      .mono {{ font-family: "DejaVu Sans Mono", monospace; }}
      .wordmark-offset {{ fill: {palette['accent']}; opacity: .32; }}
      .wordmark {{ fill: {palette['ink']}; }}
      .service-name {{ font-size: 16px; font-weight: 600; fill: {palette['ink']}; }}
      .category {{ font-family: "DejaVu Sans Mono", monospace; font-size: 8px; letter-spacing: 1px; fill: {palette['quiet']}; }}
    </style>
  </defs>

  <rect width="1200" height="630" fill="{palette['bg']}" />
  <rect width="1200" height="5" fill="{palette['green']}" />

  <!-- Centered brand mark and deliberately offset screen-print wordmark -->
  <image href="data:image/png;base64,{LOGO_B64}" x="577" y="34" width="46" height="46" />
  <text x="602" y="180" text-anchor="middle" class="wordmark-offset" font-size="78" font-weight="700" letter-spacing="7">ALIASIST</text>
  <text x="598" y="176" text-anchor="middle" class="wordmark" font-size="78" font-weight="700" letter-spacing="7">ALIASIST</text>
  <text x="600" y="214" text-anchor="middle" class="mono" font-size="10" letter-spacing="2" fill="{palette['muted']}">TOOLS · DASHBOARDS · EXPERIMENTS</text>

  <!-- Centered index of real projects -->
  <rect x="328" y="246" width="544" height="290" rx="7" fill="{palette['panel']}" stroke="{palette['line']}" stroke-width="1" />
  <path d="M335.5 246.5h529a7 7 0 0 1 7 7v39h-543v-39a7 7 0 0 1 7-7z" fill="{palette['panel_head']}" />
  <text x="348" y="273" class="mono" font-size="9" letter-spacing="1.5" fill="{palette['muted']}">THE ALIASIST SUITE</text>
  <text x="852" y="273" text-anchor="end" class="mono" font-size="9" letter-spacing="1" fill="{palette['quiet']}">01—05</text>
  <line x1="328" y1="293" x2="872" y2="293" stroke="{palette['line']}" stroke-width="1" />
  {''.join(rows)}

  <line x1="64" y1="565" x2="1136" y2="565" stroke="{palette['line']}" stroke-width="1" />
  <text x="600" y="596" text-anchor="middle" class="mono" font-size="11" letter-spacing="1.4" fill="{palette['muted']}">WWW.ALIASIST.COM</text>
</svg>'''


def main() -> None:
    if not LOGO_B64:
        raise SystemExit(f"Aliasist logo not found at {LOGO_FILE}")

    tmp_svg = Path("/tmp/aliasist-og.svg")
    outputs = {"light": PUBLIC_DIR / "og-image.png", "dark": PUBLIC_DIR / "og-image-dark.png"}
    for theme, output in outputs.items():
        tmp_svg.write_text(render_og_svg(theme), encoding="utf-8")
        subprocess.run(["rsvg-convert", "-w", "1200", "-h", "630", str(tmp_svg), "-o", str(output)], check=True)
        print(f"Generated {output}")


if __name__ == "__main__":
    main()
