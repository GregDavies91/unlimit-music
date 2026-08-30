# Deploy — Unlimit Music (unlimit-music)

Static site. No build step. All files in this folder ARE the site.

## 1. Push to GitHub (you own this — Hermes does not authenticate `gh`)
The site lives in: `/workspaces/hermes/greg/projects/unlimit-music/`
Create a repo (e.g. `unlimitmusic`) and push these files:
```
index.html  config.js  consent-ads.js  data.js  app.js  style.css  favicon.ico
assets/   (audio + diagrams)
```
Do NOT commit `__MACOSX/`, `.DS_Store`, or the `analyze.py` / `build_assets.py` dev scripts
to the public repo (they're local tooling, not the product). Actually build_assets.py is fine
to keep but not required for the live site.

## 2. Cloudflare Pages (free)
- Cloudflare dashboard → Workers & Pages → Create → Pages → connect the GitHub repo.
- Build settings: **Framework preset = None**, **Build command = (empty)**,
  **Build output directory = `/`** (root, since index.html is at the root).
- Deploy. You get a `*.pages.dev` URL to test.

## 3. Point the domain `unlimitmusic.com` at it
- In the Pages project → Custom domains → add `unlimitmusic.com`.
- Cloudflare gives you DNS records (a CNAME). Add them at Cloudflare Registrar
  (you already bought the domain there, so it's the same account — easy).
- Leave the orange-cloud (proxy) ON after AdSense approves. Before applying to AdSense,
  you can keep proxy off so Google sees the real origin.

## 4. AdSense (you own this — needs your Google account)
- Sign up at adsense.google.com with the SAME Google account you'll use for the site.
- Add site `unlimitmusic.com`. Google gives you a publisher ID `ca-pub-XXXXXXXXXXXX`.
- Open `config.js` in this repo and set:
  `ADSENSE_PUB_ID: "ca-pub-XXXXXXXXXXXX"`
  (also replace the `data-ad-slot="0000000000"` in consent-ads.js with the real ad unit
  slot from your AdSense ad unit, OR use Auto ads — then the slot line is optional).
- Commit + redeploy.
- IMPORTANT: the ad script ONLY loads after the visitor clicks **Accept** (consent-ads.js).
  This keeps you compliant with UK GDPR/PECR so AdSense doesn't ban the account.
- Verification: Google may ask you to put a meta-tag / HTML file. For the HTML-file method,
  drop `googleXXXX.html` in this folder and redeploy. For meta-tag, add it to <head> in index.html.

## 5. Bing Ads (optional, you pay to drive traffic)
- Once the site is indexed on the domain, create a Microsoft Advertising account and point
  a campaign at `unlimitmusic.com`. Separate from AdSense (that's the earning side).

## Notes
- Traffic is the real engine: consider backlink outreach (real, relevant sites; one polite
  message each) to build rankings. Ads pay ~£0 with no visitors.
- Scales feature: add later as a second diagram box beside the chord diagram (songwriting view).
