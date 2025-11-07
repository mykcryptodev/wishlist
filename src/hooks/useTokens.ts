import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { chain } from "@/constants";

export interface Token {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  priceUsd: number;
  iconUri: string;
  prices: Record<string, number>;
}

export interface TokensResponse {
  result: {
    tokens: Token[];
    pagination: {
      hasMore: boolean;
      limit: number;
      page: number;
    };
  };
}

async function fetchTokensPage({
  page,
  searchQuery,
}: {
  page: number;
  searchQuery: string;
}): Promise<TokensResponse> {
  const searchParams = new URLSearchParams({
    chainId: chain.id.toString(),
    page: page.toString(),
    limit: "20",
  });

  if (searchQuery.trim()) {
    searchParams.set("name", searchQuery.trim());
  }

  const response = await fetch(`/api/tokens?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tokens: ${response.status}`);
  }

  return response.json();
}

export function useTokens(initialSearchQuery?: string) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["tokens", chain.id, searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      fetchTokensPage({ page: pageParam, searchQuery }),
    getNextPageParam: lastPage => {
      const { pagination, tokens } = lastPage.result;
      const hasMore = pagination?.hasMore ?? tokens.length === 20;
      return hasMore ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten all pages into a single tokens array
  const tokens = useMemo(() => {
    return data?.pages.flatMap(page => page.result.tokens) ?? [];
  }, [data]);

  const currentPage = data?.pages.length ?? 1;

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  const resetTokens = () => {
    setSearchQuery("");
  };

  const loadMoreTokens = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return {
    tokens,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    currentPage,
    searchQuery,
    fetchTokens: refetch,
    loadMoreTokens,
    resetTokens,
    updateSearchQuery,
  };
}
