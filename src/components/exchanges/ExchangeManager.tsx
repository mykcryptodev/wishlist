"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  LogIn,
  LogOut,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";
import { toast } from "sonner";
import {
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
} from "thirdweb/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthToken } from "@/hooks/useAuthToken";
import { client } from "@/providers/Thirdweb";

import { CreateExchangeDialog } from "./CreateExchangeDialog";
import { JoinExchangeDialog } from "./JoinExchangeDialog";

interface Exchange {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  invite_code: string;
  memberCount: number;
}

interface Member {
  wallet_address: string;
  joined_at: string;
}

interface ExchangeManagerProps {
  walletAddress?: string;
}

export function ExchangeManager({ walletAddress }: ExchangeManagerProps) {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedExchanges, setExpandedExchanges] = useState<Set<string>>(
    new Set(),
  );
  const [exchangeMembers, setExchangeMembers] = useState<
    Record<string, Member[]>
  >({});
  const [loadingMembers, setLoadingMembers] = useState<Set<string>>(new Set());
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [exchangeToLeave, setExchangeToLeave] = useState<Exchange | null>(null);
  const [leavingExchange, setLeavingExchange] = useState(false);
  const { token } = useAuthToken();

  const fetchExchanges = async () => {
    if (!walletAddress || !token) {
      setExchanges([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/exchanges", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exchanges");
      }

      const data = await response.json();
      setExchanges(data.exchanges || []);
    } catch (error) {
      console.error("Error fetching exchanges:", error);
      toast.error("Failed to load exchanges");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (exchangeId: string) => {
    if (!walletAddress || !token || exchangeMembers[exchangeId]) return;

    setLoadingMembers(prev => new Set(prev).add(exchangeId));

    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await response.json();
      setExchangeMembers(prev => ({
        ...prev,
        [exchangeId]: data.members || [],
      }));
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoadingMembers(prev => {
        const newSet = new Set(prev);
        newSet.delete(exchangeId);
        return newSet;
      });
    }
  };

  const toggleExpanded = (exchangeId: string) => {
    setExpandedExchanges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exchangeId)) {
        newSet.delete(exchangeId);
      } else {
        newSet.add(exchangeId);
        fetchMembers(exchangeId);
      }
      return newSet;
    });
  };

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Invite code copied!");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const handleLeaveExchange = async () => {
    if (!exchangeToLeave || !walletAddress || !token) return;

    try {
      setLeavingExchange(true);
      const response = await fetch(
        `/api/exchanges/${exchangeToLeave.id}/leave`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to leave exchange");
      }

      toast.success(`Left "${exchangeToLeave.name}" successfully`);
      setLeaveDialogOpen(false);
      setExchangeToLeave(null);
      fetchExchanges();
    } catch (error) {
      console.error("Error leaving exchange:", error);
      toast.error("Failed to leave exchange");
    } finally {
      setLeavingExchange(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, [walletAddress, token]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!walletAddress || !token) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              Please connect your wallet and sign in to manage gift exchanges
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Exchange
        </Button>
        <Button variant="outline" onClick={() => setJoinDialogOpen(true)}>
          <LogIn className="w-4 h-4 mr-2" />
          Join Exchange
        </Button>
      </div>

      {exchanges.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No exchanges yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a new exchange or join one with an invite code
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exchanges.map(exchange => {
            const isExpanded = expandedExchanges.has(exchange.id);
            const members = exchangeMembers[exchange.id];
            const isLoadingMembers = loadingMembers.has(exchange.id);

            return (
              <Card key={exchange.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {exchange.name}
                        <Badge variant="secondary">
                          {exchange.memberCount}{" "}
                          {exchange.memberCount === 1 ? "member" : "members"}
                        </Badge>
                      </CardTitle>
                      {exchange.description && (
                        <CardDescription className="mt-2">
                          {exchange.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        Invite Code
                      </p>
                      <code className="text-lg font-mono font-bold tracking-wider bg-muted px-3 py-1 rounded">
                        {exchange.invite_code}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInviteCode(exchange.invite_code)}
                    >
                      {copiedCode === exchange.invite_code ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      size="sm"
                      variant="outline"
                      onClick={() => toggleExpanded(exchange.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Hide Members
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          View Members
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setExchangeToLeave(exchange);
                        setLeaveDialogOpen(true);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Leave
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold mb-3">Members</h4>
                      {isLoadingMembers ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          ))}
                        </div>
                      ) : members && members.length > 0 ? (
                        <div className="space-y-2">
                          {members.map(member => (
                            <AccountProvider
                              key={member.wallet_address}
                              address={member.wallet_address}
                              client={client}
                            >
                              <Link
                                className="block transition-transform hover:scale-[1.02]"
                                href={`/wishlist/${member.wallet_address}`}
                              >
                                <Card className="py-1 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                      <AccountAvatar
                                        className="size-6 flex-shrink-0 rounded-full"
                                        fallbackComponent={
                                          <Blobbie
                                            address={member.wallet_address}
                                            className="size-6 flex-shrink-0 rounded-full"
                                          />
                                        }
                                      />
                                      <div className="flex-1 min-w-0">
                                        <AccountName
                                          className="font-semibold text-base mb-1 truncate block"
                                          fallbackComponent={
                                            <span className="font-semibold text-base mb-1 truncate block text-muted-foreground">
                                              {`${member.wallet_address.slice(0, 6)}...${member.wallet_address.slice(-4)}`}
                                            </span>
                                          }
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            </AccountProvider>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No members found
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateExchangeDialog
        open={createDialogOpen}
        walletAddress={walletAddress}
        onExchangeCreated={fetchExchanges}
        onOpenChange={setCreateDialogOpen}
      />

      <JoinExchangeDialog
        open={joinDialogOpen}
        walletAddress={walletAddress}
        onExchangeJoined={fetchExchanges}
        onOpenChange={setJoinDialogOpen}
      />

      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Exchange?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave &quot;{exchangeToLeave?.name}&quot;? You&apos;ll
              need an invite code to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={leavingExchange}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={leavingExchange}
              onClick={handleLeaveExchange}
            >
              {leavingExchange ? "Leaving..." : "Leave Exchange"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
