# Citizens 4 Ontario

Static site built with Vite + Tailwind CSS v4, hosted on Cloudflare Workers (static assets). The "Action Intake Form" posts to `/api/intake` (`worker/index.js`), which stores rows in the D1 table `intake`.

```sh
npm install        # once
npm run dev        # local dev server with hot reload
npm run preview    # build + serve on the Cloudflare runtime locally
npm run deploy     # build + deploy to Cloudflare (run `npx wrangler login` first)

npx wrangler d1 migrations apply c4o-intake --local    # create the table for local preview
npx wrangler d1 migrations apply c4o-intake --remote   # once, after first deploy
npx wrangler d1 execute c4o-intake --remote --command "SELECT * FROM intake"
```

- Markup: `index.html` · Styles & brand tokens: `src/style.css` (`@theme`) · Behaviour: `src/main.js`
- Cloudflare config: `wrangler.jsonc`
- Update dependencies: `npm outdated`, then `npm update`
