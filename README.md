# ♻️ ReLoop — Every Broken Device is a Lesson

> *"Every printer is a teacher. Every broken laptop is a lesson."*

ReLoop is a **web platform that turns e-waste into education**. It guides students, hobbyists, and educators through safe, structured device teardowns — extracting valuable components, verifying them with AI, and giving those parts a second life through donation, resale, or responsible recycling.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Supported Devices (MVP)](#-supported-devices-mvp)
- [User Journey](#-user-journey)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 Overview

ReLoop addresses two intertwined problems:

1. **E-waste crisis** — $57 billion worth of electronics are discarded annually.
2. **STEM affordability gap** — ~40% of schools can't afford robotics and electronics equipment.

By bridging these, ReLoop creates a circular economy where discarded devices become low-cost STEM learning kits — verified, safe, and ready for reuse.

---

## 🚨 The Problem

| Challenge | Impact |
|-----------|--------|
| 57B+ in annual e-waste | Environmental damage, resource loss |
| Schools lack affordable gear | Students miss hands-on STEM exposure |
| DIY teardown tutorials are unsafe | No safety gates, no verification |
| No structured pathway | Parts get thrown away instead of harvested |

ReLoop solves this with guided teardowns, AI verification, and three post-teardown outcomes: **Donate → Sell → Recycle**.

---

## ✨ Key Features

### 🗺️ Component Map Preview
Before touching a single screw, users see a full breakdown of what's inside the device — part values, locations, XP rewards, and educational outcomes.

### 🛡️ Safety-First Guided Teardown
- Step-by-step teardown instructions with PPE checks
- Hazard callouts for capacitors, batteries, and sharp components
- Safety gates that block progression until risks are acknowledged
- Color-coded device difficulty tiers: 🟢 Easy / 🟡 Medium / 🔴 Hard

### 🤖 AI-Powered Component Verification (Google Gemini Vision)
Upload a photo of any extracted part and Gemini 2.0 Flash Vision will:
- Identify the **component type** (e.g., NEMA 17 Stepper Motor)
- Rate the **condition** (Excellent / Good / Fair / Poor)
- Return a **confidence score** (auto-approved ≥ 75%, manual review < 75%)
- Flag **safety concerns** (damaged battery, leaking capacitor, etc.)

> Cost: ~$0.00065 per verification — 50× cheaper than GPT-4 Vision.  
> Free tier: 1,500 requests/day via Google AI Studio.

### 📚 Educational Context Per Component
At each extraction step, learn:
- **What is this?** — Component identity & explanation
- **Why is it valuable?** — Market price & rarity
- **Where can it be used?** — 3–5 real-world project examples
- **How does it work?** — Technical breakdown with diagrams

### 🎮 Gamification
- **XP System** — Earn XP for each verified component
- **Badges** — Unlock achievements (e.g., "Motor Master", "Circuit Breaker")
- **Leaderboards** — Global and school-wide rankings
- **Streaks** — Daily activity bonuses

### 🔄 Post-Teardown Actions
After completing a full device teardown, choose your path:

| Action | Description |
|--------|-------------|
| 🎁 **Donate** | Send parts to local schools / makerspaces, get a tax receipt + 2× XP |
| 💰 **Sell** | List on the marketplace with AI-auto-populated specs and price suggestions |
| 🌿 **Recycle** | Find nearby e-waste facilities via ZIP code, get disposal instructions |

### 🛒 Marketplace
- Auto-generated listings from verified components
- AI-suggested pricing based on condition and market data
- Component provenance (device source, extraction date, verifier)
- Platform commission: 25%

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **State Management** | Zustand |
| **Data Fetching** | TanStack React Query |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Build Tool** | Vite 7 |
| **Backend** | Supabase (Edge Functions + PostgreSQL + Storage + Auth) |
| **AI Vision** | Google Gemini 2.0 Flash Vision |
| **Hosting** | Vercel (Frontend) + Supabase (Backend) |
| **PWA** | vite-plugin-pwa + Workbox |

---

## 📱 Supported Devices (MVP)

| Device | Difficulty | HVI Score | Est. Value | Key Learning |
|--------|------------|-----------|------------|--------------|
| **HP DeskJet 2700 Printer** | 🟡 Medium | 87/100 | $43 | Motor control, optical sensing |
| **Linksys WRT54G Router** | 🟢 Easy | 72/100 | $28 | Networking, RF basics, power management |
| **Xbox 360 (broken)** | 🔴 Hard | 95/100 | $67 | Thermal management, gaming hardware |
| **Dell Inspiron Laptop** | 🔴 Hard | 91/100 | $89 | Display tech, battery safety, modular computing |

---

## 🚀 User Journey

```
Landing → Search Device → Component Map Preview
         ↓
  Start Teardown → Safety Gate (PPE + Power-off)
         ↓
  Guided Steps → Photo Upload → AI Verification
         ↓
  XP Awarded → Next Component or Device Complete
         ↓
  ┌──────┬──────┬──────┐
  │Donate│ Sell │Recycle│
  └──────┴──────┴──────┘
```

---

## 📁 Project Structure

```
reloop/
├── public/                  # Static assets (icons, favicons)
├── src/
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Supabase client, utilities, AI helpers
│   ├── pages/               # Route-level page components
│   │   ├── LandingPage.tsx
│   │   ├── DeviceCatalogPage.tsx
│   │   ├── DeviceDetailPage.tsx
│   │   ├── TeardownRunnerPage.tsx
│   │   ├── TeardownCompletePage.tsx
│   │   ├── MarketplacePage.tsx
│   │   ├── LeaderboardPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── DonatePage.tsx
│   │   ├── RecyclePage.tsx
│   │   └── auth/
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Root component & routing
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── supabase/                # Edge Functions & DB migrations
├── .env                     # Environment variables (not committed)
├── vite.config.ts           # Vite configuration (incl. PWA)
├── package.json
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A **Supabase** account and project
- A **Google AI Studio** API key (for Gemini Vision)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/reloop-anti.git
cd reloop-anti

# 2. Install dependencies
npm install

# 3. Set up environment variables (see section below)
cp .env.example .env

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_GEMINI_API_KEY=<your-google-gemini-api-key>
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project API URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase project public anon key |
| `VITE_GEMINI_API_KEY` | Google AI Studio key for Gemini Vision |

> ⚠️ Never commit your `.env` file. It is already included in `.gitignore`.

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step guide.

**Quick Summary:**

1. **Push to GitHub** — create a repo and push your code
2. **Deploy Frontend on Vercel** — import repo, add env vars, deploy
3. **Deploy Edge Functions on Supabase**:
   ```bash
   npx supabase functions deploy --project-ref <your-project-ref>
   ```

---

## 📊 Key Metrics to Track

- Tutorial completion rate
- AI verification pass rate (target: ≥ 75% confidence)
- Components verified per user/week
- Marketplace listings created
- Donate vs. Sell vs. Recycle distribution
- Google Gemini API cost per active user (~$0.00065/verification)

---

## 🛡️ Safety & Privacy

- **Safety Gates** enforce PPE acknowledgment before risky steps
- **RED tier devices** (Xbox, Laptop) require extra safety confirmations
- **Minimal PII** collected; parent/teacher approval path for minors
- **HTTPS everywhere**; role-based access control via Supabase Auth
- AI-detected safety flags for hazardous components (e.g., swollen batteries)

---

## 🗺️ Roadmap

| Phase | Timeline | Goals |
|-------|----------|-------|
| **MVP (Hackathon)** | ✅ Now | 4 devices, AI verification, Donate/Sell/Recycle, Gamification |
| **Pilot (Phase 2)** | +1 month | 10 more devices, teacher dashboard, refined AI prompts |
| **Public Beta (Phase 3)** | +3 months | 50+ devices, payment integration, community-contributed guides |

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and intended for hackathon demonstration purposes.

---

<div align="center">

Built with ❤️ to close the loop on e-waste and open doors to STEM education.<br/>
**ReLoop** — *Dismantle. Learn. Reuse.*

</div>
