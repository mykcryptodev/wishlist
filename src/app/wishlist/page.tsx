import { AddWishlistItemForm } from "@/components/wishlist/AddWishlistItemForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Wishlist
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Create your holiday wishlist by adding items from any website. 
            Just paste a link and we'll help you organize your perfect wishlist!
          </p>
        </div>

        {/* Add Item Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <AddWishlistItemForm />
        </div>

        {/* Wishlist Items Preview */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Your Wishlist Items</CardTitle>
              <CardDescription>
                Items you've added to your wishlist will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-lg">No items in your wishlist yet</p>
                <p className="text-sm">Add your first item using the form above!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
