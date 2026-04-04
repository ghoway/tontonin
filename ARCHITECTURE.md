# 🎬 Nontonin - Streaming Platform Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NONTONIN FRONTEND                        │
│                                                              │
│  Browser (User Interface)                                   │
│  ├─ Home Page (/)                                           │
│  ├─ Drama List Pages (/dramabox, /reelshort, etc.)         │
│  └─ Drama Detail Pages (/dramabox/[bookId])                │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP Requests
                         │
┌────────────────────────▼────────────────────────────────────┐
│              NEXT.JS SERVER RENDERING                       │
│                                                              │
│  ├─ Layout Component                                        │
│  │  └─ Header (Logo, Search)                               │
│  │  └─ Navigation (Tabs)                                   │
│  │  └─ Main Content Area                                   │
│  │                                                          │
│  ├─ Pages                                                   │
│  │  ├─ Home (page.tsx)                                     │
│  │  ├─ Source Pages (dramabox/page.tsx, etc.)              │
│  │  └─ Detail Pages ([bookId]/page.tsx)                    │
│  │                                                          │
│  └─ Components                                              │
│     ├─ DramaCard (Reusable drama item)                     │
│     ├─ Section (Grid container)                            │
│     ├─ Header (Navigation bar)                             │
│     └─ Navigation (Source tabs)                            │
│                                                              │
│  Library (src/lib/api.ts)                                  │
│  └─ API Client Functions (30+)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTPS/Fetch
                         │
┌────────────────────────▼────────────────────────────────────┐
│            SANSEKAI API SERVER                              │
│       https://api.sansekai.my.id                           │
│                                                              │
│  ├─ DramaBox Endpoints                                      │
│  ├─ ReelShort Endpoints                                     │
│  ├─ ShortMax Endpoints                                      │
│  ├─ NetShort Endpoints                                      │
│  ├─ Melolo Endpoints                                        │
│  ├─ FreeReels Endpoints                                     │
│  └─ DramaNova Endpoints                                     │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
RootLayout
├── Header
│   ├── Logo (Image)
│   ├── App Name
│   └── Search Bar
├── Main Content
│   ├── Navigation (Source Tabs)
│   └── Content Sections
│       └── Suspense Boundaries
│           ├── LoadingSkeleton
│           └── Section
│               ├── Section Title
│               └── Grid of DramaCards
│                   └── DramaCard
│                       ├── Image
│                       ├── Title
│                       ├── Stats (Episodes, Views)
│                       └── Hover Effects
└── Footer (if added)
```

## Data Flow

```
Browser Request
    ↓
Next.js Server
    ↓
API Function Call (src/lib/api.ts)
    ↓
Fetch Request to Sansekai API
    ↓
Parse Response
    ↓
Map Fields (bookId → id, bookName → title, etc.)
    ↓
React Component Rendering
    ├─ Server-Side Render (HTML)
    ├─ Hydration on Client
    └─ Interactive UI
    ↓
Browser Display
    ├─ CSS Styling
    ├─ Hover Effects
    └─ Navigation
```

## Page Structure Example: /dramabox

```
/dramabox (DramaBoxPage)
├── Navigation Component
│   └─ Source Tabs (7 options)
├── Main Container
│   ├─ Section: "Untuk Kamu"
│   │  └─ 12 DramaCards
│   ├─ Section: "Terbaru"
│   │  └─ 12 DramaCards
│   └─ Section: "Trending"
│      └─ 12 DramaCards
└─ All within max-width container (1280px)
```

## Request/Response Example

### Request

```
GET /dramabox/foryou?page=1
Host: api.sansekai.my.id
```

### Response

```json
[
  {
    "bookId": "42000007806",
    "bookName": "Permainan Dimulai, Kubalas Semua",
    "coverWap": "https://...",
    "chapterCount": 80,
    "playCount": "5.7M",
    "introduction": "...",
    "tags": ["Perselingkuhan", "Serangan Balik"]
  }
  // ... more dramas
]
```

### Component Usage

```tsx
<DramaCard
  id={drama.bookId} // "42000007806"
  title={drama.bookName} // "Permainan Dimulai, Kubalas Semua"
  image={drama.coverWap} // "https://..."
  episodes={drama.chapterCount} // 80
  views={drama.playCount} // "5.7M"
  type="dramabox"
/>
```

## Styling System

```
Global Styles (globals.css)
├── Dark Theme
│   ├── Background: #000000
│   ├── Text: #ffffff
│   └── Accents: #0099ff (blue)
├── Scrollbar Styling
│   ├── Track: #09090b (dark)
│   └── Thumb: #3f3f46 → #52525b (hover)
└── Typography & Layout

Tailwind CSS Classes
├── Colors
│   ├── bg-black (background)
│   ├── text-white (text)
│   ├── bg-blue-600 (accents)
│   └── bg-zinc-* (grays)
├── Layout
│   ├── grid-cols-2 to 6 (responsive)
│   ├── max-w-7xl (container)
│   └── px-4 sm:px-6 lg:px-8 (padding)
├── Effects
│   ├── hover:scale-105 (hover)
│   ├── hover:opacity-100 (overlay)
│   └── animate-pulse (skeleton)
└── Spacing & Sizing
    ├── gap-4 (grid gaps)
    ├── h-60 (card height)
    └── text-sm/base/lg/xl/2xl/4xl (sizes)
```

## File Organization

```
nontonin/
│
├── src/
│   ├── app/                    (Next.js App Router)
│   │   ├── page.tsx            (Home - /)
│   │   ├── layout.tsx          (Root Layout)
│   │   ├── globals.css         (Global Styles)
│   │   └── [source]/           (Dynamic source pages)
│   │       ├── page.tsx        (List page)
│   │       └── [bookId]/page.tsx (Detail page)
│   │
│   ├── components/             (Reusable Components)
│   │   ├── Header.tsx          (Top navigation)
│   │   ├── Navigation.tsx      (Source selector)
│   │   ├── DramaCard.tsx       (Drama item)
│   │   └── Section.tsx         (Grid container)
│   │
│   └── lib/                    (Utilities)
│       └── api.ts              (API client)
│
├── docs/                       (Documentation)
│   └── api.yaml               (OpenAPI spec)
│
├── public/                    (Static assets)
│
├── .env                       (Environment variables)
├── package.json              (Dependencies)
├── tsconfig.json             (TypeScript config)
├── next.config.ts            (Next.js config)
└── README.md, etc.           (Documentation)
```

## API Integration Points

```
src/lib/api.ts (Central API Hub)
│
├─ getDramaBoxForYou(page)
├─ getDramaBoxLatest()
├─ getDramaBoxTrending()
├─ getDramaBoxDetail(bookId)
├─ ... (30+ functions)
│
└─ All functions:
   ├─ Fetch from NEXT_PUBLIC_API_URL
   ├─ Error handling (return null on failure)
   └─ Response mapping
```

## Responsive Design

```
Mobile (< 640px)
├─ grid-cols-2     (2 columns)
├─ px-4             (padding)
├─ Stack layout
└─ Touch optimized

Tablet (640px - 1024px)
├─ sm:grid-cols-3  (3 columns)
├─ sm:px-6          (padding)
└─ Balanced layout

Desktop (> 1024px)
├─ lg:grid-cols-5  (5+ columns)
├─ lg:px-8          (padding)
├─ Full width
└─ max-w-7xl max   (1280px container)
```

## Performance Optimizations

```
Server-Side Rendering (SSR)
└─ Fetch data on server
└─ Send HTML to client
└─ No loading delay

Image Fallbacks
└─ coverWap URL → Image
└─ Broken? → Placeholder
└─ No blank spaces

Loading Skeletons
└─ Show while fetching
└─ Better UX perception
└─ Animated pulse

Component Reusability
└─ DramaCard (9 pages)
└─ Section (all pages)
└─ Header (global)
└─ Navigation (global)
```

---

## Quick Reference

### To Access a Page

```
/ → Home (Latest dramas)
/dramabox → DramaBox source
/dramabox/42000007806 → Drama detail
/reelshort → ReelShort source
... (similar for other sources)
```

### To Call an API

```typescript
import { getDramaBoxForYou } from "@/lib/api";

const dramas = await getDramaBoxForYou(1);
```

### To Add a Component

```typescript
import { DramaCard } from '@/components/DramaCard';

<DramaCard
  id="123"
  title="Drama"
  image="url"
  type="dramabox"
/>
```

### To Style Elements

```tsx
className="bg-black text-white hover:bg-blue-600
           grid grid-cols-3 gap-4
           px-4 sm:px-6 lg:px-8"
```

---

This architecture provides:
✅ Clear separation of concerns  
✅ Reusable components  
✅ Centralized API management  
✅ Responsive design  
✅ Server-side rendering  
✅ Error handling  
✅ Scalability  
✅ Type safety

🚀 **Ready for deployment!**
