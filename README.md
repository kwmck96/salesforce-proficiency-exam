# Salesforce Proficiency Exam

A single-page React app (Vite + Tailwind). Each attempt draws a fresh ~180-question
exam from a 352-question bank, keeping a fixed even spread across categories and
difficulties. Scored overall, broken down by domain, and mapped to a proficiency tier.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Deploy to Vercel
Vercel auto-detects Vite (Build Command `vite build`, Output Directory `dist`) —
no extra configuration needed.

**Option A — Vercel CLI (fastest):**
```bash
npm i -g vercel
vercel          # preview deploy; follow the prompts
vercel --prod   # promote to production
```

**Option B — Git import:**
Push this folder to a GitHub/GitLab/Bitbucket repo, then in the Vercel dashboard
choose "Add New… → Project", import the repo, and deploy. Framework preset: Vite.

## Project structure
- `src/SalesforceProficiencyExam.jsx` — the exam component (question bank + UI)
- `src/main.jsx` — React entry point
- `src/index.css` — Tailwind directives + base styles
- `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js` — build config

Node 18+ recommended.
