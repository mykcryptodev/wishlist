"use client";

import { CalendarClock, Gift, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const EVENT_START_ET = "2025-12-13T12:00:00-05:00";
const HIDE_BANNER_ET = "2025-12-13T11:55:00-05:00";
const LUMA_EVENT_URL = "https://luma.com/sod8hlum";

export function LivestreamScheduleBanner() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const eventStart = useMemo(() => new Date(EVENT_START_ET), []);
  const hideAt = useMemo(() => new Date(HIDE_BANNER_ET), []);

  const showBanner = now < hideAt.getTime();

  const countdownLabel = useMemo(() => {
    const diff = eventStart.getTime() - now;
    if (diff <= 0) return null;

    const minutes = Math.floor(diff / 60000);
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const remainingMinutes = minutes % 60;

    const parts = [] as string[];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${remainingMinutes}m`);

    return `${parts.join(" ")} away`;
  }, [eventStart, now]);

  const eventDateLabel = useMemo(
    () =>
      eventStart.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
        hour12: true,
      }),
    [eventStart],
  );

  if (!showBanner) return null;

  return (
    <div className="sm:my-12 my-4 transition-all duration-500 ease-out">
      <div className="relative overflow-hidden rounded-3xl border border-red-200/60 bg-gradient-to-r from-red-600 via-pink-500 to-orange-400 shadow-2xl text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25),_transparent_45%)]" />

        <div className="relative flex flex-col gap-6 p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/20 shadow-xl md:w-72 bg-white/10">
              <div className="relative aspect-video w-full">
                <Image
                  fill
                  alt="Holiday livestream"
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 288px"
                  src="/images/monster.png"
                />
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-red-600 shadow-lg">
                <CalendarClock className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  Dec 13 • 12:00 PM ET
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="flex items-center bg-white/20 text-white uppercase tracking-[0.2em] px-3 py-1 border border-white/30">
                  <Sparkles className="size-4 mr-2" />
                  Upcoming Livestream
                </Badge>
                {countdownLabel && (
                  <p className="text-sm text-white/80">
                    Countdown: {countdownLabel}
                  </p>
                )}
              </div>

              <h2 className="text-2xl font-bold leading-tight md:text-3xl flex items-center gap-2">
                Wishlist Holiday Livestream
              </h2>

              <div className="space-y-2 text-base text-white/90">
                <p>
                  Join us live on{" "}
                  <strong>December 13, 2025 at 12:00 PM ET</strong>. Make your
                  wishlist and show up to the stream for a chance to have your
                  wishes come true.
                </p>
                <p>
                  We’ll pick random wishlists during the broadcast and purchase
                  gifts for the winners — up to{" "}
                  <strong>$2,000 per wisher</strong>.
                </p>
                <p className="text-white/80 text-sm">
                  Optional: RSVP to add the livestream to your calendar.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span className="flex items-center gap-2 font-semibold">
                  <CalendarClock className="h-4 w-4" />
                  {eventDateLabel} • ET
                </span>
                <span className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Make a wishlist & attend for a chance to win
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-end gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
            <Button
              asChild
              className="h-12 text-lg font-semibold bg-white text-red-600 hover:bg-white/90 md:w-auto w-full"
            >
              <Link href="/wishlist">
                <Gift className="size-6" />
                Make your wishlist
              </Link>
            </Button>
            <Button
              asChild
              className="h-12 text-lg font-semibold border-white bg-transparent text-white hover:bg-white/10 md:w-auto w-full"
              variant="outline"
            >
              <Link href={LUMA_EVENT_URL} rel="noreferrer" target="_blank">
                <CalendarClock className="size-6" />
                RSVP / Add to calendar
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
