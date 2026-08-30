# WanderMatch — Complete Project Summary

## 🧭 What Is WanderMatch?
A **full-stack social travel planning platform** where groups collaboratively plan trips together in real time, vote on activities, and solo travellers can be matched to compatible groups. Built for a 24-hour hackathon.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + daisyUI + shadcn/ui |
| Database | MongoDB + Mongoose |
| Authentication | NextAuth.js v5 (Auth.js) |
| Real-time | Socket.IO (custom Node.js server) |
| Animations | Framer Motion |
| Creative Canvas | p5.js (`@p5-wrapper/next`) |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| Face Detection | `@vladmandic/face-api` (runs in-browser) |

---

## 📁 Project Structure

```
wandermatch/
├── server.mjs                  # Custom Node.js server (Next.js + Socket.IO)
├── scripts/seed.ts             # Database seeding script
├── public/models/              # face-api ML model weights (14 files)
└── src/
    ├── middleware.ts            # Route protection (auth guard)
    ├── lib/
    │   ├── auth.ts             # NextAuth server config (bcrypt, MongoDB)
    │   ├── auth.config.ts      # Edge-compatible auth config
    │   ├── db.ts               # Mongoose connection with pooling
    │   ├── mongodb.ts          # MongoDB client for NextAuth adapter
    │   ├── face-detection.ts   # face-api model loader + detector
    │   └── utils.ts            # cn() utility (clsx + tailwind-merge)
    ├── models/
    │   ├── User.ts             # User schema (profile, interests, travelStyle)
    │   ├── Trip.ts             # Trip schema (members, dates, inviteCode, tags)
    │   ├── ItineraryItem.ts    # Day-by-day activity items
    │   ├── Proposal.ts         # Group proposals with votes array
    │   └── Photo.ts            # Photo uploads with face descriptor data
    ├── hooks/
    │   ├── useSocket.ts        # Singleton Socket.IO client hook
    │   ├── useItinerary.ts     # Real-time itinerary state + API sync
    │   └── useVoting.ts        # Real-time proposals + vote state
    ├── components/
    │   ├── ui/                 # shadcn/ui components (Button, Card, Input, etc.)
    │   ├── layout/Navbar.tsx   # Top navigation bar
    │   ├── landing/Hero.tsx    # Landing hero with p5.js particle animation
    │   ├── trip/
    │   │   └── ItineraryEditor.tsx  # Kanban-style live itinerary board
    │   ├── voting/
    │   │   └── ProposalCard.tsx    # Upvote/downvote proposal UI
    │   ├── matching/
    │   │   └── MatchCard.tsx       # Compatibility score card (SVG ring)
    │   └── collage/
    │       └── PhotoUploader.tsx   # Photo uploader with in-browser face detection
    └── app/
        ├── layout.tsx              # Root layout (fonts, Navbar)
        ├── page.tsx                # Landing page
        ├── globals.css             # CSS variables, dark theme
        ├── (auth)/
        │   ├── login/page.tsx      # Login page
        │   └── register/page.tsx   # Register page
        ├── dashboard/page.tsx      # User's trips grid
        ├── explore/page.tsx        # Solo traveller matching page
        ├── trip/
        │   ├── create/page.tsx     # Trip creation form
        │   └── [tripId]/
        │       ├── page.tsx        # Trip detail + live itinerary editor
        │       ├── vote/page.tsx   # Proposals & voting page
        │       └── collage/page.tsx # Photo collage with face overlay
        └── api/
            ├── auth/[...nextauth]/ # Auth.js handler
            └── trips/
                ├── route.ts        # POST /api/trips (create trip)
                └── [tripId]/
                    ├── itinerary/route.ts  # POST/DELETE itinerary items
                    ├── proposals/route.ts  # POST proposals
                    ├── votes/route.ts      # POST votes
                    ├── photos/route.ts     # GET/POST trip photos
                    └── consensus/route.ts  # POST AI consensus planner
```

---

## ✅ Features Implemented

### Phase 1 — Project Setup & Auth
- Next.js 15 initialized with TypeScript and Tailwind CSS v4
- Custom `server.mjs` to run Next.js + Socket.IO in a single persistent Node.js process
- NextAuth.js v5 with Credentials provider, bcrypt password hashing, and MongoDB session storage
- Split auth config (Edge-compatible `auth.config.ts` + full `auth.ts`)
- Route protection via `middleware.ts`

### Phase 2 — Data Models
Five Mongoose schemas:
- **User** — name, email, password, image, travelProfile (interests, travelStyle, pace)
- **Trip** — name, destination, dates, members[], inviteCode, isPublic, tags, coverImage, status
- **ItineraryItem** — trip ref, day, title, category, description, order, addedBy
- **Proposal** — trip ref, title, description, category, status, votes[]
- **Photo** — trip ref, uploadedBy, url, faces[] (with bounding box + descriptor)

### Phase 3 — Landing Page & UI
- Dark-themed root layout with `Outfit` font from Google Fonts
- Navbar with auth-aware links (Login/Sign Up vs. Dashboard)
- Full-page Hero section with **live interactive p5.js particle animation** (SSR-safe with `NextReactP5Wrapper`)
- CTA buttons linking to trip creation and explore

### Phase 4 — Trip Management
- `/dashboard` — displays user's trips in an animated card grid with status badges
- `/trip/create` — form to create a trip with name, destination, date range, and public toggle
- `POST /api/trips` — creates a trip with a random 6-character invite code

### Phase 5 — Real-Time Collaborative Itinerary
- `/trip/[tripId]` — server-rendered trip detail page
- `ItineraryEditor` — Kanban-style board organized by Day (Day 1–5 columns)
- **Optimistic UI**: activities appear instantly before the server confirms
- Socket.IO room-based sync: adding/deleting an item broadcasts to all members viewing the same trip
- `useItinerary` hook manages local state, API calls, and real-time socket events
- `useSocket` hook: singleton Socket.IO client to avoid duplicate connections

### Phase 6 — Proposals & Voting
- `/trip/[tripId]/vote` — lists all open proposals for the trip
- `ProposalCard` — shows upvote/downvote buttons with animated counts, highlights the current user's vote
- `useVoting` hook manages real-time vote state over Socket.IO
- `POST /api/trips/[tripId]/proposals` — creates a proposal
- `POST /api/trips/[tripId]/votes` — casts/replaces a vote (one vote per user per proposal)

### Phase 7 — Solo Traveller Matching
- `/explore` — fetches all public trips the current user is NOT a member of
- Calculates a **compatibility score** (0–98%) based on overlap between the user's interests and the trip's tags, plus a small random jitter for demo variety
- `MatchCard` — animated card with an **SVG circular progress ring** showing the match score in green
- "Request to Join" CTA button

### Phase 8 — Photo Collage & Face Detection
- `/trip/[tripId]/collage` — masonry-style photo gallery
- `PhotoUploader` — reads the file locally, loads it into an `<Image>` element, and passes it to face-api
- `@vladmandic/face-api` ML models (14 files totalling ~50MB) copied to `/public/models/` so the browser can fetch them
- Detects **all faces** in each image using `ssdMobilenetv1`, extracts 128-dimensional face **descriptor embeddings**, and saves them with each photo in MongoDB
- On hover, green glowing bounding boxes appear over every detected face
- `isSamePerson()` utility for future face-grouping feature using Euclidean distance

### Phase 9 — AI Consensus Planner (Gemini)
- `POST /api/trips/[tripId]/consensus` — server-side Gemini API call
- Reads the trip's **current itinerary** and all **open/accepted proposals** from the database
- Crafts a detailed prompt asking Gemini 2.5 Flash to produce an optimized JSON itinerary
- Response is parsed and each suggested item is added to the live board
- **"Generate AI Consensus Plan"** button in the Itinerary Editor triggers this with a glowing gradient style

### Phase 10 — Polish & Animations
- Framer Motion `layout` + `AnimatePresence` on all dynamic lists (itinerary items, photos, proposals)
- Card hover states: translate-up, purple glow border, image scale zoom
- AI button: multi-stop gradient + `shadow-[0_0_15px_...]` glow effect
- Face bounding boxes appear with CSS `opacity` transition and green drop-shadow glow
- Matching score ring draws with a CSS transition on `strokeDashoffset`

---

## 🌐 Pages / Routes at a Glance

| URL | Description |
|---|---|
| `/` | Landing page with p5.js hero |
| `/login` | Login with email + password |
| `/register` | New account registration |
| `/dashboard` | Your trips grid |
| `/explore` | Solo traveller matching (public trips) |
| `/trip/create` | Create a new trip |
| `/trip/[id]` | Real-time collaborative itinerary |
| `/trip/[id]/vote` | Group proposals & voting |
| `/trip/[id]/collage` | Photo collage with face detection |

---

## 🗄️ Seeded Test Data

Run `npm run seed` to populate the database with:
- **alex@example.com** / password123 (interests: hiking, culture, food)
- **sam@example.com** / password123 (interests: beach, party, food)
- **Summer in Kyoto** trip (public, invite code: `KYOTO26`)
- 3 pre-loaded itinerary items across Day 1 and Day 2
- 1 open proposal ("Nara Day Trip") with 2 upvotes

---

## ⚙️ Configuration Required (`.env.local`)

```env
MONGODB_URI=mongodb://127.0.0.1:27017/wandermatch   # or your Atlas URI
AUTH_SECRET=a_very_secure_random_string_for_nextauth_v5
PORT=3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=your_google_gemini_api_key_here       # ← ADD THIS!
```

---

## 🔴 What Is NOT Implemented (Out of Scope)
- Admin panel / admin user role
- Join request approval flow (the "Request to Join" button is UI-only)
- OAuth providers (Google/GitHub) — credentials only
- Production deployment / Dockerfile
- Trip-level chat / group messaging
- Push notifications
- Mobile-responsive polish (works, but not optimized for small screens)
