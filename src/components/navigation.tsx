"use client";

import { Menu, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { appName } from "@/constants";

import { ConnectButton } from "./auth/ConnectButton";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChristmasLights } from "./christmas-lights";
import { ModeToggle } from "./mode-toggle";
import { UserSearch } from "./user-search";

export function Navigation() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <ChristmasLights />
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm relative z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-2">
          <div className="flex items-center space-x-8">
            <Link className="flex items-center group" href="/">
              <Image
                alt={appName}
                height={32}
                src="/images/logo.png"
                width={32}
              />
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

            <ConnectButton />
            <ModeToggle />
          </div>
        </div>
      </nav>
    </>
  );
}
