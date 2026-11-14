# Roberto Mendoza — Portfolio

Bilingual (ES `/`, EN `/en/`) single-page portfolio. Astro 7 static output, Tailwind v4,
self-hosted fonts, ~3 KB of vanilla JS for motion (reveals, scroll-lit manifesto,
cursor-following project previews, magnetic buttons). Respects `prefers-reduced-motion`
and falls back gracefully on touch devices.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + static build to dist/
```

All copy lives in `src/i18n/content.ts` (one object per language).
The ES/EN links use Astro client-side navigation to update the language and URL
without a full page reload. Direct links still work without JavaScript. Motion
controls retain their preference, and animation resources are cleaned up on navigation.

Run the motion lifecycle regression check with `node --test tests/*.test.mjs`.
For browser checks against a running build, use an external Playwright installation:
`PLAYWRIGHT=/path/to/playwright/index.mjs node tests/browser-language-navigation.mjs http://localhost:4322/`.

## Deploy (rm.byteforus.com)

Every push to `main` runs `.github/workflows/deploy.yml`: it builds with
`SITE_URL=https://rm.byteforus.com` and copies `dist/` to `/var/www/portfolio` on the VPS.

### One-time setup

1. **GitHub secrets** (repo → Settings → Secrets and variables → Actions), same values as
   your other deploy repos: `VPS_HOST`, `VPS_USERNAME`, `VPS_SSH_KEY`.
2. **Cloudflare DNS**: add a proxied (orange cloud) `A` record `rm` → your VPS IP, like the
   other subdomains.
3. **VPS Nginx**:
   ```bash
   sudo mkdir -p /var/www/portfolio && sudo chown "$USER" /var/www/portfolio
   sudo cp deploy/portfolio-security-headers.conf /etc/nginx/snippets/
   sudo cp deploy/rm.byteforus.com.conf /etc/nginx/sites-available/portfolio
   # edit it: paste the ssl_certificate lines from your safetycheck site (see the TODO)
   sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
   sudo nginx -t && sudo systemctl reload nginx
   ```
4. **Root domain redirect** (Cloudflare → Rules → Redirect Rules → Create rule):
   - When: hostname equals `byteforus.com` **or** hostname equals `www.byteforus.com`
   - Then: Dynamic redirect to `concat("https://rm.byteforus.com", http.request.uri.path)`,
     status **302**, preserve query string.
   - Switch to 301 only once you are sure the root domain will keep pointing here.

### Alternative: Docker

`SITE_URL=https://rm.byteforus.com docker compose up -d --build` serves the same site with
unprivileged Nginx on `127.0.0.1:8090` (headers included); proxy to it from the host Nginx.
From WSL with Docker Desktop, prefix `WSLENV=SITE_URL`.
