# Deployment Guide — Coolify (Split-Domain)

This repository deploys as a **Docker Compose** project on Coolify with two
public services on separate subdomains:

| Service | Domain                                          | Purpose            |
| ------- | ----------------------------------------------- | ------------------ |
| Web     | `https://summercamp2026.permiraspb.org`         | React SPA (nginx)  |
| API     | `https://api-summercamp2026.permiraspb.org`     | Express + SurrealDB |

> Want a different domain? Set `WEB_FQDN` and `API_FQDN` in Coolify env
> (and `VITE_API_URL` to match `API_FQDN`). The compose file picks them up.

---

## Two deploy modes

| Mode | Compose file | Where images are built | Use when |
| ---- | ------------ | ---------------------- | -------- |
| **Pull prebuilt (recommended)** | `docker-compose.prod.yml` | GitHub Actions → GHCR | Always, esp. on small VPSs — no build on the box |
| Build on VPS | `docker-compose.yml` | On the Coolify host | Quick one-off / no CI |

The VPS is memory-constrained (8GB shared with other apps), so **building images
on it OOM-kills the Vite build**. Build them on GitHub's runners instead and have
Coolify pull. See **"Prebuilt images via GHCR"** below.

---

## Prebuilt images via GHCR (recommended)

**A. CI publishes the images.** `.github/workflows/docker.yml` builds both images
on every push to `main` and pushes them to:

```
ghcr.io/mhmdaris15/permira-summer-camp-2026/web:latest
ghcr.io/mhmdaris15/permira-summer-camp-2026/api:latest
```

(Also tagged `sha-<short>` per commit, and `vX.Y.Z` on git tags.) No secrets
needed — it uses the built-in `GITHUB_TOKEN`. If your API domain differs, set a
repo **variable** `VITE_API_URL` (Settings → Secrets and variables → Actions →
Variables) so the web bundle is baked with the right API origin.

**B. Make the packages pullable by Coolify.** Two options:
- *Simplest:* on GitHub, open each package (`…/web`, `…/api`) → **Package settings
  → Change visibility → Public**. Coolify then pulls with no credentials.
- *Private:* in Coolify add a **Docker registry**: `ghcr.io`, username = your
  GitHub username, password = a PAT with `read:packages`.

**C. Point Coolify at the pull compose.** In the resource config set
**Compose File: `docker-compose.prod.yml`** (instead of `docker-compose.yml`).
That file has no `build:` sections — Coolify pulls `:latest` and starts.

**D. Auto-deploy on push.** With the GitHub webhook enabled (Coolify → Webhooks),
push to `main` → CI builds & pushes images → trigger a Coolify redeploy (webhook,
or Coolify's "Check for new images"). Deploys become a ~10s pull instead of a
20-min build.

> Pin a specific build instead of `:latest` by setting `WEB_IMAGE` / `API_IMAGE`
> env in Coolify to the `sha-<short>` tag.

---

## DNS

Point both subdomains at your Coolify host's public IP:

```
summercamp2026.permiraspb.org       A    <coolify-ip>
api-summercamp2026.permiraspb.org   A    <coolify-ip>
```

Wait for propagation (`dig summercamp2026.permiraspb.org` from anywhere) before
the next step — Let's Encrypt will fail HTTP-01 challenges otherwise.

---

## Step 1 — Create the resource

1. **Projects → New Resource → Public Repository**
2. Paste repo URL, branch `main`
3. **Build Pack:** `Docker Compose`
4. **Compose File:** `docker-compose.prod.yml` (pull prebuilt from GHCR — recommended)
   · or `docker-compose.yml` to build on the VPS
5. Save

Coolify reads the two `SERVICE_FQDN_*_*` env vars in compose and auto-provisions
a Traefik route + Let's Encrypt cert for each service. No labels to fiddle with.

---

## Step 2 — Environment variables

In the resource's **Environment Variables** tab, paste these (use
[`.env.coolify.example`](./.env.coolify.example) as the source of truth):

| Key                 | Value                                                | Secret? |
| ------------------- | ---------------------------------------------------- | :-----: |
| `WEB_FQDN`          | `https://summercamp2026.permiraspb.org`              |         |
| `API_FQDN`          | `https://api-summercamp2026.permiraspb.org`          |         |
| `VITE_API_URL`      | `https://api-summercamp2026.permiraspb.org`          |         |
| `ALLOWED_ORIGINS`   | `https://summercamp2026.permiraspb.org`              |         |
| `GEMINI_API_KEY`    | `AIza…` (from https://aistudio.google.com/apikey)    | ✅      |
| `ADMIN_TOKEN`       | (generated, see below)                               | ✅      |
| `JWT_SECRET`        | (generated, see below — different from ADMIN_TOKEN)  | ✅      |
| `LLM_MODEL`         | `gemini-2.5-flash-lite` *(optional)*                 |         |
| `LOG_LEVEL`         | `info`                                               |         |
| `RATE_LIMIT_GLOBAL` | `300` *(optional)*                                   |         |
| `RATE_LIMIT_TIGHT`  | `10`  *(optional)*                                   |         |

Generate `ADMIN_TOKEN` and `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

> ⚠️ **`VITE_API_URL` is baked into the JS bundle at build time.** If you change
> it later, you must rebuild the `web` image (Coolify: **Redeploy** with cache off,
> or push a commit). Runtime env changes won't reach the browser.

---

## Step 3 — Persistent storage

In the **Storage** tab, attach two volumes to the `api` service:

| Mount path             | Volume name        | Purpose                          |
| ---------------------- | ------------------ | -------------------------------- |
| `/app/server/data`     | `permira-data`     | SurrealDB JSON snapshot + KB JSON |
| `/app/server/uploads`  | `permira-uploads`  | Uploaded passport + consent docs |

The `docker-compose.yml` declares both volumes — Coolify mirrors them when
you confirm in the UI.

> ⚠️ Skip this and every redeploy wipes participant data and uploaded files.

---

## Step 4 — Deploy

Click **Deploy**. Coolify will:

1. `git pull`
2. Build both images (multi-stage, ~3 min first time)
3. Bring them up via `docker compose up -d`
4. Provision Let's Encrypt certs for both domains via Traefik
5. Wait for `web` and `api` healthchecks to go green

---

## Step 5 — Verify (no CORS errors)

Open browser DevTools → Network on `https://summercamp2026.permiraspb.org`.
Click the chat button or scroll to the registration form.

**Expected:**

```
OPTIONS https://api-summercamp2026.permiraspb.org/api/auth/login   204
POST    https://api-summercamp2026.permiraspb.org/api/auth/login   200
```

The preflight should return headers like:

```
access-control-allow-origin: https://summercamp2026.permiraspb.org
access-control-allow-methods: GET,POST,PATCH,PUT,DELETE,OPTIONS
access-control-allow-headers: Authorization,Content-Type,X-Requested-With
access-control-max-age: 86400
```

Quick smoke tests from your terminal:

```bash
# Health
curl https://api-summercamp2026.permiraspb.org/api/health
# → {"ok":true,"env":"production","ts":"…"}

# CORS preflight
curl -i -X OPTIONS https://api-summercamp2026.permiraspb.org/api/auth/login \
  -H "Origin: https://summercamp2026.permiraspb.org" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
# → look for "Access-Control-Allow-Origin: https://summercamp2026.permiraspb.org"

# Real login
curl -X POST https://api-summercamp2026.permiraspb.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_ADMIN_TOKEN"}'
# → {"token":"<jwt>","expiresInSeconds":86400}
```

Then visit `https://summercamp2026.permiraspb.org/admin` and sign in.

---

## Troubleshooting CORS

If the browser console shows
*"Access to fetch at 'https://api-…' has been blocked by CORS policy"*:

| Cause                                                                                       | Fix                                                                                                                                |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ALLOWED_ORIGINS` missing or mismatched the web FQDN                                        | Set `ALLOWED_ORIGINS=https://summercamp2026.permiraspb.org` (no trailing slash) → restart api container.                           |
| API returns `Access-Control-Allow-Origin: *` but you're sending `Authorization`             | Not the issue here — `credentials: false` means wildcard would also work. Check origin actually matches.                            |
| CSP blocks before fetch fires (look for `Refused to connect to '…' because it violates …`) | Rebuild **web** image — `VITE_API_URL` is also baked into the nginx CSP. After changing it, force `web` rebuild without cache.     |
| Preflight returns 429                                                                       | Rate limit ate the OPTIONS. Already mitigated (`skip: OPTIONS`). If you see it, bump `RATE_LIMIT_GLOBAL` and `RATE_LIMIT_TIGHT`.   |
| Both services serve the same domain                                                         | Check Coolify domain config — `web` and `api` MUST have different FQDNs.                                                           |
| Cert handshake fails on `api-…`                                                             | DNS not propagated yet, or Coolify hasn't issued the cert. Wait, then redeploy. Check Coolify's Traefik logs.                       |

---

## Common gotchas

- **Trailing slash in URLs.** `VITE_API_URL` and `ALLOWED_ORIGINS` must NOT
  end with `/`. The frontend strips it; the server compares strings.
- **Rebuilding web after changing the API URL.** The Vite bundle hard-codes
  it. Touch nothing else, just redeploy `web`.
- **Running locally with these production env values.** Use `.env` (without
  `VITE_API_URL` or with `VITE_API_URL=""`), so Vite's dev proxy handles `/api`.

---

## Auto-deploy on push

Enable in the resource's **Webhooks** tab. Pushes to `main` trigger rebuild +
rolling deploy. The included `.github/workflows/ci.yml` gates `main` so it's
never broken before Coolify tries.

---

## Scaling later

Same as before, see [README.md → Production Notes](./README.md#-production-notes).
The split-domain layout makes API horizontal scaling trivial: drop in more
`api` replicas behind Coolify's load balancer; the SPA hits a single endpoint.

---

## Backups

```bash
# On the Coolify host
docker run --rm \
  -v permira-data:/data:ro \
  -v permira-uploads:/uploads:ro \
  -v /var/backups:/out \
  alpine sh -c "tar czf /out/permira-$(date +%F).tgz /data /uploads"
```

Restore is `tar xzf` into the volumes.

---

## Production checklist

- [ ] DNS for both subdomains points at Coolify host
- [ ] All three secrets set and marked **secret** in Coolify
- [ ] `VITE_API_URL` matches `API_FQDN` (no trailing slash, no path)
- [ ] `ALLOWED_ORIGINS` includes `WEB_FQDN` (no trailing slash)
- [ ] Both volumes attached to the `api` service
- [ ] HTTPS enabled on **both** services
- [ ] First chat works end-to-end (the chatbot replies)
- [ ] First test registration creates a row in `permira-data` and files in `permira-uploads`
- [ ] Admin login at `https://summercamp2026.permiraspb.org/admin` succeeds
- [ ] Backups scheduled
