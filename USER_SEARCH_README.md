# User Search Feature

This feature allows users to search for other Farcaster users using the Neynar API.

## Setup

### 1. Get a Neynar API Key

1. Visit [Neynar](https://neynar.com/) and sign up for an account
2. Navigate to your dashboard and create a new API key
3. Copy the API key

### 2. Configure Environment Variables

Add your Neynar API key to your `.env.local` file:

```bash
NEYNAR_API_KEY=your_api_key_here
```

You can also see the example in `env.example`:

```bash
# Neynar (Farcaster)
NEYNAR_API_KEY=
```

## Features

### API Endpoint

**Endpoint**: `GET /api/users/search`

**Query Parameters**:

- `q` (required): Search query string
- `limit` (optional): Number of results to return (default: 10, max: 10, min: 1)
  - Note: Neynar API restricts results to 10 per request
- `cursor` (optional): Pagination cursor for loading more results

**Example Response**:

```json
{
  "users": [
    {
      "fid": 123,
      "username": "example",
      "display_name": "Example User",
      "pfp_url": "https://...",
      "profile": {
        "bio": {
          "text": "User bio"
        }
      },
      "follower_count": 1000,
      "following_count": 500,
      "power_badge": true,
      "verified_addresses": {
        "eth_addresses": ["0x..."]
      }
    }
  ],
  "nextCursor": "cursor_string_for_pagination"
}
```

### User Search Component

The `UserSearch` component provides a fully-featured search interface with:

- Real-time search with debouncing (300ms delay)
- Loading states and skeleton loaders
- Error handling
- Pagination with "Load More" functionality
- User profiles with avatars, bios, and stats
- Power badge indicators
- Verified address counts

**Usage**:

```tsx
import { UserSearch } from "@/components/user-search";

function MyComponent() {
  const handleUserSelect = user => {
    console.log("Selected user:", user);
    // Navigate to user's profile, wishlist, etc.
  };

  return (
    <UserSearch
      onUserSelect={handleUserSelect}
      placeholder="Search for users..."
      showBio={true}
    />
  );
}
```

**Props**:

- `onUserSelect?: (user: User) => void` - Callback when a user is clicked
- `placeholder?: string` - Search input placeholder text
- `showBio?: boolean` - Whether to show user bios in results (default: true)
- `className?: string` - Additional CSS classes

### User Search in Navigation

**Desktop**: The search bar in the navigation navigates to the `/users` page for a full-page search experience.

**Mobile**: Tapping the search icon opens a dialog with inline search results for quick access.

Both methods provide the same powerful search functionality powered by the Neynar API.

## Integration Examples

### Navigate to User Profile

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();

const handleUserSelect = user => {
  router.push(`/profile/${user.fid}`);
};
```

### Filter by Username

You can customize the API call to add more filters if needed by modifying the API route.

## Technical Details

### API Integration

The feature uses the Neynar v2 Farcaster API:

- Endpoint: `https://api.neynar.com/v2/farcaster/user/search`
- Authentication: API key via `x-api-key` header
- Documentation: [Neynar API Docs](https://docs.neynar.com/)

### Caching with Redis

Search results are cached in Redis to minimize API calls and improve performance:

- **Cache Key Format**: `user-search:{query}` or `user-search:{query}:{cursor}` for paginated results
- **TTL**: 5 minutes (300 seconds) - balances freshness with API efficiency
- **Benefits**:
  - Reduces Neynar API usage and costs
  - Faster response times for repeated searches
  - Better user experience with instant results
- **Cache Invalidation**: Results automatically expire after 5 minutes, or can be manually cleared using utility functions

**Cache Utilities** (`src/lib/cache-utils.ts`):

```typescript
// Invalidate specific search
await invalidateUserSearchCache("username");

// Clear all user search caches
await invalidateAllUserSearchCaches();
```

**Note**: The API works gracefully without Redis - if Redis is not configured, it simply fetches from Neynar every time.

### Component Architecture

```
/src
  /app
    /api
      /users
        /search
          route.ts          # API route handler
    /users
      page.tsx             # User search page
  /components
    user-search.tsx        # Reusable search component
```

### Security

- API key is stored as an environment variable (never exposed to client)
- All API calls are routed through Next.js API routes
- Rate limiting and error handling built-in

## Troubleshooting

### "Neynar API key is not configured" Error

Make sure you've:

1. Added `NEYNAR_API_KEY` to your `.env.local` file
2. Restarted your development server after adding the environment variable

### No Results Found

- Check that the Neynar API key is valid
- Ensure the user you're searching for exists on Farcaster
- Try different search queries (usernames are case-insensitive)

### API Rate Limits

Neynar may have rate limits on their API. If you encounter rate limit errors:

- **Redis caching is already implemented** - configure Redis to reduce API calls significantly
- Add rate limiting on your API route for additional protection
- Consider upgrading your Neynar plan for higher limits

### Redis Configuration (Optional but Recommended)

While the feature works without Redis, enabling it provides significant benefits:

1. Add Redis credentials to `.env.local`:

   ```bash
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   ```

2. Get free Redis from [Upstash](https://upstash.com/) or use any Redis provider

3. With Redis enabled:
   - Search results are cached for 5 minutes
   - Repeated searches are instant
   - Neynar API usage is reduced by up to 90%
   - Better performance and lower costs

## Future Enhancements

Potential improvements:

- Add filters (verified users only, power badge holders, etc.)
- Add recent search history
- Show mutual followers/following
- Display user's recent casts
- Add user profile pages with wishlists
- Implement advanced search with multiple criteria
