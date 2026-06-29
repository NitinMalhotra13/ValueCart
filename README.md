# ValueCart

A collaborative shopping and budget planning web app built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Firebase**.

## Features

- **Collaborative Budgets** — Create shared budgets with real-time cart sync via Firestore
- **Smart Cart Optimizer** — Solves a 0/1 Knapsack variant to maximize value within your budget, with automatic swap suggestions
- **AI Bargain Buddy** — Chat assistant for product alternatives, bundle suggestions, and price negotiation tips (powered by Gemini 2.5 Flash)
- **Order History & Price Tracking** — View past purchases and get notified of price drops
- **Firebase Auth** — Email/password and social login

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Static Export) |
| Language | TypeScript |
| Styling | Tailwind CSS, Radix UI, Lucide Icons |
| Backend | Firebase Auth + Firestore |
| AI | Google Gemini 2.5 Flash |
| CI/CD | GitHub Actions → Firebase Hosting |

## Local Development

**Prerequisites:** Node.js 20+, npm 9+

```bash
# Install dependencies
npm install --legacy-peer-deps

# (Optional) Create .env.local for live AI
echo "NEXT_PUBLIC_GEMINI_API_KEY=your_key_here" > .env.local

# Start dev server at http://localhost:9002
npm run dev
```

## Deployment

The app deploys automatically to **Firebase Hosting** on every push to `main` via GitHub Actions.

### Setup (one-time)

1. Go to your repo → **Settings → Secrets and variables → Actions**
2. Add the following secrets:
   - `FIREBASE_SERVICE_ACCOUNT` — Service account JSON from the [Firebase Console](https://console.firebase.google.com) → Project Settings → Service Accounts
   - `GEMINI_API_KEY` *(optional)* — Enables live AI features in production

### Manual Deploy

```bash
npm run build
npx firebase-tools deploy --only hosting --project studio-4270998753-73572
```

## Project Structure

```
src/
├── ai/           # Genkit AI flows (Bargain Buddy, Cart Optimizer)
├── app/          # Next.js App Router pages
├── components/   # UI components (shop, layout, shared)
├── firebase/     # Firebase initialization, providers, hooks
├── hooks/        # Custom React hooks
└── lib/          # Types, mock data, utilities
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | No | Gemini API key for live AI. Falls back to local algorithms if unset. |

## License

MIT
