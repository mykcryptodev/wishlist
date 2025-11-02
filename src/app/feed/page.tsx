import { WishlistFeed } from "@/components/wishlist/feed";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-outlined">
              Community Wishlist Feed
            </h1>
            <p className="text-muted-foreground text-lg">
              See what people around the world are wishing for
            </p>
          </div>

          <WishlistFeed />
        </div>
      </main>
    </div>
  );
}
