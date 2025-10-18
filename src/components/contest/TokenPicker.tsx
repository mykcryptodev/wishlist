"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { TokenIcon, TokenProvider } from "thirdweb/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chain, usdc } from "@/constants";
import { type Token, useTokens } from "@/hooks/useTokens";
import { resolveTokenIcon } from "@/lib/utils";
import { client } from "@/providers/Thirdweb";

interface TokenPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTokenSelect: (token: Token) => void;
  selectedTokenAddress?: string;
}

export function TokenPicker({
  open,
  onOpenChange,
  onTokenSelect,
  selectedTokenAddress,
}: TokenPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const {
    tokens,
    loading,
    loadingMore,
    hasMore,
    fetchTokens,
    loadMoreTokens,
    updateSearchQuery,
  } = useTokens();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update search query and fetch tokens when debounced query changes
  useEffect(() => {
    if (open) {
      updateSearchQuery(debouncedQuery);
      // Fetch tokens after a short delay to ensure state is updated
      const timer = setTimeout(() => {
        fetchTokens().catch(error => {
          console.error("Error fetching tokens:", error);
        });
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [debouncedQuery, open, updateSearchQuery, fetchTokens]);

  // Set default currency to USDC when tokens are loaded
  useEffect(() => {
    if (tokens.length > 0 && !selectedTokenAddress) {
      const usdcToken = tokens.find(
        token => token.address.toLowerCase() === usdc[chain.id].toLowerCase(),
      );
      if (usdcToken) {
        onTokenSelect(usdcToken);
        onOpenChange(false);
      }
    }
  }, [tokens, selectedTokenAddress, onTokenSelect, onOpenChange]);

  const handleTokenSelect = useCallback(
    (token: Token) => {
      onTokenSelect(token);
      onOpenChange(false);
    },
    [onTokenSelect, onOpenChange],
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

      if (isNearBottom && hasMore && !loadingMore) {
        loadMoreTokens();
      }
    },
    [hasMore, loadingMore, loadMoreTokens],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
          <DialogDescription>
            Choose a token for your contest entry fee.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                size="sm"
                variant="ghost"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Token List */}
          <ScrollArea className="h-96" onScrollCapture={handleScroll}>
            <div className="space-y-1">
              {loading && tokens.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  Loading tokens...
                </div>
              ) : tokens.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  {searchQuery ? "No tokens found" : "No tokens available"}
                </div>
              ) : (
                tokens.map((token, index) => (
                  <Button
                    key={`${token.address}-${index}`}
                    className="w-full justify-start p-3 h-auto"
                    variant="ghost"
                    onClick={() => handleTokenSelect(token)}
                  >
                    <TokenProvider
                      address={token.address}
                      chain={chain}
                      client={client}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <TokenIcon
                          className="size-8 flex-shrink-0"
                          iconResolver={async () =>
                            await resolveTokenIcon(token)
                          }
                        />
                        <div className="flex flex-col items-start text-left min-w-0 flex-1">
                          <span className="font-medium text-sm">
                            {token.symbol}
                          </span>
                          <span className="text-xs text-muted-foreground truncate w-full">
                            {token.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ${token.priceUsd.toFixed(2)}
                          </span>
                        </div>
                        {selectedTokenAddress === token.address && (
                          <div className="ml-auto">
                            <div className="size-2 rounded-full bg-primary" />
                          </div>
                        )}
                      </div>
                    </TokenProvider>
                  </Button>
                ))
              )}

              {/* Load More Button */}
              {hasMore && !loadingMore && (
                <div className="flex items-center justify-center p-2">
                  <Button
                    className="w-full"
                    size="sm"
                    variant="outline"
                    onClick={loadMoreTokens}
                  >
                    Load More Tokens
                  </Button>
                </div>
              )}

              {loadingMore && (
                <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                  Loading more tokens...
                </div>
              )}

              {!hasMore && tokens.length > 0 && (
                <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                  No more tokens to load
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
