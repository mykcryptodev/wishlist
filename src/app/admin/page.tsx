"use client";

import { BadgeCheck, Search } from "lucide-react";
import { useMemo, useState } from "react";

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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NeynarUser } from "@/types/neynar";

interface EligibleAddressesResponse {
  addresses: string[];
  users: NeynarUser[];
  totalAddresses: number;
  eligibleAddresses: number;
  uniqueFids: number;
  minScore: number;
}

export default function AdminPage() {
  const [minScore, setMinScore] = useState("0.9");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibleAddressesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFetchEligibleAddresses = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSearchQuery("");
    setCurrentPage(1);

    try {
      const score = parseFloat(minScore);
      if (isNaN(score) || score < 0 || score > 1) {
        setError("Please enter a valid score between 0 and 1");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/admin/eligible-addresses?minScore=${score}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch eligible addresses",
        );
      }

      const data: EligibleAddressesResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!result?.users) return [];

    const query = searchQuery.toLowerCase().trim();
    if (!query) return result.users;

    return result.users.filter(user => {
      return (
        user.display_name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.fid.toString().includes(query) ||
        user.custody_address.toLowerCase().includes(query)
      );
    });
  }, [result?.users, searchQuery]);

  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Reset to page 1 when search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl mt-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🔐</span>
            <h1 className="text-4xl font-bold text-outlined">Admin Panel</h1>
            <span className="text-4xl">⚙️</span>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage eligible addresses based on Neynar scores
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get Eligible Addresses</CardTitle>
              <CardDescription>
                Fetch all wishlist addresses filtered by minimum Neynar score.
                Addresses are automatically deduped by FID, preferring primary
                Ethereum addresses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minScore">Minimum Neynar Score (0-1)</Label>
                <Input
                  id="minScore"
                  max="1"
                  min="0"
                  placeholder="0.9"
                  step="0.01"
                  type="number"
                  value={minScore}
                  onChange={e => setMinScore(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Default: 0.9. Addresses with scores below this threshold will
                  be filtered out.
                </p>
              </div>

              <Button
                className="w-full"
                disabled={loading}
                onClick={handleFetchEligibleAddresses}
              >
                {loading ? "Fetching..." : "Get Eligible Addresses"}
              </Button>

              {error && (
                <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
                  <p className="text-sm text-destructive font-medium">
                    Error: {error}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Results Summary</CardTitle>
                  <CardDescription>
                    Found {result.eligibleAddresses} eligible addresses out of{" "}
                    {result.totalAddresses} total addresses ({result.uniqueFids}{" "}
                    unique FIDs)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-md">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Addresses
                      </p>
                      <p className="text-2xl font-bold">
                        {result.totalAddresses}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Eligible
                      </p>
                      <p className="text-2xl font-bold">
                        {result.eligibleAddresses}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Unique FIDs
                      </p>
                      <p className="text-2xl font-bold">{result.uniqueFids}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Min Score
                      </p>
                      <p className="text-2xl font-bold">{result.minScore}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Export Addresses</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(result.addresses.join("\n"))
                          }
                        >
                          Copy All (Text)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(result.addresses, null, 2),
                            )
                          }
                        >
                          Copy All (JSON)
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Eligible Users</CardTitle>
                  <CardDescription>
                    Browse and search through {result.users.length} eligible
                    users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Search by name, username, FID, or address..."
                      value={searchQuery}
                      onChange={e => handleSearchChange(e.target.value)}
                    />
                  </div>

                  {/* Results count */}
                  {searchQuery && (
                    <p className="text-sm text-muted-foreground">
                      Found {filteredUsers.length} of {result.users.length}{" "}
                      users
                    </p>
                  )}

                  {/* Users Table */}
                  {filteredUsers.length > 0 ? (
                    <>
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Followers</TableHead>
                              <TableHead>Address</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedUsers.map(user => (
                              <TableRow key={user.fid}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage
                                        alt={user.display_name}
                                        src={user.pfp_url}
                                      />
                                      <AvatarFallback>
                                        {user.display_name
                                          ?.charAt(0)
                                          ?.toUpperCase() || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold">
                                          {user.display_name}
                                        </span>
                                        {user.power_badge && (
                                          <BadgeCheck className="h-4 w-4 text-primary" />
                                        )}
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        @{user.username}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    {(user.score ?? 0).toFixed(2)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {user.follower_count.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      copyToClipboard(user.custody_address)
                                    }
                                  >
                                    <code className="text-xs">
                                      {user.custody_address.slice(0, 6)}...
                                      {user.custody_address.slice(-4)}
                                    </code>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * itemsPerPage + 1}-
                            {Math.min(
                              currentPage * itemsPerPage,
                              filteredUsers.length,
                            )}{" "}
                            of {filteredUsers.length}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              disabled={currentPage === 1}
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setCurrentPage(prev => Math.max(1, prev - 1))
                              }
                            >
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button
                              disabled={currentPage === totalPages}
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setCurrentPage(prev =>
                                  Math.min(totalPages, prev + 1),
                                )
                              }
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery
                        ? `No users found matching "${searchQuery}"`
                        : "No eligible users found"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
