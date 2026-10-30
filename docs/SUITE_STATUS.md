# The Aliasist suite: where everything lives and how it ships

This is my map of the suite: where each app's code is, where it goes live, and how I check it before it ships. It's not an uptime page. What's listed on the homepage comes from `src/content/homepage.ts`, and the only real proof a deploy worked is opening the live site.

## Where each app lives

| App | Code (relative to my workspace folder) | Live at | How it ships |
| --- | --- | --- | --- |
| Aliasist homepage | `aliasist-web` | `www.aliasist.com` | push to `master`, GitHub Actions deploys to Pages project `aliasistabductor` |
| spawnOS (web) | `aliasist-web/public/os` | `www.aliasist.com/os` | ships with the homepage |
| Aliasist AI | `waterfall` | `www.aliasist.tech` | push to `production`, Pages project `aliasist-tech` builds it |
| Globalize | `projects/aliasist-repos/globalize` | `www.aliasist.world` | push to `main`, Pages project `globalize` builds it. Its Workers deploy separately |
| PDFSist | `pdfsist` | `pdf.aliasist.com` | has a build script but no deploy script, so double-check the hosting setup before shipping |
| ClearSist | `aliasist-web/apps/clearasist` | `clearasist.pages.dev` | its own GitHub Actions workflow, Pages project `clearasist` |
| SpaceSist | `projects/aliasist-repos/space-asist` | `space.aliasist.com` | static frontend plus a separate Worker. Double-check the frontend hosting before shipping |
| Files Abductor | `aliasist-files-abductor` (there's also a Rust version in `files-abductor-rs`) | releases on the public `aliasist/files-abductor` repo | the homepage links to v2.7.0. Test each installer on its own |
| Shared AI and data platform | `aliasist-platform-qdrant` | `api.aliasist.tech` | push to `main`, its deploy workflow ships the Worker and portal as separate jobs |
| Verity Console | `verity-console` | runs on my machine only | frontend and backend run separately. Not public |

Some names stuck around from earlier versions: `waterfall`, `clearasist`, `agsc`, and the Pages project names. Leave them alone. Renaming a domain, resource, corpus ID, or branch just to match a display name breaks things. DataSist, EcoSist, and PulseSist are older apps or platform pieces, not current homepage products.

## How the apps connect

The homepage points to five web apps and one desktop app. Aliasist AI calls the platform's `/ai/route`. The homepage chat calls `/rag/ask` to pull in real documents before it answers. Globalize sends its data center questions through its own API to the same platform. Verity is where I curate those documents, and its import tools can change production data, so be careful with it. PDFSist and ClearSist do everything in your browser and don't use any of the AI services.

## Checking things locally

From `aliasist-web`:

```sh
npm ci
npm run setup:clearasist
npm run check                 # homepage lint, tests, build, size budget
npm run check:suite           # also checks the other repos in my workspace
npm run check:suite -- --only=homepage,pdf,clear
npm run status:suite          # git state and existing builds only
npm run status:suite -- --live
npm run test:browser          # clicks through the built homepage, PDFSist, ClearSist and Globalize offline
```

`scripts/suite.json` lists each repo, its live URL, and its check commands. If the workspace folder lives somewhere else, set `ALIASIST_WORKSPACE` or change the paths. Each repo needs its dependencies installed first. The checker only looks: it never installs anything, commits, deploys, imports data, or runs paid AI calls. It saves a timestamped report and logs in `.reports/`, which git ignores.

Each report records the commit, branch, changed files, a hash of the tracked changes, the check results, and an optional comparison with the live site. A passing report means the files on disk passed at that moment, uncommitted ones included. It doesn't mean they were committed or deployed. The hash doesn't cover brand-new untracked files, so read the changed-file list too.

Some things the checker can't cover: Verity only gets a compile and syntax check, and SpaceSist runs its frontend tests and Worker tests with fake data. Files Abductor installers, live data imports, billing, outside providers being up, and signed-in flows on the real sites all need checking by hand.

## Shipping something

1. Look at `git status` and the diff. Don't sweep in unrelated changes.
2. Install from the right lockfile. ClearSist has its own.
3. Run the checks and click through the app (see below).
4. Commit just what you mean to, including any new files your code imports. A build only passes locally if those files are on your disk, so build a clean copy of the commit if you're not sure. Double-check the branch and where it deploys.
5. Ship it the way that app ships. The homepage runs `npm run check` before every deploy, and pull requests never deploy. Check the other apps' hosting yourself, since the suite script doesn't touch their settings.
6. Open the live site with a hard refresh, make sure the new files are being served, and try whatever changed. Note the commit, deploy ID, and time.

A 200 response only means something answered. A 401 or 403 might just be a login wall or bot blocking, so it doesn't prove the site works. Matching file names on the live site is a good first sign, but it doesn't prove every page, API, and sign-in works. `--live` fails on blocked requests, errors, or files that don't match, so look into those.

## What to click through

| App | Before calling a release good |
| --- | --- |
| Homepage | Menu on desktop and phone, all six project cards, keyboard menu and Escape, the other pages, error recovery, contact and subscribe forms on a test account |
| Aliasist AI | Send, retry, stop, reopening saved chats, editing a message to branch the chat, feedback on a question that's too long, image generation only with a provider test I've OK'd |
| Globalize | Startup, keyboard search, opening and closing Layers, toggling layers, picking a facility, closing details, a feed being down, phone controls not overlapping |
| PDFSist | Picking or dropping a PDF, loading feedback, changing pages, adding text and a signature, downloading and reopening the result, a bad file, keyboard upload |
| ClearSist | Keyboard and drag-and-drop upload, cleaning and downloading an image, a PDF and an Office file, checking the metadata is really gone and the file still opens, an unsupported file |
| SpaceSist | Main panels with fake feeds, empty and broken feeds, refresh. Check the real data separately |
| spawnOS | Boot and log in, settings sticking after a reload, making and deleting a file, opening each app in the rail |

The browser script needs Chrome installed (or `CHROME_PATH` set) and each app built. `--only=pdf,globalize` reruns just those. `PLAYWRIGHT_MODULE` can point to a Playwright install you already have. Results and screenshots go to `.reports/browser/`. It blocks outside services on purpose, so seeing sign-in notices is normal. It doesn't test real sign-in.

## Where things are headed

No new projects until 2027. For now I'm focused on releases that pass their checks, pages that recover when something fails to load, names and menus that match everywhere, and being able to prove what's actually live.
