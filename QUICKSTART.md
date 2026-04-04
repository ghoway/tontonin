# 🚀 Quick Start Guide - Nontonin

## Prerequisites

- Node.js 18+ installed
- pnpm, npm, or yarn package manager

## Installation

```bash
# Clone or navigate to the project directory
cd /home/way/Documents/coding/nontonin

# Install dependencies
pnpm install
# or: npm install
# or: yarn install
```

## Environment Setup

The `.env` file is already configured:

```env
NEXT_PUBLIC_APP_NAME="Nontonin"
NEXT_PUBLIC_API_URL="https://api.sansekai.my.id/"
```

## Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically reload when you make changes.

## Project Routes

| Route                | Description          |
| -------------------- | -------------------- |
| `/`                  | Home (Latest dramas) |
| `/dramabox`          | DramaBox source      |
| `/dramabox/[bookId]` | Drama detail page    |
| `/reelshort`         | ReelShort source     |
| `/shortmax`          | ShortMax source      |
| `/netshort`          | NetShort source      |
| `/melolo`            | Melolo source        |
| `/freereels`         | FreeReels source     |
| `/dramanova`         | DramaNova source     |

## Key Components

### DramaCard

Displays a drama item with:

- Poster image
- Title
- Episode count
- View count
- Hover effects

Usage:

```tsx
<DramaCard
  id="bookId"
  title="Drama Name"
  image="https://..."
  episodes={12}
  views="1.2M"
  type="dramabox"
/>
```

### Navigation

Source selector tabs (DramaBox, ReelShort, etc.)

### Section

Container for displaying multiple drama cards in a grid.

```tsx
<Section title="Trending">{/* Drama cards here */}</Section>
```

## API Usage

All API calls go through `src/lib/api.ts`:

```typescript
import { getDramaBoxForYou, getDramaBoxDetail } from "@/lib/api";

// Get list of dramas
const dramas = await getDramaBoxForYou(1);

// Get drama detail
const detail = await getDramaBoxDetail("bookId");
```

## Building for Production

```bash
# Create optimized build
pnpm build

# Preview production build
pnpm start
```

## Troubleshooting

### Port 3000 already in use?

```bash
pnpm dev -- -p 3001
```

### API not responding?

- Check your internet connection
- Verify `NEXT_PUBLIC_API_URL` in `.env`
- The API has a rate limit of 50 requests/minute

### Images not loading?

- Check image URL validity
- The app automatically falls back to a placeholder

## File Structure Quick Reference

- `src/app/` - Next.js pages and layouts
- `src/components/` - Reusable React components
- `src/lib/api.ts` - API client functions
- `public/` - Static assets
- `.env` - Environment variables

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Sansekai API](https://api.sansekai.my.id)

---

**Happy streaming! 🎬**
