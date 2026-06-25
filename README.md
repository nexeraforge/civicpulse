# 📍 CivicPulse

> **Every Citizen Matters. Every Problem Counts.**
> CivicPulse is a modern, community-driven civic solver application designed to bridge the gap between residents and local municipal teams. By enabling citizens to report issues, verify resolutions, and track progress geospacially, we build safer and cleaner neighborhoods together.

---

## 🚀 Key Features

*   **Interactive Geospatial Mapping**: A real-time leaflet street map displaying category-coded pins of hazards and infrastructure reports.
*   **AI Severity & Impact Telemetry**: Powered by simulated Gemini intelligence to automatically categorize issues, estimate traffic/public safety risk levels, and recommend action steps for municipal response.
*   **Structured Reporting Wizard**: A beautiful step-by-step reporting guide that allows citizens to search addresses, pin maps, and upload photographic evidence.
*   **Community Verification & Gamification**: A feedback loop where neighbors can "praise" tickets to increase priority, discuss solutions via comments, and verify resolutions once authorities apply a fix.
*   **Gamified Reputation Points**: Users earn points for reporting hazards (+20 pts), commenting (+5 pts), and verifying fixes (+25 pts) to rise up the public leaderboard.
*   **Realtime Postgres Syncing**: Device synchronization leveraging Supabase Realtime Channels.
*   **OAuth & Guest Demo Login**: Built-in Google authentication combined with an immediate "Guest Mode" for ease of evaluation.

---

## 🛠️ Technology Stack

*   **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion (for smooth micro-animations).
*   **Charts & Telemetry**: Recharts (interactive telemetry diagrams).
*   **Mapping**: Leaflet / React-Leaflet (falls back to OpenStreetMap dynamically).
*   **Backend & DB**: Supabase (PostgreSQL, Auth, Storage, and Realtime).
*   **State Management**: Zustand (reactive local store with optimistic UI updates).
*   **Linting**: Oxlint (ultra-fast compilation check).

---

## 💾 Supabase Database Schema

CivicPulse relies on two main tables in Supabase:

### `users`
Tracks citizen profiles, reputation points, and contribution metrics.
```sql
CREATE TABLE public.users (
    id TEXT PRIMARY KEY, -- Maps to Supabase auth.users.id
    name TEXT NOT NULL,
    photoURL TEXT,
    reputation INTEGER DEFAULT 0,
    "totalReports" INTEGER DEFAULT 0,
    "resolvedReports" INTEGER DEFAULT 0,
    "joinedDate" TEXT NOT NULL
);
```

### `reports`
Tracks civic issue details, geographic data, and community comments.
```sql
CREATE TABLE public.reports (
    id TEXT PRIMARY KEY, -- e.g., 'rep-17189...'
    "userId" TEXT REFERENCES public.users(id),
    username TEXT,
    "userPhoto" TEXT,
    "userReputation" INTEGER,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    location TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    praises INTEGER DEFAULT 0,
    "praisedBy" JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Active',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    comments JSONB DEFAULT '[]'::jsonb,
    resolution JSONB,
    "aiAnalysis" JSONB
);
```

---

## ⚙️ Getting Started

### 1. Clone the project and install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file in the root directory and specify your Supabase project credentials (you can copy `.env.example` as a template):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run the development server
```bash
npm run dev
```

---

## 🌟 Hackathon Evaluation Guide

For judges reviewing this submission:
1. When running the app locally, you will be directed to the **Login Screen**.
2. Click **Enter as Guest (Demo Mode)**. This will bypass OAuth setup and log you in using a pre-configured demo account.
3. Check the **Dashboard** page to view live telemetry and category statistics of active issues.
4. Try reporting a new issue on the **Report** page using the Leaflet geocoding address search and interactive map pins.
5. In the **Explore Feed**, you can like/praise reports, read comments, and view simulated AI impact telemetry on individual tickets.
