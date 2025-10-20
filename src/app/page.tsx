import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { WishlistDirectory } from "@/components/wishlist/wishlist-directory";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Wishlist
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Create your perfect holiday wishlist. Add items from any website,
            organize your favorites, and share with family and friends!
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/wishlist">
              <Button className="text-lg px-8" size="lg">
                Create Wishlist
              </Button>
            </Link>
            <Link href="/exchanges">
              {" "}
              <Button className="text-lg px-8" size="lg" variant="outline">
                Create or Join an Exchange
              </Button>
            </Link>
          </div>
        </div>

        {/* Wishlist Directory Section */}
        <div className="py-16">
          <WishlistDirectory
            title="Explore Wishlists"
            description="Browse wishlists from our community and find the perfect gift ideas"
            maxItems={6}
          />
        </div>
      </main>
    </div>
  );
}
