# API Response Structure Reference

## DramaBox Response Format

### GET `/dramabox/foryou?page=1`

Returns an array of drama objects:

```typescript
interface Drama {
  // IDs and Identifiers
  bookId: string; // Unique drama ID (e.g., "42000007806")

  // Content Information
  bookName: string; // Drama title
  introduction: string; // Plot synopsis/description
  coverWap: string; // Poster/cover image URL
  chapterCount: number; // Total number of episodes

  // Metadata
  tags: string[]; // Genre tags (e.g., ["Perselingkuhan", "Serangan Balik"])
  tagV3s: TagDetail[]; // Detailed tag information

  // Engagement Metrics
  playCount: string; // View count (e.g., "5.7M", "537K")

  // UI/Display Info
  corner?: {
    cornerType: number;
    name: string; // e.g., "Terpopuler"
    color: string; // Hex color
  };

  rankVo?: {
    rankType: number;
    hotCode: string; // Popularity code
    recCopy: string; // Display text (e.g., "Sedang Tren TOP 1")
  };

  // Timestamps
  bookShelfTime: number; // Unix timestamp
  shelfTime: string; // Formatted date
  inLibrary: boolean; // Whether user has bookmarked
}

interface TagDetail {
  tagId: number;
  tagName: string; // Indonesian tag name
  tagEnName: string; // English tag name
}
```

### GET `/dramabox/detail?bookId=42000007806`

Returns detailed information about a single drama:

```typescript
interface DramaDetail extends Drama {
  synopsis: string; // Extended description
  rating?: number; // Rating (0-10)
  year?: number; // Release year
  genre?: string; // Genre string
  // ... all Drama fields
}
```

## Field Mapping in Components

| API Field      | Component Usage                           | Example                                    |
| -------------- | ----------------------------------------- | ------------------------------------------ |
| `bookId`       | Drama ID for routing                      | `"42000007806"`                            |
| `bookName`     | Card title, page title                    | `"Permainan Dimulai, Kubalas Semua"`       |
| `coverWap`     | Card image, detail poster                 | `"https://hwztchapter.dramaboxdb.com/..."` |
| `chapterCount` | Episode count display                     | `80`                                       |
| `playCount`    | View count display                        | `"5.7M"`                                   |
| `introduction` | Card synopsis (optional), detail synopsis | Text                                       |
| `tags`         | Genre badges                              | `["Perselingkuhan", "Serangan Balik"]`     |

## Example Raw Response

```json
{
  "bookId": "42000007806",
  "bookName": "Permainan Dimulai, Kubalas Semua",
  "coverWap": "https://hwztchapter.dramaboxdb.com/data/cppartner/4x2/42x0/420x0/42000007806/42000007806.jpg",
  "chapterCount": 80,
  "introduction": "Putrinya Eni, ketua dewan Grup Sinar...",
  "tags": ["Perselingkuhan", "Serangan Balik", "Keadilan"],
  "tagV3s": [
    {
      "tagId": 1400,
      "tagName": "Perselingkuhan",
      "tagEnName": "Betrayal"
    }
  ],
  "playCount": "5.7M",
  "corner": {
    "cornerType": 1,
    "name": "Terpopuler",
    "color": "#F54E96"
  },
  "bookShelfTime": 1774260000000,
  "shelfTime": "2026-03-23 18:00:00"
}
```

## Data Transformation in Code

When fetching from API:

```typescript
// Raw API response
const apiData = await getDramaBoxForYou(1);
// Result: Drama[]

// Component mapping
dramas.map(drama => (
  <DramaCard
    id={drama.bookId}                    // bookId → id
    title={drama.bookName}               // bookName → title
    image={drama.coverWap}               // coverWap → image
    episodes={drama.chapterCount}        // chapterCount → episodes
    views={drama.playCount}              // playCount → views
    type="dramabox"
  />
))
```

## API Endpoints Used

- `GET /dramabox/foryou?page=1` - For You recommendations
- `GET /dramabox/latest` - Latest dramas
- `GET /dramabox/trending` - Trending dramas
- `GET /dramabox/detail?bookId={id}` - Drama details
- `GET /dramabox/search?query={q}` - Search dramas
- Similar endpoints for: `/reelshort`, `/shortmax`, `/netshort`, `/melolo`, `/freereels`, `/dramanova`

## Rate Limiting

- **Limit**: 50 requests per minute
- **Header**: Check `X-RateLimit-*` headers in response

## Error Handling

If API request fails:

1. Function returns `null`
2. Component shows fallback/error message
3. Automatic placeholder images for broken URLs

---

For more details, check the Swagger/OpenAPI documentation at `docs/api.yaml`
