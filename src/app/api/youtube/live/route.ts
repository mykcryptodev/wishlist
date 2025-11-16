import { NextResponse } from "next/server";

import { youtubeChannelId } from "@/constants";
import { CACHE_TTL, getYouTubeLiveCacheKey, redis } from "@/lib/redis";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YoutubeSearchResponse {
  items?: Array<{
    id?: {
      videoId?: string;
    };
  }>;
}

interface YoutubeVideoResponse {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      description?: string;
      thumbnails?: {
        maxres?: { url: string };
        standard?: { url: string };
        high?: { url: string };
        medium?: { url: string };
        default?: { url: string };
      };
      channelTitle?: string;
    };
    liveStreamingDetails?: {
      actualStartTime?: string;
      scheduledStartTime?: string;
      concurrentViewers?: string;
    };
  }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const useMock = searchParams.get("mock") === "true";

  // Return mock data for testing
  if (useMock) {
    const mockStartTime = new Date();
    mockStartTime.setHours(mockStartTime.getHours() - 1); // Started 1 hour ago

    return NextResponse.json({
      isLive: true,
      stream: {
        id: "mock-video-id-12345",
        title: "🎄 Holiday Wishlist Build Session - Live Coding & Q&A",
        description:
          "Join us for a live coding session where we'll be building new features for the Wishlist app! We'll be discussing smart contracts, React components, and answering your questions about the platform. Don't forget to drop your wishlist links in the chat!",
        thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        channelTitle: "Wishlist",
        url: "https://www.youtube.com/watch?v=mock-video-id-12345",
        startedAt: mockStartTime.toISOString(),
        concurrentViewers: 1247,
      },
    });
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({
      isLive: false,
      error: "Missing YOUTUBE_API_KEY environment variable.",
    });
  }

  // Check Redis cache first
  const cacheKey = getYouTubeLiveCacheKey();
  if (redis) {
    try {
      const cachedData = await redis.get<{
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
      }>(cacheKey);

      if (cachedData) {
        console.log("✅ YouTube live status cache hit");
        return NextResponse.json(cachedData);
      }
    } catch (cacheError) {
      console.error("Redis cache read error:", cacheError);
      // Continue to API call if cache read fails
    }
  }

  try {
    const searchParams = new URLSearchParams({
      part: "snippet",
      channelId: youtubeChannelId,
      eventType: "live",
      type: "video",
      maxResults: "1",
      key: YOUTUBE_API_KEY,
    });

    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?${searchParams.toString()}`,
      { cache: "no-store" },
    );

    if (!searchResponse.ok) {
      throw new Error("Failed to query YouTube search API");
    }

    const searchJson = (await searchResponse.json()) as YoutubeSearchResponse;
    const liveVideoId = searchJson.items?.[0]?.id?.videoId;

    if (!liveVideoId) {
      const notLiveResult = { isLive: false };
      // Cache "not live" result (1 minute TTL) to avoid repeated API calls
      if (redis) {
        try {
          await redis.setex(cacheKey, CACHE_TTL.ONE_MINUTE, notLiveResult);
        } catch (cacheError) {
          console.error("Redis cache write error:", cacheError);
        }
      }
      return NextResponse.json(notLiveResult);
    }

    const videoParams = new URLSearchParams({
      part: "snippet,liveStreamingDetails",
      id: liveVideoId,
      key: YOUTUBE_API_KEY,
    });

    const videoResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?${videoParams.toString()}`,
      { cache: "no-store" },
    );

    if (!videoResponse.ok) {
      throw new Error("Failed to query YouTube videos API");
    }

    const videoJson = (await videoResponse.json()) as YoutubeVideoResponse;
    const video = videoJson.items?.[0];

    if (!video) {
      const notLiveResult = { isLive: false };
      // Cache "not live" result (1 minute TTL) to avoid repeated API calls
      if (redis) {
        try {
          await redis.setex(cacheKey, CACHE_TTL.ONE_MINUTE, notLiveResult);
        } catch (cacheError) {
          console.error("Redis cache write error:", cacheError);
        }
      }
      return NextResponse.json(notLiveResult);
    }

    const thumbnails = video.snippet?.thumbnails;
    const thumbnailUrl =
      thumbnails?.maxres?.url ||
      thumbnails?.standard?.url ||
      thumbnails?.high?.url ||
      thumbnails?.medium?.url ||
      thumbnails?.default?.url ||
      null;

    const result = {
      isLive: true,
      stream: {
        id: video.id,
        title: video.snippet?.title ?? "Live on YouTube",
        description: video.snippet?.description ?? "",
        thumbnail: thumbnailUrl,
        channelTitle: video.snippet?.channelTitle ?? "Wishlist",
        url: `https://www.youtube.com/watch?v=${liveVideoId}`,
        startedAt:
          video.liveStreamingDetails?.actualStartTime ||
          video.liveStreamingDetails?.scheduledStartTime ||
          null,
        concurrentViewers: video.liveStreamingDetails?.concurrentViewers
          ? Number(video.liveStreamingDetails.concurrentViewers)
          : null,
      },
    };

    // Cache successful live stream result (1 minute TTL - balances freshness with API quota)
    if (redis) {
      try {
        await redis.setex(cacheKey, CACHE_TTL.ONE_MINUTE, result);
        console.log("✅ Cached YouTube live status (1 minute TTL)");
      } catch (cacheError) {
        console.error("Redis cache write error:", cacheError);
        // Continue even if cache write fails
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch YouTube live stream info", error);
    return NextResponse.json(
      {
        isLive: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch live stream",
      },
      { status: 500 },
    );
  }
}
