"use client";

import { BadgeCheck, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getBaseUrl } from "@/lib/farcaster-metadata";
import { useIsInMiniApp } from "@/hooks/useIsInMiniApp";

interface User {
  fid: number;
  username: string;
  display_name: string;
  pfp_url?: string;
  profile?: {
    bio?: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  power_badge?: boolean;
  verified_addresses?: {
    eth_addresses: string[];
  };
  hasWishlist?: boolean;
  wishlistAddress?: string; // The specific verified address that has a wishlist
}

interface UserSearchProps {
  onUserSelect?: (user: User) => void;
  placeholder?: string;
  showBio?: boolean;
  className?: string;
}

export function UserSearch({
  onUserSelect,
  placeholder = "Search for Farcaster users...",
  showBio = true,
  className = "",
}: UserSearchProps) {
  const router = useRouter();
  const { isInMiniApp } = useIsInMiniApp();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const searchUsers = useCallback(
    async (searchQuery: string, cursor?: string) => {
      if (!searchQuery.trim()) {
        setUsers([]);
        setNextCursor(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          limit: "10",
        });

        if (cursor) {
          params.append("cursor", cursor);
        }

        const response = await fetch(`/api/users/search?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to search users");
        }

        const data = await response.json();

        if (cursor) {
          setUsers(prev => [...prev, ...data.users]);
        } else {
          setUsers(data.users);
        }

        setNextCursor(data.nextCursor || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error searching users:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
      } else {
        setUsers([]);
        setNextCursor(null);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, searchUsers]);

  const loadMore = () => {
    if (nextCursor && !isLoading) {
      searchUsers(query, nextCursor);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setUsers([]);
    setNextCursor(null);
    setError(null);
  };

  const handleRequestWishlist = async (user: User, event: React.MouseEvent) => {
    // Stop event propagation to prevent card click
    event.stopPropagation();

    try {
      const baseUrl = getBaseUrl();
      const text = `Hey @${user.username}, what should I get you for the holidays? Put your wishlist onchain!`;

      if (isInMiniApp) {
        // Use Farcaster SDK in miniapp context
        const embeds: [string] = [baseUrl];
        await sdk.actions.composeCast({
          text,
          embeds,
        });
      } else {
        // Use Web Share API as fallback
        if (navigator.share) {
          await navigator.share({
            title: "Request Wishlist",
            text: text,
            url: baseUrl,
          });
        } else {
          // Fallback: copy to clipboard if share isn't supported
          await navigator.clipboard.writeText(`${text}\n\n${baseUrl}`);
          // You could show a toast notification here
          console.log("Link copied to clipboard!");
        }
      }
    } catch (error) {
      console.error("Error sharing wishlist request:", error);
    }
  };

  return (
    <div className={className}>
      <div className="relative mb-4 flex items-center gap-2 rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
        <Search className="ml-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 border-0 shadow-none focus-visible:ring-0"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="mr-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <Card className="mb-4 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {isLoading && users.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && query && users.length === 0 && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No users found for &quot;{query}&quot;
            </p>
          </CardContent>
        </Card>
      )}

      {users.length > 0 && (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {users.map(user => (
              <Card
                key={user.fid}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => {
                  // If user has a wishlist, navigate to it using the specific address
                  if (user.wishlistAddress) {
                    router.push(`/wishlist/${user.wishlistAddress}`);
                  }
                  // Always call the callback if provided
                  onUserSelect?.(user);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.pfp_url} alt={user.display_name} />
                      <AvatarFallback>
                        {user.display_name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-base truncate">
                          {user.display_name}
                        </h3>
                        {user.power_badge && (
                          <BadgeCheck className="size-4 text-primary" />
                        )}
                        {user.hasWishlist ? (
                          <Badge
                            variant="default"
                            className="text-xs bg-primary"
                          >
                            🎁 Has Wishlist
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-muted transition-colors"
                            onClick={e => handleRequestWishlist(user, e)}
                          >
                            💌 Request Wishlist
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        @{user.username}
                      </p>
                      {showBio && user.profile?.bio?.text && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {user.profile.bio.text}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          <span className="font-semibold text-foreground">
                            {user.follower_count.toLocaleString()}
                          </span>{" "}
                          followers
                        </span>
                        <span>
                          <span className="font-semibold text-foreground">
                            {user.following_count.toLocaleString()}
                          </span>{" "}
                          following
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {nextCursor && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
