# ByeByeBalance – Next.js Migration

Free debt payoff calculator migrated from Create React App to Next.js for SEO and performance.

## What Changed

| Before (CRA)                    | After (Next.js)                         |
| -------------------------------- | --------------------------------------- |
| `react-scripts`                  | `next`                                  |
| `react-router-dom` for routing   | File-based routing (`app/` directory)   |
| Empty HTML shell (no SEO)        | Server-rendered HTML (full SEO)         |
| No sitemap or robots.txt         | Auto-generated sitemap + robots.txt     |
| Meta tags in `index.html` only   | Per-page metadata with Open Graph       |
| No structured data               | JSON-LD for rich search results         |

## What Didn't Change

- All calculator logic (Calculator.js) — identical math
- All styling — same inline styles
- All UI components — same look and feel
- localStorage persistence — still works
- Share/Export/Print features — still work

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

This is a standard Next.js app. On Vercel:

1. Push this repo to GitHub
2. Import in Vercel dashboard (or connect existing project)
3. Vercel auto-detects Next.js — no config needed
4. Deploy

## Project Structure

```
app/
├── layout.js          # Root layout + global SEO metadata
├── globals.css        # Global styles
├── page.js            # Homepage (server component)
├── Calculator.js      # Calculator (client component - your main app)
├── JsonLd.js          # Structured data for search engines
├── sitemap.js         # Auto-generated sitemap.xml
├── robots.js          # Auto-generated robots.txt
├── privacy/
│   ├── page.js        # Privacy page metadata
│   └── PrivacyContent.js  # Privacy content (client component)
└── contact/
    ├── page.js        # Contact page metadata
    └── ContactContent.js  # Contact content (client component)
```

## Future: AI Coach API Route

When ready, add `app/api/chat/route.js` for the AI coach backend:

```js
// app/api/chat/route.js
export async function POST(request) {
  const { message, debtData } = await request.json();
  // Call Claude API here
  // Return coaching response
}
```
