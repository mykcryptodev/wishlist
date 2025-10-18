import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

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
            <Button className="text-lg px-8" size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 py-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔗 Easy Adding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simply paste a product URL and we'll automatically extract the
                title, description, price, and image for you.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✏️ Full Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Edit any details we extract or add your own notes. You have
                complete control over your wishlist items.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎁 Share & Organize
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize your items by category, add personal notes, and easily
                share your wishlist with loved ones.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold text-xl">
                  1
                </span>
              </div>
              <h3 className="font-semibold mb-2">Paste URL</h3>
              <p className="text-muted-foreground text-sm">
                Copy and paste any product link from your favorite stores
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold text-xl">
                  2
                </span>
              </div>
              <h3 className="font-semibold mb-2">Auto-Fill Details</h3>
              <p className="text-muted-foreground text-sm">
                We automatically extract product information for you
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold text-xl">
                  3
                </span>
              </div>
              <h3 className="font-semibold mb-2">Edit & Customize</h3>
              <p className="text-muted-foreground text-sm">
                Review and modify any details before adding to your wishlist
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold text-xl">
                  4
                </span>
              </div>
              <h3 className="font-semibold mb-2">Share & Enjoy</h3>
              <p className="text-muted-foreground text-sm">
                Share your wishlist and let others know what you'd love to
                receive
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
