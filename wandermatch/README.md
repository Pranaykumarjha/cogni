# WanderMatch

WanderMatch is a collaborative travel planning and trip-matching web app built with Next.js, MongoDB, Socket.IO, and NextAuth. It helps users plan trips, vote on proposals, share packing lists, chat in real time, and manage trip logistics with a modern travel experience.

## Overview

This project includes:

- User authentication and registration
- Trip creation and membership management
- Real-time trip chat and updates via Socket.IO
- Itinerary editing and proposal voting
- Expense splitting and packing lists
- Photo uploads and trip collage support
- AI-assisted trip features using Gemini
- Mock travel data endpoints for flights and hotels

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- MongoDB + Mongoose
- NextAuth v5
- Socket.IO
- Tailwind CSS
- Gemini API
- RapidAPI-based mock travel data

## Prerequisites

Before running the app, make sure you have:

- Node.js 20+ recommended
- npm installed
- A MongoDB instance running locally or in the cloud
- A Google Gemini API key
- A RapidAPI key if you want the mock flight/hotel endpoints to work

## Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd wandermatch
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env.local` file in the project root

```env
MONGODB_URI=mongodb://127.0.0.1:27017/wandermatch
AUTH_SECRET=change-this-to-a-long-random-secret
NEXTAUTH_SECRET=change-this-to-a-long-random-secret
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your-google-gemini-api-key
RAPIDAPI_KEY=your-rapidapi-key
```

Important:

- `MONGODB_URI` is required for database access.
- `AUTH_SECRET` / `NEXTAUTH_SECRET` are required for auth session security.
- `GEMINI_API_KEY` is required for AI-powered trip features.
- `RAPIDAPI_KEY` is required for the mock travel API routes.
- `AUTH_TRUST_HOST=true` helps when running locally or behind a reverse proxy.

If you are using a local MongoDB instance, start MongoDB first before launching the app.

## Running the App

### Development mode

```bash
npm run dev
```

The app runs through a custom server (`server.mjs`) and listens on:

- http://localhost:3000

### Production build

```bash
npm run build
npm run start
```

## Database Seeding

This project includes a seed script for demo/mock data:

```bash
npm run seed
```

Use this to populate sample trip and user data during development.

## Project Scripts

```bash
npm run dev     # Start development server
npm run build   # Build production app
npm run start   # Start production server
npm run lint    # Run ESLint
npm run seed    # Seed demo data
```

## Important Notes

- The app uses a custom server (`server.mjs`) instead of the default Next.js dev server, so run commands from the project root and avoid using `next dev` for the real socket-enabled setup.
- Real-time chat and trip updates depend on Socket.IO, which is initialized in `server.mjs`.
- Without environment variables, the app will fail at runtime because the code reads them directly in the authentication and API layers.
- For deployments, make sure your hosting environment includes the same environment variables as `.env.local`.
- If you are using MongoDB Atlas or another hosted database, replace the local connection string with your remote URI.

## Troubleshooting

### MongoDB connection errors

Check that:

- MongoDB is running
- `MONGODB_URI` is correct
- Your database user has permission to the target database

### Authentication issues

Check that:

- `AUTH_SECRET` and/or `NEXTAUTH_SECRET` are set
- `NEXTAUTH_URL` points to your correct local or production URL
- `AUTH_TRUST_HOST=true` is set when needed

### AI or travel API errors

Check that:

- `GEMINI_API_KEY` is valid
- `RAPIDAPI_KEY` is valid
- The API services are available and not rate-limited

## License

This project is intended for local development and learning purposes unless you are explicitly told otherwise by the repository owner.

## Contributing

If you want to contribute, follow the normal Git workflow:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```
