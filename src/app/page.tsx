import Image from "next/image";
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
            <span
              className="text-5xl"
              style={{
                display: "inline-block",
                animation:
                  "subtle-bounce 1.5s infinite alternate cubic-bezier(.4,0,.2,1)",
              }}
            >
              🎄
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-christmas-gradient">
              Holiday Wishlist
            </h1>
            <span
              className="text-5xl"
              style={{
                display: "inline-block",
                animation:
                  "subtle-bounce 1.5s infinite alternate cubic-bezier(.4,0,.2,1)",
                animationDelay: "0.75s",
              }}
            >
              🎁
            </span>
            <style>
              {`
                @keyframes subtle-bounce {
                  0% { transform: translateY(0); }
                  100% { transform: translateY(-0.18em); }
                }
              `}
            </style>
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            ✨ Create and share your magical holiday wishlist this holiday
            season! ✨
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
                🎄 Join a Gift Exchange
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <Image
            alt="Monster"
            className="absolute -top-20 -left-10 -z-10"
            height={148}
            src="/images/monster.png"
            style={{ transform: "rotate(5deg)" }}
            width={148}
          />
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
      </main>
    </div>
  );
}
