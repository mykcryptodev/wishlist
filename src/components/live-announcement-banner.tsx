"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { Radio, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { youtubeChannelId } from "@/constants";
import { useIsInMiniApp } from "@/hooks/useIsInMiniApp";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface LiveStreamDetails {
  isLive: boolean;
  error?: string;
  stream?: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    channelTitle: string;
    url: string;
    startedAt: string | null;
    concurrentViewers: number | null;
  };
}

const MINI_APP_URL = "https://controlthestream.tv/myk";
const CHANNEL_URL = `https://www.youtube.com/channel/${youtubeChannelId}`;

export function LiveAnnouncementBanner() {
  const [liveInfo, setLiveInfo] = useState<LiveStreamDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningMiniApp, setIsOpeningMiniApp] = useState(false);
  const { isInMiniApp, isLoading: isMiniAppLoading } = useIsInMiniApp();

  useEffect(() => {
    let isMounted = true;

    const fetchLiveInfo = async () => {
      try {
        // Use mock data for visual testing - remove ?mock=true when done
        const useMock =
          typeof window !== "undefined" &&
          (new URLSearchParams(window.location.search).get("mock") === "true" ||
            localStorage.getItem("youtube-live-mock") === "true");
        const url = `/api/youtube/live${useMock ? "?mock=true" : ""}`;
        const response = await fetch(url, {
          cache: "no-store",
        });
        const json = (await response.json()) as LiveStreamDetails;
        if (!isMounted) return;
        setLiveInfo(json);
      } catch (error) {
        if (!isMounted) return;
        setLiveInfo(
          prev =>
            prev ?? {
              isLive: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to fetch live status",
            },
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLiveInfo();
    const intervalId = setInterval(fetchLiveInfo, 60_000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const stream = liveInfo?.stream;
  const showBanner = !isLoading && liveInfo?.isLive && stream;

  const startedAtLabel = useMemo(() => {
    if (!stream?.startedAt) return "We're live right now!";
    const date = new Date(stream.startedAt);
    return `Live since ${date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })}`;
  }, [stream?.startedAt]);

  const concurrentViewersLabel = useMemo(() => {
    if (!stream?.concurrentViewers) return null;
    return `${stream.concurrentViewers.toLocaleString()} watching now`;
  }, [stream?.concurrentViewers]);

  const youtubeLiveUrl = stream?.url ?? `${CHANNEL_URL}/live`;

  const handleOpenMiniApp = async () => {
    if (!isInMiniApp) return;
    setIsOpeningMiniApp(true);
    try {
      await sdk.actions.openMiniApp({ url: MINI_APP_URL });
    } catch (error) {
      console.error("Failed to open live stream mini app", error);
    } finally {
      setIsOpeningMiniApp(false);
    }
  };

  return (
    <div
      className={`sm:my-12 my-4 transition-all duration-500 ease-out ${
        showBanner
          ? "max-h-[1000px] opacity-100 translate-y-0"
          : "max-h-0 opacity-0 -translate-y-4 overflow-hidden"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-3xl border border-red-200/60 bg-gradient-to-r from-red-600 via-pink-500 to-orange-400 shadow-2xl text-white transition-all duration-500 ${
          showBanner ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_60%)]" />
        <div
          className={`relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-10 transition-all duration-700 delay-100 ${
            showBanner ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {stream?.thumbnail && (
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/20 shadow-xl md:w-72">
              <div className="relative aspect-video w-full">
                <Image
                  fill
                  alt={stream.title}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 288px"
                  src={stream.thumbnail}
                />
              </div>
            </div>
          )}

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-white/20 text-white uppercase tracking-[0.2em] px-3 py-1 animate-pulse border border-white/30">
                LIVE NOW
              </Badge>
              <p className="text-sm text-white/80">{startedAtLabel}</p>
            </div>

            <h2 className="text-2xl font-bold leading-tight md:text-3xl flex items-center gap-2">
              <Radio className="h-6 w-6 animate-pulse" />
              {stream?.title}
            </h2>

            {stream?.description && (
              <p className="text-base text-white/90 line-clamp-3">
                {stream.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span>{stream?.channelTitle}</span>
              {concurrentViewersLabel && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {concurrentViewersLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-56">
            {isInMiniApp ? (
              <Button
                className="h-12 text-lg font-semibold bg-white text-red-600 hover:bg-white/90"
                disabled={isMiniAppLoading || isOpeningMiniApp}
                onClick={handleOpenMiniApp}
              >
                {isOpeningMiniApp ? "Opening…" : "Open Mini App"}
              </Button>
            ) : (
              <Button
                asChild
                className="h-12 text-lg font-semibold bg-white text-red-600 hover:bg-white/90"
              >
                <a href={youtubeLiveUrl} rel="noreferrer" target="_blank">
                  Watch on YouTube
                </a>
              </Button>
            )}
            <a
              className="text-center text-sm font-semibold text-white/80 underline-offset-4 hover:text-white"
              href={CHANNEL_URL}
              rel="noreferrer"
              target="_blank"
            >
              Visit channel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
