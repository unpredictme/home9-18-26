# UnPredictMe

UnPredictMe is a lightweight daily guessing game: answer a few playful questions, get a personalized prediction, and come back tomorrow for another one.

## Product loop

1. Answer a few playful questions using explicit signals.
2. Get a prediction immediately.
3. React with “That’s me” or “Not even close.”
4. Receive the prediction by email through Brevo when configured.
5. Come back tomorrow for a new prediction without having to complete a daily mood log.

The daily loop is intentionally closer to a fortune-teller relationship than a conventional check-in: **“What does UnPredictMe have to say about me today?”**

## Brevo

Set these Cloudflare Worker secrets:

    npx wrangler secret put BREVO_API_KEY
    npx wrangler secret put BREVO_SENDER_EMAIL
    npx wrangler secret put BREVO_SENDER_NAME

Transactional delivery is separate from marketing consent. The optional marketing checkbox is not currently used to subscribe a contact to a marketing list.

## Deploy

    npm install
    npx wrangler login
    npx wrangler deploy

The Worker name is `home9-18-26`, matching the existing deployment.

## Local development

    npm install
    npx wrangler dev

## Production next steps

Add rate limiting/bot protection, analytics, privacy/terms pages, durable storage for feedback/daily history, and a proper Brevo contact/list flow only after explicit marketing opt-in.
