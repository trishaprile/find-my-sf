# find my sf

A Next.js application built with TypeScript for discovering events in San Francisco.

## Features

- Event discovery and browsing
- Category filtering (Market, Workshop, Arts & Crafts, Outdoor, Social, Music, Tech, Exhibit, Hobby)
- Admin panel for managing events
- Automatic removal of past events
- Responsive design for mobile and desktop

## Tech Stack

- Next.js 14
- TypeScript
- React 18
- CSS Modules
- Gaegu & DynaPuff fonts
- Lucide React icons

## Getting Started

First, install the dependencies:

```bash
npm install
```

Create a `.env.local` file in the root directory and add your admin password:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and set your password:

```
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password_here
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Admin Panel

The admin panel is password protected. Access it at [http://localhost:3000/admin](http://localhost:3000/admin) using the password set in your `.env.local` file.

Features:

- Add new events (with required fields: title, start date, time, location, link)
- Edit existing events
- Delete events
- Clean up past events with one click
- Manage event categories, dates, prices, and details
- Time picker with AM/PM selection

Events are stored in `.data/events.json` and persist across restarts. Past events are automatically hidden from the main page but remain visible in the admin panel until manually cleaned up.

## Build for Production

```bash
npm run build
npm start
```
