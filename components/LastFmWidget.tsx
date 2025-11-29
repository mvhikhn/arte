"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function LastFmWidget() {
    const [track, setTrack] = useState<{
        name: string;
        artist: string;
        album: string;
        image: string;
        nowPlaying: boolean;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    const username = "mvhikhn";
    const apiKey = "e2b2748357773b9391e88fe03d317ec7";
    const POLL_INTERVAL = 1500;
    const REQUEST_TIMEOUT = 2000;

    useEffect(() => {
        let listeningInterval: NodeJS.Timeout | null = null;
        let isRequestPending = false;

        const loadListening = () => {
            if (isRequestPending) return;
            isRequestPending = true;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                isRequestPending = false;
            }, REQUEST_TIMEOUT);

            fetch(
                `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`,
                {
                    signal: controller.signal,
                    cache: "no-cache",
                }
            )
                .then((response) => {
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error("Network response was not ok");
                    return response.json();
                })
                .then((data) => {
                    isRequestPending = false;
                    const recentTrack = data.recenttracks?.track?.[0];

                    if (!recentTrack) {
                        setTrack(null);
                        setLoading(false);
                        return;
                    }

                    const isNowPlaying = recentTrack["@attr"]?.nowplaying === "true";
                    const artist = recentTrack.artist?.["#text"] || "Unknown Artist";
                    const name = recentTrack.name || "Unknown Title";
                    const images = recentTrack.image || [];
                    let album = "";
                    let imageUrl = "";

                    // Get highest res image
                    for (let i = images.length - 1; i >= 0; i--) {
                        if (images[i]?.["#text"]) {
                            imageUrl = images[i]["#text"];
                            break;
                        }
                    }

                    if (recentTrack.album?.["#text"]) {
                        album = recentTrack.album["#text"];
                    }

                    setTrack({
                        name,
                        artist,
                        album,
                        image: imageUrl,
                        nowPlaying: isNowPlaying,
                    });
                    setLoading(false);
                })
                .catch((error) => {
                    clearTimeout(timeoutId);
                    isRequestPending = false;
                    if (error.name !== 'AbortError') {
                        console.error("Last.fm fetch error:", error);
                    }
                    setLoading(false);
                });
        };

        // Initial load
        loadListening();

        // Start polling
        listeningInterval = setInterval(loadListening, POLL_INTERVAL);

        return () => {
            if (listeningInterval) clearInterval(listeningInterval);
        };
    }, []);

    if (loading || !track) return null;

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex-shrink-0">
                {track.image ? (
                    <div className={`w-full h-full rounded-full overflow-hidden border border-zinc-900/10 ${track.nowPlaying ? 'animate-spin-slow' : ''}`}>
                        <img
                            src={track.image}
                            alt={`${track.album} cover`}
                            className="w-full h-full object-cover"
                        />
                        {/* Center hole for vinyl record look */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-zinc-900 rounded-full border-2 border-white/50"></div>
                    </div>
                ) : (
                    <div className="w-full h-full rounded-full bg-zinc-200 flex items-center justify-center">
                        <div className="w-3 h-3 bg-zinc-300 rounded-full"></div>
                    </div>
                )}
            </div>
            <div className="flex flex-col justify-center">
                <span className="text-xs font-medium text-zinc-900 line-clamp-1">
                    {track.name}
                </span>
                <span className="text-[10px] text-zinc-500 line-clamp-1">
                    {track.artist}
                </span>
                {track.nowPlaying && (
                    <span className="text-[9px] text-emerald-500 font-medium uppercase tracking-wider mt-0.5">
                        Listening Now
                    </span>
                )}
            </div>
            <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
        </div>
    );
}
