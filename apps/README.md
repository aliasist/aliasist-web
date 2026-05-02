# Apps Workspace

This repo contains both user-facing apps and backend/support projects.

## User-facing apps

These are the main products you will most likely edit and prepare for GitHub:

| App | Folder | Run locally |
|---|---|---|
| Aliasist Auth | `apps/aliasist-auth` | `npm run app:auth` |
| DataSist frontend | `apps/datasist` | `npm run app:datasist` |
| EcoSist | `apps/ecosist` | `npm run app:ecosist` |
| PulseSist | `apps/pulsesist` | `npm run app:pulsesist` |
| SpaceSist | `apps/spacesist` | `npm run app:spacesist` |

## Backend / worker / support projects

These support the suite but are not the primary end-user apps:

| Project | Folder | Purpose |
|---|---|---|
| DataSist API | `apps/datasist-api` | Worker API for DataSist |
| News Worker | `apps/news-worker` | News aggregation worker |
| Phoenix Image Worker | `apps/phoenix-image-worker` | Text-to-image worker |
| LLM Chat | `apps/llm-chat` | AI chat worker |
| Chatroom | `apps/chatroom` | Real-time chat worker/app |

## Not part of the active suite app lineup

| Project | Folder | Notes |
|---|---|---|
| SWOT | `apps/swot` | External JetBrains repo, not an Aliasist suite app |
| Musician Ideas | `apps/musician_ideas` | Side project / mobile app scaffold |

## Notes

- Some app folders are separate git repos/submodules.
- Cloudflare-based apps may require `.dev.vars` or `.env` files inside their own app folders.
- The root repo shortcuts are intended to make local startup easier without remembering every app's custom command.
- `DataSist` now has two local paths:
  - `npm run app:datasist` for fast frontend editing with Vite
  - `npm run app:datasist:cf` for Cloudflare Pages-style preview
