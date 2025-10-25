import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WishlistDirectory } from "@/components/wishlist/wishlist-directory";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Christmas decorative elements */}
      <div className="absolute top-20 left-10 text-6xl opacity-10 rotate-12 select-none pointer-events-none">
        🎄
      </div>
      <div className="absolute top-40 right-20 text-5xl opacity-10 -rotate-12 select-none pointer-events-none">
        ⛄
      </div>
      <div className="absolute bottom-40 left-1/4 text-4xl opacity-10 rotate-45 select-none pointer-events-none">
        🎅
      </div>
      <div className="absolute bottom-60 right-1/3 text-5xl opacity-10 -rotate-45 select-none pointer-events-none">
        🎁
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center py-16">
          <div className="mb-4 flex justify-center items-center gap-4">
            <span className="text-5xl animate-bounce">🎄</span>
            <h1 className="text-4xl md:text-6xl font-bold text-christmas-gradient">
              Holiday Wishlist
            </h1>
            <span
              className="text-5xl animate-bounce"
              style={{ animationDelay: "0.2s" }}
            >
              🎁
            </span>
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            ✨ Create your magical holiday wishlist this Christmas! ✨
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Add items from any website, organize your favorites, and share with
            family and friends to make gift-giving merry and bright!
          </p>

          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/wishlist">
              <Button
                className="text-lg px-8 btn-christmas shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                size="lg"
              >
                🎅 Create Wishlist
              </Button>
            </Link>
            <Link href="/exchanges">
              <Button
                className="text-lg px-8 btn-christmas shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                size="lg"
                variant="outline"
              >
                🎄 Secret Santa Exchange
              </Button>
            </Link>
          </div>

          {/* Festive tagline */}
          <div className="mt-8 text-sm text-muted-foreground italic">
            🌟 Making spirits bright, one wish at a time 🌟
          </div>
        </div>

        {/* Wishlist Directory Section */}
        <div className="py-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-christmas-gradient">
              🎁 Explore Wishlists 🎁
            </h2>
            <p className="text-muted-foreground">
              Browse wishlists from our community and find the perfect gift
              ideas
            </p>
          </div>
          <WishlistDirectory description="" maxItems={6} title="" />
        </div>

        {/* Christmas message */}
        <div className="text-center py-8 mb-8">
          <div className="max-w-2xl mx-auto p-6 rounded-lg bg-card/50 backdrop-blur-sm border-2 border-accent/30 shadow-xl">
            <p className="text-lg font-medium text-christmas-gradient mb-2">
              🎅 Ho Ho Ho! Merry Christmas! 🎄
            </p>
            <p className="text-sm text-muted-foreground">
              May your holidays be filled with joy, laughter, and all the gifts
              on your wishlist!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
