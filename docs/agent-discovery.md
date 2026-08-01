# Agent discovery (DNS‑AID & fallbacks)

Short: SVCB/HTTPS (DNS-AID) is ideal but requires DNS provider support. Cloudflare's GUI for HTTPS/SVCB records (and some RFC features) is gated; if you don't have access, use the fallbacks below.

## Preferred (SVCB / HTTPS records)
- Add HTTPS/SVCB records at DNS for `_index._agents`, `_a2a._agents`, `_mcp._agents` pointing to a discovery host.
- Example parameters: alpn="h2,h3", port=443, path="/.well-known/ai-discovery", ma=86400

## Fallback A — host a .well-known JSON endpoint (recommended)
1. Serve `https://aliasist.com/.well-known/ai-discovery` (JSON) with discovery metadata.
2. Add HTTP Link headers on `/` pointing to `/ .well-known/ai-discovery` (already added in public/_headers).
3. Agents fetch that URL directly.

### Sample discovery JSON (public/.well-known/ai-discovery.json)
{
  "name": "Aliasist agent discovery",
  "version": "1.0",
  "endpoints": {
    "api-catalog": "https://aliasist.com/.well-known/api-catalog.json",
    "docs": "https://aliasist.com/docs/"
  }
}

## Fallback B — DNS TXT pointer record
- Create a TXT at `_agents.aliasist.com` with a short pointer: `discovery=https://aliasist.com/.well-known/ai-discovery`
- Simple and widely supported; agents must be written to check this convention.

## Verification
- HTTP check: `curl -i https://aliasist.com/.well-known/ai-discovery`
- DNS check for SVCB (if supported): `dig @1.1.1.1 -t HTTPS _index._agents.aliasist.com +short`
- TXT check: `dig @1.1.1.1 -t TXT _agents.aliasist.com +short`

## Notes
- SVCB/HTTPS is the future (better UX for agents) but not required.
- This repo already hosts `public/sitemap.xml`, `public/robots.txt`, and `public/_headers` to help agent discovery.

If desired, I can add more fields to the ai-discovery JSON, or create a short API-catalog JSON that lists public APIs.
