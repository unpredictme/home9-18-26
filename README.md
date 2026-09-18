# UnPredictMe — Cloudflare Worker MVP

A deliberately simple landing-page prototype:
1. User enters an email.
2. The browser produces a playful prediction.
3. The result asks whether we got them right.

## Run locally
```bash
npm install
npx wrangler dev
```

## Deploy
```bash
npx wrangler login
npx wrangler deploy
```

## Important next step
This MVP intentionally does NOT pretend an email address contains enough information to infer a person. For production, collect a small set of explicit, consented signals (or ask 1–3 playful questions), generate the prediction server-side, and send follow-up predictions only after clear opt-in.

## SEO / GEO
Primary intent to test: **AI fortune teller** and **AI prediction about me**.
Secondary pages can target:
- AI fortune teller
- predict my future
- tell me about myself AI
- personality prediction
- what will happen to me
- future prediction quiz

Do not create dozens of thin keyword pages. Build one genuinely useful interactive experience and supporting explanatory pages.
