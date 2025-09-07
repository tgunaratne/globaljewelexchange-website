# Global Jewel Exchange — Pages + Worker (D1 + Resend)

This repo deploys:
- **Frontend** (`/web`) to **Cloudflare Pages**
- **Backend API** (`/worker`) to **Cloudflare Workers** with **D1** database and **Resend** email

## Quick Start

1) **Create D1 DB**
```bash
wrangler d1 create gje_db
# note the database_id and paste it into worker/wrangler.toml
```

2) **Run first migration**
```bash
wrangler d1 migrations apply gje_db --remote
```

3) **Repository Secrets (GitHub → Settings → Secrets and variables → Actions)**
- `CLOUDFLARE_API_TOKEN` (permissions: Workers+Pages+D1)
- `CLOUDFLARE_ACCOUNT_ID`
- `RESEND_API_KEY`
- `FROM_EMAIL` (e.g., no-reply@globaljewelexchange.com)
- `FROM_NAME`  (e.g., Global Jewel Exchange)

4) **DNS & Routes**
- Create DNS for `api.globaljewelexchange.com` in Cloudflare
- Workers → Triggers → Routes → `api.globaljewelexchange.com/*` → map to worker
- Pages project name: `globaljewelexchange` → link custom domain `globaljewelexchange.com`

5) **Deploy**
- Push to `main` → GitHub Actions will:
  - publish Worker (and apply migrations)
  - deploy Pages from `/web`

## Local Dev
- Worker: `cd worker && wrangler dev`
- Frontend: open `web/index.html` or serve `web/` with any static server

## Frontend endpoint
Form POSTs to: `https://api.globaljewelexchange.com/api/early-access`

---

Update hero images in `web/assets/` and adjust the `bg-[url('...')]` in `web/index.html`.
