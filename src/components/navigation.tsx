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
import { Search } from "lucide-react";
import { useState } from "react";

import { appDescription, appName, chain } from "@/constants";
import { client } from "@/providers/Thirdweb";

import { ModeToggle } from "./mode-toggle";
import { shortenAddress } from "thirdweb/utils";
import { Button } from "./ui/button";
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
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
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
              Wishlist
            </Link>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-4 items-center">
          <UserSearch className="w-full" onUserSelect={() => {}} />
        </div>

        <div className="flex items-center space-x-4 gap-2">
          {/* Mobile Search Button */}
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline">
                <Search className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Search Users</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[90vw] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Search Users</DialogTitle>
              </DialogHeader>
              <UserSearch
                onUserSelect={() => {
                  setSearchOpen(false);
                }}
                showBio={false}
                className="mt-4"
              />
            </DialogContent>
          </Dialog>

          <ConnectButton
            chain={chain}
            client={client}
            wallets={wallets}
            appMetadata={{
              name: appName,
              description: appDescription,
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
                  <Button variant="outline" className="flex items-center gap-2">
                    <AccountAvatar
                      className="!size-6 rounded-full"
                      fallbackComponent={
                        <Blobbie
                          address={wallet?.getAccount()?.address ?? ""}
                          className="!size-9"
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
