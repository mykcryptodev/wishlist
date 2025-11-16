"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
  useActiveAccount,
} from "thirdweb/react";

import { ConnectButton } from "@/components/auth/ConnectButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { WishlistItemCard } from "@/components/wishlist/WishlistItemCard";
import { useAuthToken } from "@/hooks/useAuthToken";
import { client } from "@/providers/Thirdweb";
import { isAddressEqual } from "viem";

interface Exchange {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  memberCount: number;
}

interface ExchangeMember {
  wallet_address: string;
  joined_at: string;
}

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

interface ItemPurchaserData {
  count: number;
  isUserPurchaser: boolean;
}

interface MemberWishlistData {
  items: WishlistItem[];
  purchaserData: Record<string, ItemPurchaserData>;
  error?: string;
}

export default function ExchangeWishlistsPage() {
  const params = useParams<{ exchangeId: string }>();
  const exchangeId = params?.exchangeId;
  const account = useActiveAccount();
  const currentUserAddress = account?.address;
  const { token, isLoading: isTokenLoading } = useAuthToken();

  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [members, setMembers] = useState<ExchangeMember[]>([]);
  const [memberWishlists, setMemberWishlists] = useState<
    Record<string, MemberWishlistData>
  >({});
  const [loading, setLoading] = useState(true);
  const [openMember, setOpenMember] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exchangeId) {
      return;
    }

    if (isTokenLoading) {
      return;
    }

    if (!token && !currentUserAddress) {
      setExchange(null);
      setMembers([]);
      setMemberWishlists({});
      setLoading(false);
      return;
    }

    const fetchExchangeAndWishlists = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        } else if (currentUserAddress) {
          headers["x-wallet-address"] = currentUserAddress;
        }

        const response = await fetch(`/api/exchanges/${exchangeId}`, {
          headers,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const message =
            data?.error ||
            (response.status === 403
              ? "You must be a member of this exchange to view wishlists"
              : "Failed to load exchange");
          setError(message);
          setExchange(null);
          setMembers([]);
          setMemberWishlists({});
          return;
        }

        const data = await response.json();
        setExchange(data.exchange);
        const exchangeMembers: ExchangeMember[] = data.members || [];
        setMembers(exchangeMembers);

        const wishlistResults = await Promise.all(
          exchangeMembers.map(async member => {
            try {
              const wishlistResponse = await fetch(
                `/api/wishlist?userAddress=${member.wallet_address}`,
              );
              const wishlistJson = await wishlistResponse.json();

              const items: WishlistItem[] = wishlistJson.success
                ? wishlistJson.items || []
                : [];

              const purchaserData = await fetchPurchaserDataForMember(
                member.wallet_address,
                items,
                currentUserAddress,
                token,
              );

              return {
                address: member.wallet_address,
                data: {
                  items,
                  purchaserData,
                } satisfies MemberWishlistData,
              };
            } catch (memberError) {
              console.error(
                `Error fetching wishlist for ${member.wallet_address}:`,
                memberError,
              );
              return {
                address: member.wallet_address,
                data: {
                  items: [],
                  purchaserData: {},
                  error: "Failed to load wishlist",
                },
              };
            }
          }),
        );

        const wishlistMap: Record<string, MemberWishlistData> = {};
        wishlistResults.forEach(result => {
          wishlistMap[result.address] = result.data;
        });
        setMemberWishlists(wishlistMap);
      } catch (requestError) {
        console.error("Error loading exchange wishlists:", requestError);
        setError("Failed to load exchange wishlists");
        setExchange(null);
        setMembers([]);
        setMemberWishlists({});
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeAndWishlists();
  }, [
    exchangeId,
    currentUserAddress,
    token,
    isTokenLoading,
  ]);

  useEffect(() => {
    if (openMember && !members.some(member => member.wallet_address === openMember)) {
      setOpenMember(null);
    }
  }, [members, openMember]);

  if (!account) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-16 max-w-4xl">
          <Card className="shadow-lg border-accent/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-outlined">
                Connect to View Exchange Wishlists
              </CardTitle>
              <CardDescription>
                Sign in with your wallet to see the wishlists for this gift
                exchange.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ConnectButton />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const renderMemberWishlist = (member: ExchangeMember) => {
    const memberData = memberWishlists[member.wallet_address];
    const isOwner = Boolean(
      currentUserAddress &&
        isAddressEqual(
          currentUserAddress as `0x${string}`,
          member.wallet_address as `0x${string}`,
        ),
    );

    return (
      <Collapsible
        key={member.wallet_address}
        open={openMember === member.wallet_address}
        onOpenChange={isOpen => {
          setOpenMember(prev =>
            isOpen ? member.wallet_address : prev === member.wallet_address ? null : prev,
          );
        }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <AccountProvider
                  address={member.wallet_address}
                  client={client}
                >
                  <AccountAvatar
                    className="size-12 rounded-full"
                    fallbackComponent={
                      <Blobbie
                        address={member.wallet_address}
                        className="size-12 rounded-full"
                      />
                    }
                  />
                  <div>
                    <AccountName
                      className="text-lg font-semibold"
                      fallbackComponent={
                        <span className="font-semibold">
                          {`${member.wallet_address.slice(0, 6)}...${member.wallet_address.slice(-4)}`}
                        </span>
                      }
                    />
                    <CardDescription className="mt-1">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </AccountProvider>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                  <Link href={`/wishlist/${member.wallet_address}`}>
                    View Full Wishlist
                  </Link>
                </Button>
                <CollapsibleTrigger asChild>
                  <Button
                    aria-label="Toggle wishlist items"
                    size="icon"
                    variant="ghost"
                    className={`transition-transform ${
                      openMember === member.wallet_address ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="size-5" />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="border-t border-border pt-6">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map(index => (
                    <Skeleton key={index} className="h-64 w-full" />
                  ))}
                </div>
              ) : memberData?.error ? (
                <p className="text-sm text-destructive">{memberData.error}</p>
              ) : memberData && memberData.items.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {memberData.items.map(item => {
                    const purchaserInfo =
                      memberData.purchaserData[item.id] ?? {
                        count: 0,
                        isUserPurchaser: false,
                      };

                    return (
                      <WishlistItemCard
                        key={item.id}
                        isUserPurchaser={purchaserInfo.isUserPurchaser}
                        item={item}
                        purchaserCount={purchaserInfo.count}
                        viewMode={isOwner ? "owner" : "public"}
                        onPurchaseInterest={() => {
                          window.location.href = `/wishlist/${member.wallet_address}`;
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No wishlist items yet.
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16 max-w-6xl space-y-8">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <Link className="inline-flex items-center gap-2 hover:underline" href="/exchanges">
              <span aria-hidden>←</span> Back to Exchanges
            </Link>
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-outlined">
                {exchange?.name || "Exchange Wishlists"}
              </h1>
              {exchange?.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {exchange.description}
                </p>
              )}
            </div>
            {exchange && (
              <Card className="w-full text-center border-accent/30 self-stretch md:w-40 md:self-end">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">Members</CardTitle>
                  <CardDescription className="text-2xl font-bold">
                    {exchange.memberCount}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>

        {error && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">{error}</CardTitle>
            </CardHeader>
          </Card>
        )}

        {loading && !Object.keys(memberWishlists).length ? (
          <div className="space-y-6">
            {[1, 2].map(section => (
              <Card key={section} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <Skeleton className="h-12 w-48" />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map(index => (
                      <Skeleton key={index} className="h-64 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {members.map(member => renderMemberWishlist(member))}
            {members.length === 0 && !loading && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No members found for this exchange yet.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

async function fetchPurchaserDataForMember(
  memberAddress: string,
  items: WishlistItem[],
  currentUserAddress?: string,
  token?: string | null,
): Promise<Record<string, ItemPurchaserData>> {
  const dataMap: Record<string, ItemPurchaserData> = {};

  if (!items.length) {
    return dataMap;
  }

  const isOwner = Boolean(
    currentUserAddress &&
      isAddressEqual(
        currentUserAddress as `0x${string}`,
        memberAddress as `0x${string}`,
      ),
  );

  if (!currentUserAddress || isOwner) {
    items.forEach(item => {
      dataMap[item.id] = { count: 0, isUserPurchaser: false };
    });
    return dataMap;
  }

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (currentUserAddress) {
    headers["x-wallet-address"] = currentUserAddress;
  }

  const results = await Promise.all(
    items.map(async item => {
      try {
        const response = await fetch(
          `/api/wishlist/${item.id}/purchasers?itemId=${item.id}`,
          { headers },
        );
        const data = await response.json();

        if (data.success) {
          const isUserPurchaser = data.purchasers?.some(
            (p: { purchaser: string }) =>
              isAddressEqual(
                p.purchaser as `0x${string}`,
                currentUserAddress as `0x${string}`,
              ),
          );

          return {
            itemId: item.id,
            data: {
              count: data.count || 0,
              isUserPurchaser: isUserPurchaser || false,
            },
          };
        }
      } catch (error) {
        console.error(
          `Error fetching purchasers for item ${item.id}:`,
          error,
        );
      }

      return {
        itemId: item.id,
        data: { count: 0, isUserPurchaser: false },
      };
    }),
  );

  results.forEach(result => {
    dataMap[result.itemId] = result.data;
  });

  return dataMap;
}
