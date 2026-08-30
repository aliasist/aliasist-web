# Candidate APIs & reference projects (research notes, not yet built)

Captured 2026-08-29. These are candidates surfaced during research, not committed integrations. Nothing here has been implemented — treat as a shortlist to evaluate before building.

## API candidates by Sist

| Area | API | Auth | Notes |
|---|---|---|---|
| DataSist | [EIA Open Data API v2](https://www.eia.gov/opendata/) | Free API key | US electricity/fuel mix, demand, prices |
| DataSist / EcoSist | [Electricity Maps API](https://www.electricitymaps.com/) | API key (apply for access) | Real-time + forecast carbon intensity, renewable share, grid load, many regions |
| PulseSist | [SEC EDGAR (data.sec.gov)](https://www.sec.gov/edgar/sec-api-documentation) | None required | Submission history, XBRL financial facts from 10-K/10-Q/8-K |
| Security module | [NVD CVE API 2.0](https://services.nvd.nist.gov/rest/json/cves/2.0) | API key recommended (rate limits) | CVE/CVSS/CWE data |
| Security module | [CISA KEV Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) | None | JSON/CSV feed of actively exploited CVEs — good prioritization signal on top of NVD |
| Security module | [AbuseIPDB](https://www.abuseipdb.com/) | API key, free tier limited | IP reputation lookups — add only after CVE/KEV, rate-limit carefully, don't expose as open bulk lookup |
| Research/RAG | [arXiv API](https://arxiv.org/help/api) | None | Atom-format preprints |
| Research/RAG | [OpenAlex API](https://openalex.org/) | None (polite pool w/ email) | Works/authors/institutions/citations graph |
| SpaceSist | [NASA Open APIs](https://api.nasa.gov/) | Free API key | APOD, EPIC, NEO, Mars rover, etc. |

**Architecture pattern to follow**: never call keyed/paid APIs from client code. Route everything through Worker adapter endpoints (`services/workers-api/src/providers/*`), normalize responses, cache in KV/D1 with a TTL appropriate to how fast the data changes (real-time grid data: minutes; filings: hours; research metadata: days), and validate both inbound params and upstream responses with Zod.

## Trending projects worth studying (not adopting wholesale)

| Project | License | Why relevant |
|---|---|---|
| koala73/worldmonitor | AGPL-3.0 | Real-time intelligence dashboard UX pattern — study architecture only, AGPL blocks copying code into a differently-licensed module |
| semantica-agi/semantica | MIT | Graph-native context/provenance/GraphRAG — most relevant to improving RAG beyond flat vector search |
| QwenLM/qwen-code | Apache-2.0 | Terminal coding agent w/ MCP — reference for a possible contributor/dev agent |
| Galeax/CVE2CAPEC | GPL-3.0 | Maps CVE → CWE/CAPEC → ATT&CK/D3FEND — good model for a "CVE → attack technique" explainer; GPL means derive-your-own, don't embed code |
| openai/codex-security | Apache-2.0 | TS SDK/CLI for app vuln detection — worth a CI proof-of-concept eval |

**License filter before adopting anything**: MIT/Apache-2.0 are safe to build on; AGPL/GPL require care (network-copyleft for AGPL specifically). Check maintainer activity and dependency health before pulling any code in, regardless of star count.

## Status
Nothing in this doc has been scoped into an actual sprint yet. Next step if picking this up: choose one vertical slice (e.g. EIA/Electricity Maps → DataSist grid card, or NVD/KEV → security CVE page) and build the adapter route + normalized schema end-to-end before adding more providers.
