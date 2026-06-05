# Apps Workspace

This directory contains the user-facing applications and supporting backend projects for the Aliasist suite.

## Primary User-Facing Apps

| App          | Folder                  | Local Command              | Description |
|--------------|-------------------------|----------------------------|-------------|
| Aliasist Auth | `apps/aliasist-auth`   | `npm run app:auth`        | Authentication surfaces |
| DataSist     | `apps/datasist`        | `npm run app:datasist`    | Data center intelligence |
| EcoSist      | `apps/ecosist`         | `npm run app:ecosist`     | Environmental intelligence |
| PulseSist    | `apps/pulsesist`       | `npm run app:pulsesist`   | Market signals |
| SpaceSist    | `apps/spacesist`       | `npm run app:spacesist`   | Orbital mission tools |

## Backend & Support Projects

| Project                  | Folder                         | Purpose |
|--------------------------|--------------------------------|---------|
| DataSist API             | `apps/datasist-api`            | Cloudflare Worker API |
| LLM Chat                 | `apps/llm-chat`                | AI chat / orchestration worker |
| News Worker              | `apps/news-worker`             | News aggregation |
| Phoenix Image Worker     | `apps/phoenix-image-worker`    | Image generation worker |
| Chatroom                 | `apps/chatroom`                | Real-time chat |

## Other / Experimental

- `apps/musician_ideas` — Mobile app experiments (Flutter)
- `apps/clearasist` — Privacy-focused metadata stripping tool (fully local, client-side only)
- `apps/clearasist-admin` & `apps/master-admin` — Internal admin tooling

## Local Development

Use the root shortcuts for convenience:

```bash
npm run app:datasist
npm run app:pulsesist
# etc.
```

For Cloudflare-style local preview on supported apps:

```bash
npm run app:datasist:cf
```

## Important Notes

- Most apps use their own `.env` / `.dev.vars` files.
- The Clearasist tool performs **all processing locally in the browser**. No user data is ever sent to or stored by Aliasist.
- Some folders may be symlinked or managed as separate concerns within the monorepo.

See individual app READMEs for specific setup instructions.
