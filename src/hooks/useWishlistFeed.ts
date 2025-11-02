import { useQuery } from "@tanstack/react-query";

interface FeedItem {
  itemId: string;
  owner: string;
  title: string;
  url: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

interface FeedResponse {
  success: boolean;
  items: FeedItem[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Custom hook to fetch the latest wishlist items feed
 *
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @returns React Query result with feed items
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useWishlistFeed(1, 20);
 *
 * if (isLoading) return <div>Loading feed...</div>;
 * if (error) return <div>Error loading feed</div>;
 *
 * return data?.items.map(item => <FeedItem key={item.itemId} {...item} />);
 * ```
 */
export function useWishlistFeed(page = 1, limit = 20) {
  return useQuery<FeedResponse>({
    queryKey: ["wishlist-feed", page, limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/wishlist/feed?page=${page}&limit=${limit}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch wishlist feed");
      }

      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
