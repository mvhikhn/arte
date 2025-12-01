"use client";

import { useState, useRef, useEffect } from "react";
import CleanLink from "@/components/CleanLink";
import { ArrowUpRight } from "lucide-react";

interface ArtworkCardProps {
    id: string;
    title: string;
    description: string;
    index: number;
    color: string;
}

export default function ArtworkCard({ id, title, description, index, color }: ArtworkCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle hover state with delay to prevent flickering
    const handleMouseEnter = () => {
        setIsHovered(true);
        // Reduced delay for snappy feel (50ms)
        timeoutRef.current = setTimeout(() => {
            setShowPreview(true);
        }, 50);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setShowPreview(false);
        setIframeLoaded(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    // Handle mobile touch
    const handleTouchStart = () => {
        setShowPreview(true);
    };

    return (
        <CleanLink
            href={`/studio?artwork=${id}`}
            className="group block relative aspect-[4/5] border border-zinc-100 hover:border-zinc-300 transition-all duration-300 overflow-hidden"
            style={{ backgroundColor: color }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
        >
            {/* Content Container - Fades out when preview loads */}
            <div
                className={`absolute inset-0 p-6 flex flex-col justify-between z-10 transition-opacity duration-500 ${iframeLoaded ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors">
                        0{index + 1}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors opacity-0 group-hover:opacity-100" />
                </div>

                <div>
                    <h3 className="font-medium text-lg mb-1 group-hover:translate-x-1 transition-transform duration-300">
                        {title}
                    </h3>
                    <p className="text-xs text-zinc-400 group-hover:text-zinc-600 transition-colors">
                        {description}
                    </p>
                </div>
            </div>

            {/* Preview Iframe */}
            {showPreview && (
                <div className="absolute inset-0 z-0">
                    <iframe
                        src={`/studio?artwork=${id}&preview=true`}
                        className={`w-full h-full border-none transition-all duration-700 ease-out ${iframeLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
                            }`}
                        style={{
                            pointerEvents: 'none', // Prevent interaction with iframe
                        }}
                        onLoad={() => setIframeLoaded(true)}
                    />
                </div>
            )}
        </CleanLink>
    );
}
