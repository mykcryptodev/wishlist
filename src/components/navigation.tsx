"use client";

/* eslint-disable simple-import-sort/imports */
import { useTheme } from "next-themes";
import Link from "next/link";
/* eslint-enable simple-import-sort/imports */
import {
  AccountAddress,
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
  ConnectButton,
  darkTheme,
  lightTheme,
  useActiveWallet,
} from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { Menu, Search } from "lucide-react";
import { useState } from "react";

import { appDescription, appName, chain } from "@/constants";
import { client } from "@/providers/Thirdweb";
import { useAuthToken } from "@/hooks/useAuthToken";

import { ModeToggle } from "./mode-toggle";
import { shortenAddress } from "thirdweb/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { UserSearch } from "./user-search";

export function Navigation() {
  const { resolvedTheme } = useTheme();
  const wallet = useActiveWallet();
  const [searchOpen, setSearchOpen] = useState(false);
  const { token, setToken, clearToken } = useAuthToken();

  const wallets = [
    inAppWallet({
      auth: {
        options: ["x", "telegram", "coinbase", "google", "email", "phone"],
      },
    }),
    createWallet("com.coinbase.wallet"),
    createWallet("io.metamask"),
    createWallet("me.rainbow"),
    createWallet("app.phantom"),
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-2">
        <div className="flex items-center space-x-8">
          <Link className="flex items-center space-x-2" href="/">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                🎁
              </span>
            </div>
            <span className="font-bold text-xl">{appName}</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              href="/wishlist"
            >
              My Wishlist
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              href="/my-purchases"
            >
              My Purchases
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              href="/exchanges"
            >
              Exchanges
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              href="/users"
            >
              Browse
            </Link>
          </div>
        </div>

        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          {/* Desktop Search Bar */}
          <DialogTrigger asChild>
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full cursor-pointer">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <div className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm text-muted-foreground shadow-xs flex items-center hover:border-ring transition-colors">
                  Search users...
                </div>
              </div>
            </div>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Search Users</DialogTitle>
            </DialogHeader>
            <UserSearch
              className="mt-4"
              showBio={false}
              onUserSelect={() => {
                setSearchOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>

        <div className="flex items-center space-x-2">
          {/* Mobile Search Button */}
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <Button className="md:hidden" size="icon" variant="outline">
                <Search className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Search Users</span>
              </Button>
            </DialogTrigger>
          </Dialog>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/wishlist">My Wishlist</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-purchases">My Purchases</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/exchanges">Exchanges</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/users">Browse</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ConnectButton
            autoConnect={true}
            chain={chain}
            client={client}
            wallets={wallets}
            appMetadata={{
              name: appName,
              description: appDescription,
            }}
            auth={{
              isLoggedIn: async (address: string) => {
                console.log("[isLoggedIn] Checking auth for address:", address);

                // Check localStorage directly for the most up-to-date token
                const storedToken =
                  typeof window !== "undefined"
                    ? localStorage.getItem("wishlist_auth_token")
                    : null;

                console.log("[isLoggedIn] Token found:", !!storedToken);

                if (!storedToken) {
                  console.log("[isLoggedIn] No token found in localStorage");
                  return false;
                }

                try {
                  const response = await fetch("/api/auth/me", {
                    headers: {
                      Authorization: `Bearer ${storedToken}`,
                    },
                  });

                  console.log(
                    "[isLoggedIn] API response status:",
                    response.status,
                  );

                  if (!response.ok) {
                    console.log(
                      "[isLoggedIn] Auth check failed:",
                      response.status,
                    );
                    return false;
                  }

                  const data = await response.json();
                  console.log("[isLoggedIn] Auth response data:", data);
                  console.log("[isLoggedIn] Comparing addresses:", {
                    fromJWT: data.address,
                    expected: address.toLowerCase(),
                    match: data.address === address.toLowerCase(),
                  });
                  const isValid =
                    data.isLoggedIn && data.address === address.toLowerCase();
                  console.log(
                    "[isLoggedIn] Final result:",
                    isValid,
                    "for address:",
                    address,
                  );
                  return isValid;
                } catch (error) {
                  console.error(
                    "[isLoggedIn] Error checking login status:",
                    error,
                  );
                  return false;
                }
              },
              doLogin: async params => {
                try {
                  console.log("doLogin called with params:", {
                    payload: params.payload,
                    signature: params.signature?.slice(0, 20) + "...",
                  });

                  const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      payload: params.payload,
                      signature: params.signature,
                    }),
                  });

                  if (!response.ok) {
                    throw new Error("Failed to login");
                  }

                  const data = await response.json();
                  setToken(data.token);
                  console.log("Login successful, token saved");
                } catch (error) {
                  console.error("Error logging in:", error);
                  throw error;
                }
              },
              getLoginPayload: async ({ address }) => {
                try {
                  const response = await fetch(
                    `/api/auth/login?address=${address}`,
                  );

                  if (!response.ok) {
                    throw new Error("Failed to get login payload");
                  }

                  const data = await response.json();
                  return data.payload;
                } catch (error) {
                  console.error("Error getting login payload:", error);
                  throw error;
                }
              },
              doLogout: async () => {
                console.log("[doLogout] Logout called");
                try {
                  await fetch("/api/auth/logout", {
                    method: "POST",
                  });
                  clearToken();
                  console.log("[doLogout] Token cleared");
                } catch (error) {
                  console.error("[doLogout] Error logging out:", error);
                }
              },
            }}
            connectButton={{
              label: "Login",
              className: "!size-9",
            }}
            connectModal={{
              title: `Login to ${appName}`,
              showThirdwebBranding: false,
            }}
            detailsButton={{
              render: () => (
                <AccountProvider
                  address={wallet?.getAccount()?.address ?? ""}
                  client={client}
                >
                  <Button className="flex items-center gap-2" variant="outline">
                    <AccountAvatar
                      className="!size-6 rounded-full"
                      fallbackComponent={
                        <Blobbie
                          address={wallet?.getAccount()?.address ?? ""}
                          className="!size-6 rounded-full"
                        />
                      }
                    />
                    <AccountName
                      fallbackComponent={
                        <AccountAddress
                          formatFn={addr => shortenAddress(addr)}
                        />
                      }
                    />
                  </Button>
                </AccountProvider>
              ),
            }}
            signInButton={{
              label: "Sign In",
              className: "!size-9 !min-h-0",
            }}
            theme={
              resolvedTheme === "dark"
                ? darkTheme({
                    colors: { connectedButtonBg: "var(--background)" },
                  })
                : lightTheme({
                    colors: { connectedButtonBg: "var(--background)" },
                  })
            }
          />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
