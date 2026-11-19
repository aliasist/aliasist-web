# Security Migration Guide

## Current State

The codebase has been significantly improved since the initial analysis. Most hardcoded API keys were already moved to environment variables. Only **2 hardcoded secrets** remain in the current codebase.

---

## 🔴 Remaining Hardcoded Secrets

### 1. Sentry DSN in DataSist API

**File:** `apps/datasist-api/src/index.ts:635`
```typescript
const SENTRY_DSN = "https://a4392f5f65eb0725f34d6c410f97e1b1@o4511142133760000.ingest.us.sentry.io/4511142165348352";
```

**Risk:** Medium — exposes your Sentry project identifier, allowing anyone to send events to your Sentry account under your identity.

**Migration Steps:**
1. Add `SENTRY_DSN` to the `Env` interface in `apps/datasist-api/src/index.ts`:
   ```typescript
   export interface Env {
     // ... existing fields
     SENTRY_DSN?: string;
   }
   ```
2. Replace the hardcoded constant with a read from `env.SENTRY_DSN`:
   ```typescript
   // Remove: const SENTRY_DSN = "https://...";
   // In captureError, use: env.SENTRY_DSN
   ```
3. Set the secret in Cloudflare Dashboard:
   - Go to **Workers & Pages** → **datasist-api** → **Settings** → **Variables**
   - Add `SENTRY_DSN` with the value `https://a4392f5f65eb0725f34d6c410f97e1b1@o4511142133760000.ingest.us.sentry.io/4511142165348352`
4. Add to local `.dev.vars`:
   ```
   SENTRY_DSN="https://a4392f5f65eb0725f34d6c410f97e1b1@o4511142133760000.ingest.us.sentry.io/4511142165348352"
   ```

---

### 2. GitHub App Credentials in wrangler.toml

**File:** `wrangler.toml:31-32`
```toml
[vars]
GITHUB_APP_ID = "3909945"
GITHUB_APP_CLIENT_ID = "Iv23liyNQyBoBOh6IROQ"
```

**Risk:** Medium-High — GitHub App ID is public, but the Client ID combined with the private key gives full GitHub App access. These are committed to git.

**Note:** The GitHub App ID (`3909945`) is actually public information visible on the GitHub App's settings page. The Client ID (`Iv23liyNQyBoBOh6IROQ`) is more sensitive.

**Migration Steps:**
1. Remove from `wrangler.toml`:
   ```toml
   # Remove these lines from [vars]:
   # GITHUB_APP_ID = "3909945"
   # GITHUB_APP_CLIENT_ID = "Iv23liyNQyBoBOh6IROQ"
   ```
2. Set as secrets in Cloudflare Dashboard:
   - Go to **Workers & Pages** → **aliasist-web** → **Settings** → **Variables**
   - Add `GITHUB_APP_ID` as a secret (value: `3909945`)
   - Add `GITHUB_APP_CLIENT_ID` as a secret (value: `Iv23liyNQyBoBOh6IROQ`)
3. Add to local `.dev.vars`:
   ```
   GITHUB_APP_ID="3909945"
   GITHUB_APP_CLIENT_ID="Iv23liyNQyBoBOh6IROQ"
   ```

---

## ✅ Already Secured (No Action Needed)

The following items from the original analysis have already been addressed:

| Item | Status |
|------|--------|
| Groq, Anthropic, Gemini API keys in workers | ✅ Moved to environment variables via `Env` interface |
| EIA, OpenWeatherMap, OpenMeteo API keys | ✅ Moved to environment variables |
| Neon database API key in seed-d1.ts | ✅ File removed, database URL in env vars |
| `.dev.vars` in `.gitignore` | ✅ Already ignored at repo root and in app subdirectories |
| Clerk secrets | ✅ Configured via Cloudflare secrets dashboard |
| GitHub App private key | ✅ Configured as secret via `GITHUB_APP_PRIVATE_KEY` env var |

---

## Verification Checklist

After migrating the remaining secrets:

- [ ] `grep -r "gsk_\|sk-ant-\|AIza\|eyJ\|SENTRY_DSN" apps/` returns no hardcoded values
- [ ] `wrangler.toml` contains no plaintext secrets in `[vars]`
- [ ] All workers start correctly with secrets from Cloudflare dashboard
- [ ] Local development works with `.dev.vars` files

---

## Cloudflare Secrets Dashboard Paths

| Worker | Dashboard URL Pattern |
|--------|----------------------|
| aliasist-web (Pages Functions) | `https://dash.cloudflare.com/{account}/workers/{pages-project}/settings/variables` |
| datasist-api | `https://dash.cloudflare.com/{account}/workers/{worker-name}/settings/variables` |
| clearasist worker | Same pattern for the clearasist worker |
