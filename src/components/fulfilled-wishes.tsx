"use client";

import { ExternalLink, Gift, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
} from "thirdweb/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { chain, multisig } from "@/constants";
import { client } from "@/providers/Thirdweb";

interface WishlistItem {
  id: string;
  owner: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export function FulfilledWishes() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const offsetRef = useRef(0);
  const multisigAddress = multisig[chain.id];
  const PAGE_SIZE = 1;

  const fetchNextItem = useCallback(async () => {
    if (!multisigAddress) return false;

    setLoading(true);
    const requestOffset = offsetRef.current;

    try {
      const response = await fetch(
        `/api/my-purchases?userAddress=${multisigAddress}&offset=${requestOffset}&limit=${PAGE_SIZE}`,
      );
      const data = await response.json();

      setTotalItems(data.totalItems ?? data.count ?? null);
      offsetRef.current = requestOffset + PAGE_SIZE;

      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        setItems(prev => [...prev, ...data.items]);
        return true;
      }
    } catch (error) {
      console.error("Error fetching fulfilled wishes:", error);
    } finally {
      setLoading(false);
    }

    return false;
  }, [PAGE_SIZE, multisigAddress]);

  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      if (!multisigAddress) {
        setInitialLoading(false);
        return;
      }

      const added = await fetchNextItem();
      if (isMounted) {
        setInitialLoading(false);
        if (added) {
          setCurrentIndex(0);
        }
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [fetchNextItem, multisigAddress]);

  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.scrollTo(currentIndex);
  }, [carouselApi, currentIndex]);

  const handleNext = useCallback(
    async (fromAuto = false) => {
      if (items.length === 0) return;

      const nextIndex = currentIndex + 1;
      const hasMoreToFetch =
        totalItems === null || offsetRef.current < totalItems;

      if (nextIndex >= items.length && !loading && hasMoreToFetch) {
        const added = await fetchNextItem();
        if (added) {
          setCurrentIndex(prev => prev + 1);
          return;
        }
      }

      if (!fromAuto) {
        setAutoRotate(false);
      }

      if (items.length === 0) return;

      if (nextIndex < items.length) {
        setCurrentIndex(nextIndex);
      } else {
        setCurrentIndex(0);
      }
    },
    [currentIndex, fetchNextItem, items.length, loading, totalItems],
  );

  const handlePrevious = useCallback(() => {
    if (items.length === 0) return;
    setAutoRotate(false);
    setCurrentIndex(prev => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  useEffect(() => {
    if (!autoRotate || items.length === 0) return;

    const interval = setInterval(() => {
      handleNext(true);
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRotate, handleNext, items.length]);

  const formatPrice = (priceInWei: string) => {
    const price = parseFloat(priceInWei) / 1e18;
    if (price === 0) return "Price not specified";
    return `$${price.toFixed(2)}`;
  };

  // Don't render the section if there are no items
  if (!initialLoading && items.length === 0) {
    return null;
  }

  const isLoadingNext = loading && items.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Wish Fund Purchases</h3>
          <p className="text-sm text-muted-foreground">
            Rotating through items fulfilled by wishlist.holiday
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAutoRotate(prev => !prev)}
        >
          {autoRotate ? (
            <>
              <Pause className="mr-2 h-4 w-4" /> Pause auto-rotate
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Resume auto-rotate
            </>
          )}
        </Button>
      </div>

      {initialLoading && (
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Skeleton className="aspect-video w-full" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <div className="relative">
          <Carousel
            opts={{ loop: true, align: "start" }}
            setApi={setCarouselApi}
            className="w-full"
          >
            <CarouselContent className="pb-10">
              {items.map(item => (
                <CarouselItem key={item.id} className="md:basis-full lg:basis-full">
                  <Card className="group overflow-hidden transition-all hover:shadow-lg border-accent/30">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <Link
                          className="flex items-center gap-3 flex-1 min-w-0"
                          href={`/wishlist/${item.owner}`}
                          onClick={() => setAutoRotate(false)}
                        >
                          <AccountProvider address={item.owner} client={client}>
                            <AccountAvatar
                              className="size-12 rounded-full border-2 border-green-500/30"
                              fallbackComponent={
                                <Blobbie
                                  address={item.owner}
                                  className="size-12 rounded-full"
                                />
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <CardDescription className="text-xs mb-1">
                                Recipient
                              </CardDescription>
                              <AccountName
                                className="font-semibold text-foreground"
                                fallbackComponent={
                                  <span className="font-semibold text-sm truncate block">
                                    {`${item.owner.slice(0, 6)}...${item.owner.slice(-4)}`}
                                  </span>
                                }
                              />
                            </div>
                          </AccountProvider>
                        </Link>

                        <Badge className="backdrop-blur-sm bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                          <Gift className="w-3 h-3 mr-1" />
                          $WISH Fund
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      {/* Item Image */}
                      <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        {item.imageUrl ? (
                          <img
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                            src={item.imageUrl}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Gift className="h-16 w-16 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <Badge
                            className="backdrop-blur-sm bg-background/80 text-foreground border border-border/60 dark:bg-primary/80 dark:text-primary-foreground dark:border-primary/70"
                            variant="secondary"
                          >
                            {formatPrice(item.price)}
                          </Badge>
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="p-6">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg line-clamp-2">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4">
                          <Button
                            className="w-full"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAutoRotate(false);
                              window.open(item.url, "_blank");
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Item
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious
              className="-left-6 top-1/2 -translate-y-1/2"
              onClick={handlePrevious}
            />
            <CarouselNext
              className="-right-6 top-1/2 -translate-y-1/2"
              onClick={() => handleNext(false)}
            />
          </Carousel>

          {isLoadingNext && (
            <p className="absolute -bottom-2 right-0 text-xs text-muted-foreground">
              Loading next item...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
