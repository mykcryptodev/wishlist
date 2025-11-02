# Wishlist Feed Integration Examples

## Quick Start

The feed is ready to use! Visit `/feed` to see it in action.

## Integration Options

### Option 1: Add to Home Page

Add the feed to your home page (`src/app/page.tsx`) to show recent community wishes:

```tsx
import { WishlistFeed } from "@/components/wishlist/feed";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Your existing hero section */}
      <section className="container mx-auto px-4 py-16">
        <h1>Welcome to Wishlist</h1>
        {/* ... */}
      </section>

      {/* Add the feed */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <WishlistFeed />
      </section>
    </div>
  );
}
```

### Option 2: Add to Navigation

Update `src/components/navigation.tsx` to include a link to the feed:

```tsx
<Link href="/feed">
  <Button variant="ghost">
    <Sparkles className="h-4 w-4 mr-2" />
    Feed
  </Button>
</Link>
```

### Option 3: Compact Feed Widget

Create a smaller feed widget for sidebars:

```tsx
import { useWishlistFeed } from "@/hooks/useWishlistFeed";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function CompactFeed() {
  const { data, isLoading } = useWishlistFeed(1, 5); // Only show 5 items

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Recent Wishes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data?.items.slice(0, 5).map(item => (
            <div key={item.itemId} className="text-sm">
              <Link href={`/users/${item.owner}`} className="hover:underline">
                {item.title}
              </Link>
            </div>
          ))}
        </div>
        <Link
          href="/feed"
          className="text-sm text-primary hover:underline mt-4 block"
        >
          View all →
        </Link>
      </CardContent>
    </Card>
  );
}
```

### Option 4: Hero Section with Live Feed

Combine the feed with your hero section on the WISH page:

```tsx
import { WishlistFeed } from "@/components/wishlist/feed";

export default function WishPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Existing content */}
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* ... your existing sections ... */}

        {/* Add feed at the end */}
        <section className="mt-16">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-semibold text-outlined">
              Recent Community Wishes
            </h2>
            <p className="text-muted-foreground">
              See what others are wishing for this season
            </p>
          </div>
          <WishlistFeed />
        </section>
      </main>
    </div>
  );
}
```

## Custom Implementations

### Show Only User's Items

```tsx
import { useWishlistFeed } from "@/hooks/useWishlistFeed";

function MyWishesFeed({ userAddress }: { userAddress: string }) {
  const { data, isLoading } = useWishlistFeed(1, 50);

  const myItems = data?.items.filter(
    item => item.owner.toLowerCase() === userAddress.toLowerCase(),
  );

  return (
    <div>
      <h3>My Recent Wishes</h3>
      {myItems?.map(item => (
        <div key={item.itemId}>{item.title}</div>
      ))}
    </div>
  );
}
```

### Show Last 24 Hours

```tsx
import { useWishlistFeed } from "@/hooks/useWishlistFeed";

function RecentWishesFeed() {
  const { data, isLoading } = useWishlistFeed(1, 100);

  const oneDayAgo = Date.now() / 1000 - 86400;
  const recentItems = data?.items.filter(
    item => parseInt(item.blockTimestamp) > oneDayAgo,
  );

  return (
    <div>
      <h3>Wishes from the last 24 hours</h3>
      {recentItems?.length === 0 ? (
        <p>No wishes in the last 24 hours</p>
      ) : (
        recentItems?.map(item => <div key={item.itemId}>{item.title}</div>)
      )}
    </div>
  );
}
```

### Infinite Scroll Version

```tsx
import { useWishlistFeed } from "@/hooks/useWishlistFeed";
import { useState, useEffect } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver"; // You'll need to create this

function InfiniteFeed() {
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<any[]>([]);
  const { data, isLoading } = useWishlistFeed(page, 20);

  const { ref, inView } = useIntersectionObserver({
    threshold: 0.1,
  });

  useEffect(() => {
    if (data?.items) {
      setAllItems(prev => [...prev, ...data.items]);
    }
  }, [data]);

  useEffect(() => {
    if (inView && !isLoading && data?.pagination.hasMore) {
      setPage(p => p + 1);
    }
  }, [inView, isLoading, data?.pagination.hasMore]);

  return (
    <div>
      {allItems.map(item => (
        <div key={`${item.transactionHash}-${item.itemId}`}>{item.title}</div>
      ))}
      {data?.pagination.hasMore && (
        <div ref={ref} className="py-4 text-center">
          Loading more...
        </div>
      )}
    </div>
  );
}
```

## Styling Variations

### Minimal Card Style

```tsx
<Card className="border-none shadow-none bg-transparent">
  <WishlistFeed />
</Card>
```

### Grid Layout

```tsx
import { useWishlistFeed } from "@/hooks/useWishlistFeed";

function GridFeed() {
  const { data } = useWishlistFeed(1, 20);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.items.map(item => (
        <Card key={item.itemId}>
          <CardHeader>
            <CardTitle className="text-base">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              by {item.owner.slice(0, 6)}...{item.owner.slice(-4)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Real-time Updates

For real-time updates, you can add polling:

```tsx
import { useWishlistFeed } from "@/hooks/useWishlistFeed";
import { useEffect } from "react";

function LiveFeed() {
  const { data, refetch } = useWishlistFeed(1, 20);

  // Refetch every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  return <WishlistFeed />;
}
```

## Best Practices

1. **Caching**: The hook already implements smart caching. Don't disable it unless necessary.

2. **Pagination**: Start with reasonable limits (20-50 items). Larger limits can slow down the API.

3. **Error Handling**: Always show user-friendly error messages. The component handles this by default.

4. **Loading States**: Use skeletons or spinners during initial load for better UX.

5. **Timestamps**: Relative timestamps ("2h ago") are more user-friendly than absolute dates.

## Testing

```bash
# Start the development server
npm run dev

# Visit the feed page
open http://localhost:3000/feed

# Test API endpoint directly
curl http://localhost:3000/api/wishlist/feed?page=1&limit=10
```

## Next Steps

1. Add the feed to your home page for immediate visibility
2. Create a "Trending" section showing most wished items
3. Add filtering by date or user
4. Implement notifications for new wishes
5. Show rich previews of product links
