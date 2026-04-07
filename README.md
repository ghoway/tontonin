# Nontonin

Nontonin is a multi-source short drama streaming web app built with Next.js, TypeScript, and Tailwind CSS.

This README is the primary project documentation.

The app uses a dark cinematic UI with violet-indigo gradients, smooth watch interactions, and a simple media-player icon style.

## Features

- Multi-source browsing: DramaBox, ReelShort, ShortMax, NetShort, Melolo, FreeReels, and DramaNova
- Responsive grid and watch experience for desktop and mobile
- Episode navigation in watch player with auto-hide controls
- Search and detail pages per provider
- Video loading overlay with centered spinner and status text
- Error states and fallbacks for unavailable streams
- Favicon generated from the same logo style used in the header ([src/app/icon.tsx](src/app/icon.tsx))
- Melolo "Untuk Kamu" thumbnails use `thumb_url` rewritten to a browser-friendly JPG source

## Theme and Color Styling

Current visual direction:

- Base background: black (#000000)
- Foreground text: white (#ffffff)
- Accent family: violet to indigo gradients with zinc neutrals
- Global tokens live in [src/app/globals.css](src/app/globals.css)

Logo and favicon styling:

- Rounded square gradient block (violet to indigo)
- White play symbol centered
- Matches the header logo visual identity

Video loading overlay styling:

- Circular spinner ring with violet-indigo accent
- Centered loading title and helper subtitle
- Designed for strong contrast on dark watch pages

## Installation

1. Install dependencies:

```bash
pnpm install
```

Alternative package managers:

```bash
npm install
# or
yarn install
```

2. Start development server:

```bash
pnpm dev
```

3. Open http://localhost:3000

## Key Paths

- App favicon generator: [src/app/icon.tsx](src/app/icon.tsx)
- Header logo UI: [src/components/Header.tsx](src/components/Header.tsx)
- Watch loading overlay: [src/components/WatchClient.tsx](src/components/WatchClient.tsx)
- Global theme tokens: [src/app/globals.css](src/app/globals.css)
- Melolo thumbnail handling: [src/app/melolo/page.tsx](src/app/melolo/page.tsx)

## Production

```bash
pnpm build
pnpm start
```

## Configuration

Environment variables:

```env
NEXT_PUBLIC_APP_NAME="Nontonin"
NEXT_PUBLIC_API_URL="https://api.sansekai.my.id/"
```

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React

## Notes

- The temporary image proxy route is no longer used.
- Melolo For You cards now point directly to the JPG rendition derived from `thumb_url`.

## Acknowledgements

Special thanks to Sansekai for providing the API powering this project.
