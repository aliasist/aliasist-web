#!/usr/bin/env python3
"""
Generate the simplistic 1200x630 OpenGraph and Twitter card image
matching the Aliasist direct link directory design.
"""
import os
import sys
import base64
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "public"
LOGO_FILE = PUBLIC_DIR / "apple-touch-icon.png"

if not LOGO_FILE.exists():
    sys.exit(f"Logo not found at {LOGO_FILE}")

with open(LOGO_FILE, "rb") as f:
    logo_b64 = base64.b64encode(f.read()).decode("ascii")

def render_og_svg(theme="light") -> str:
    is_light = (theme == "light")
    
    bg_page = "#ffffff" if is_light else "#0e1015"
    text_sub = "#8a8f98" if is_light else "#8e929b"
    text_muted = "#9ca3af" if is_light else "#6b7280"
    border_color = "#e5e7eb" if is_light else "#1e222b"
    divider_color = "#f0f2f5" if is_light else "#171a22"
    caret_color = "#555555" if is_light else "#717682"
    footer_bg = "#fbfbfc" if is_light else "#0a0c10"
    outer_border = "#e2e4e9" if is_light else "#262b36"
    
    services = [
        {"monogram": "AI", "bg": "#18181b", "name": "Aliasist AI", "count": "1 links"},
        {"monogram": "GL", "bg": "#0d9488", "name": "Globalize", "count": "2 links"},
        {"monogram": "SS", "bg": "#4f46e5", "name": "SpaceSist", "count": "2 links"},
        {"monogram": "CS", "bg": "#0284c7", "name": "ClearSist", "count": "2 links"},
        {"monogram": "PDF", "bg": "#e24d3e", "name": "PDFSist", "count": "2 links"},
    ]
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&amp;display=swap');
      text {{
        font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }}
    </style>
  </defs>

  <!-- Canvas Background -->
  <rect width="1200" height="630" fill="{bg_page}" />

  <!-- Top Navigation Bar (Daunt Dark Header) -->
  <rect x="0" y="0" width="1200" height="62" fill="#15171c" />
  <line x1="0" y1="62" x2="1200" y2="62" stroke="#000000" stroke-width="1" />

  <!-- Brand Logo & Name -->
  <g transform="translate(36, 13)">
    <clipPath id="logoClip{theme}">
      <rect x="0" y="0" width="36" height="36" rx="7" />
    </clipPath>
    <image href="data:image/png;base64,{logo_b64}" x="0" y="0" width="36" height="36" clip-path="url(#logoClip{theme})" />
    <text x="46" y="26" font-size="22" font-weight="700" fill="#ffffff" letter-spacing="-0.5">aliasist</text>
  </g>

  <!-- Nav divider & links -->
  <line x1="184" y1="21" x2="184" y2="41" stroke="#2c313d" stroke-width="1" />
  
  <text x="206" y="36" font-size="14" font-weight="500" fill="#ffffff">directory</text>
  <text x="286" y="36" font-size="14" font-weight="400" fill="#8e929b">about</text>
  <text x="348" y="36" font-size="14" font-weight="400" fill="#8e929b">contact</text>

  <!-- Login right -->
  <text x="1164" y="36" font-size="14" font-weight="500" fill="#8e929b" text-anchor="end">Login</text>

  <!-- Category Filter Bar -->
  <g transform="translate(36, 82)">
    <!-- ALL active pill -->
    <rect x="0" y="0" width="72" height="34" rx="2" fill="#e24d3e" />
    <text x="36" y="22" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">ALL</text>

    <!-- Category text tabs -->
    <text x="104" y="22" font-size="13" font-weight="700" fill="#e24d3e" letter-spacing="0.5">WEB APPS</text>
    <text x="208" y="22" font-size="13" font-weight="700" fill="#e24d3e" letter-spacing="0.5">TOOLS</text>
    <text x="284" y="22" font-size="13" font-weight="700" fill="#e24d3e" letter-spacing="0.5">EXPERIMENTS</text>
  </g>

  <!-- Directory Top Divider -->
  <line x1="36" y1="130" x2="1164" y2="130" stroke="{border_color}" stroke-width="1" />
"""
    
    # 5 service rows
    y_start = 130
    row_height = 76
    
    for i, s in enumerate(services):
        item_y = y_start + i * row_height
        divider_y = item_y + row_height
        
        svg += f"""
  <!-- Row {i+1}: {s['name']} -->
  <g transform="translate(36, {item_y})">
    <!-- Circle Icon -->
    <circle cx="21" cy="38" r="20" fill="{s['bg']}" />
    <text x="21" y="44" font-size="{12 if len(s['monogram']) > 2 else 14}" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="-0.3">{s['monogram']}</text>
    
    <!-- Title & Subtitle -->
    <text x="56" y="33" font-size="19" font-weight="600" fill="#e24d3e">{s['name']}</text>
    <text x="56" y="52" font-size="13" font-weight="400" fill="{text_sub}">{s['count']}</text>

    <!-- Caret triangle matching Daunt screenshot -->
    <polygon points="1120,33 1134,33 1127,41" fill="{caret_color}" />
  </g>
"""
        if i < len(services) - 1:
            svg += f"""  <line x1="36" y1="{divider_y}" x2="1164" y2="{divider_y}" stroke="{divider_color}" stroke-width="1" />\n"""

    # Bottom bar
    svg += f"""
  <!-- Bottom info bar -->
  <rect x="0" y="556" width="1200" height="74" fill="{footer_bg}" />
  <line x1="0" y1="556" x2="1200" y2="556" stroke="{border_color}" stroke-width="1" />

  <text x="36" y="599" font-size="14" font-weight="600" fill="{text_sub}">aliasist.com</text>
  <text x="600" y="599" font-size="13" font-weight="400" fill="{text_muted}" text-anchor="middle">Free web tools and privacy apps built by Blake</text>
  <text x="1164" y="599" font-size="13" font-weight="500" fill="{text_sub}" text-anchor="end">No ads • No tracking • Stays on your device</text>

  <!-- 1px Subtle Outer Card Border -->
  <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="{outer_border}" stroke-width="1" />
</svg>"""
    return svg

def main():
    tmp_svg = Path("/tmp/aliasist_og.svg")
    target_png = PUBLIC_DIR / "og-image.png"
    target_dark_png = PUBLIC_DIR / "og-image-dark.png"
    
    # 1. Light (exact Daunt directory replica)
    svg_light = render_og_svg("light")
    tmp_svg.write_text(svg_light, encoding="utf-8")
    subprocess.run(["rsvg-convert", "-w", "1200", "-h", "630", str(tmp_svg), "-o", str(target_png)], check=True)
    print(f"Generated {target_png}")
    
    # 2. Dark
    svg_dark = render_og_svg("dark")
    tmp_svg.write_text(svg_dark, encoding="utf-8")
    subprocess.run(["rsvg-convert", "-w", "1200", "-h", "630", str(tmp_svg), "-o", str(target_dark_png)], check=True)
    print(f"Generated {target_dark_png}")

if __name__ == "__main__":
    main()
