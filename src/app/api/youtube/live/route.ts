import { NextResponse } from "next/server";

import { youtubeChannelId } from "@/constants";

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

export async function GET() {
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({
      isLive: false,
      error: "Missing YOUTUBE_API_KEY environment variable.",
    });
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
      return NextResponse.json({ isLive: false });
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
      return NextResponse.json({ isLive: false });
    }

    const thumbnails = video.snippet?.thumbnails;
    const thumbnailUrl =
      thumbnails?.maxres?.url ||
      thumbnails?.standard?.url ||
      thumbnails?.high?.url ||
      thumbnails?.medium?.url ||
      thumbnails?.default?.url ||
      null;

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Failed to fetch YouTube live stream info", error);
    return NextResponse.json(
      {
        isLive: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch live stream",
      },
      { status: 500 },
    );
  }
}
