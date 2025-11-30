"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ArtworkPreviewCursorProps {
    artworkId: string | null;
    mouseX: number;
    mouseY: number;
}

export default function ArtworkPreviewCursor({
    artworkId,
    mouseX,
    mouseY,
}: ArtworkPreviewCursorProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !artworkId) return null;

    // 4:5 aspect ratio - 160px × 200px
    const width = 160;
    const height = 200;

    // Offset so cursor is roughly in the center-left of the preview
    const offsetX = -80;
    const offsetY = -100;

    return createPortal(
        <div
            className="pointer-events-none fixed z-50 transition-transform duration-100 ease-out"
            style={{
                left: mouseX + offsetX,
                top: mouseY + offsetY,
                width: `${width}px`,
                height: `${height}px`,
            }}
        >
            <div className="w-full h-full bg-white border border-zinc-300 shadow-2xl overflow-hidden">
                <iframe
                    src={`/studio?artwork=${artworkId}&preview=true`}
                    className="w-full h-full border-none"
                    style={{
                        transform: "scale(0.8)",
                        transformOrigin: "top left",
                        width: "125%",
                        height: "125%",
                    }}
                />
            </div>
        </div>,
        document.body
    );
}
