"use client";

import { useState, useEffect, useRef, MouseEvent } from "react";
import Link from "next/link";
import { ExternalLink, Download } from "lucide-react";
import { validateToken, getTokenArtworkType, ArtworkType } from "@/utils/token";
import Artwork, { ArtworkParams, ArtworkRef } from "@/components/Artwork";
import GridArtwork, { GridArtworkParams, GridArtworkRef } from "@/components/GridArtwork";
import MosaicArtwork, { MosaicArtworkParams, MosaicArtworkRef } from "@/components/MosaicArtwork";
import RotatedGridArtwork, { RotatedGridArtworkParams, RotatedGridArtworkRef } from "@/components/RotatedGridArtwork";
import TreeArtwork, { TreeArtworkParams, TreeArtworkRef } from "@/components/TreeArtwork";
import TextDesignArtwork, { TextDesignArtworkParams, TextDesignArtworkRef } from "@/components/TextDesignArtwork";
import {
    generateFlowParamsFromToken,
    generateGridParamsFromToken,
    generateMosaicParamsFromToken,
    generateRotatedGridParamsFromToken,
    generateTreeParamsFromToken,
    generateTextDesignParamsFromToken
} from "@/utils/artworkGenerator";

export default function ViewPage() {
    const [tokenInput, setTokenInput] = useState("");
    const [currentArtwork, setCurrentArtwork] = useState<ArtworkType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isHoveringInput, setIsHoveringInput] = useState(false);
    const [isEncrypted, setIsEncrypted] = useState(false);

    // 3D card tilt state
    const [tiltX, setTiltX] = useState(0);
    const [tiltY, setTiltY] = useState(0);
    const [holoX, setHoloX] = useState(50);  // Hologram gradient position
    const [holoY, setHoloY] = useState(50);
    const cardRef = useRef<HTMLDivElement>(null);

    // Params state
    const [flowParams, setFlowParams] = useState<ArtworkParams | null>(null);
    const [gridParams, setGridParams] = useState<GridArtworkParams | null>(null);
    const [mosaicParams, setMosaicParams] = useState<MosaicArtworkParams | null>(null);
    const [rotatedGridParams, setRotatedGridParams] = useState<RotatedGridArtworkParams | null>(null);
    const [treeParams, setTreeParams] = useState<TreeArtworkParams | null>(null);
    const [textDesignParams, setTextDesignParams] = useState<TextDesignArtworkParams | null>(null);

    // Refs
    const flowRef = useRef<ArtworkRef>(null);
    const gridRef = useRef<GridArtworkRef>(null);
    const mosaicRef = useRef<MosaicArtworkRef>(null);
    const rotatedRef = useRef<RotatedGridArtworkRef>(null);
    const treeRef = useRef<TreeArtworkRef>(null);
    const textRef = useRef<TextDesignArtworkRef>(null);

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTokenInput(value);
        setError(null);
    };

    // Debounced token validation and decoding
    useEffect(() => {
        const trimmedToken = tokenInput.trim();

        if (!trimmedToken) {
            setCurrentArtwork(null);
            return;
        }

        const type = getTokenArtworkType(trimmedToken);

        if (!type) {
            if (trimmedToken.startsWith("fx-")) {
                setError("Invalid key format");
            }
            setCurrentArtwork(null);
            return;
        }

        if (validateToken(trimmedToken, type)) {
            setCurrentArtwork(type);
            setError(null);
            setIsEncrypted(trimmedToken.includes('-v2e.'));

            // Async decoding to support v2e (encrypted) tokens
            const decode = async () => {
                try {
                    // Import dynamically to avoid circular deps if any
                    const { decodeParams } = await import("@/utils/serialization");

                    // For v1/v2 local tokens, we can try sync generators first for speed
                    // But for v2e, we must use decodeParams
                    if (trimmedToken.includes("-v2e.")) {
                        const result = await decodeParams(trimmedToken);
                        switch (type) {
                            case 'flow': setFlowParams(result.params); break;
                            case 'grid': setGridParams(result.params); break;
                            case 'mosaic': setMosaicParams(result.params); break;
                            case 'rotated': setRotatedGridParams(result.params); break;
                            case 'tree': setTreeParams(result.params); break;
                            case 'text': setTextDesignParams(result.params); break;
                        }
                    } else {
                        // Use sync generators for v2 local / v1 legacy
                        switch (type) {
                            case 'flow': setFlowParams(generateFlowParamsFromToken(trimmedToken)); break;
                            case 'grid': setGridParams(generateGridParamsFromToken(trimmedToken)); break;
                            case 'mosaic': setMosaicParams(generateMosaicParamsFromToken(trimmedToken)); break;
                            case 'rotated': setRotatedGridParams(generateRotatedGridParamsFromToken(trimmedToken)); break;
                            case 'tree': setTreeParams(generateTreeParamsFromToken(trimmedToken)); break;
                            case 'text': setTextDesignParams(generateTextDesignParamsFromToken(trimmedToken)); break;
                        }
                    }
                } catch (error: any) {
                    console.error("Decoding error:", error);
                    setError(`Error: ${error.message || "Invalid key or decryption failed"}`);
                    setCurrentArtwork(null);
                }
            };

            decode();
        } else {
            setError("Invalid key");
            setCurrentArtwork(null);
        }
    }, [tokenInput]);

    const handleCardMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate rotation based on distance from center
        // Reduced to 8 degrees max for heavier, more premium feel
        const rotateY = ((mouseX - centerX) / (rect.width / 2)) * 8;
        const rotateX = -((mouseY - centerY) / (rect.height / 2)) * 8;

        // Calculate hologram gradient position (0-100 for percentage)
        const holoXPos = ((mouseX - rect.left) / rect.width) * 100;
        const holoYPos = ((mouseY - rect.top) / rect.height) * 100;

        setTiltX(rotateX);
        setTiltY(rotateY);
        setHoloX(holoXPos);
        setHoloY(holoYPos);
    };

    const handleCardMouseLeave = () => {
        setTiltX(0);
        setTiltY(0);
        setHoloX(50);
        setHoloY(50);
    };

    const handleDownload = () => {
        switch (currentArtwork) {
            case 'flow':
                flowRef.current?.exportHighRes?.(4);
                break;
            case 'grid':
                gridRef.current?.exportHighRes?.(4);
                break;
            case 'mosaic':
                mosaicRef.current?.exportHighRes?.(4);
                break;
            case 'rotated':
                rotatedRef.current?.exportHighRes?.(4);
                break;
            case 'tree':
                treeRef.current?.exportHighRes?.(4);
                break;
            case 'text':
                textRef.current?.exportHighRes?.(4);
                break;
        }
    };

    // Get current canvas dimensions for responsive card sizing
    const getCurrentDimensions = () => {
        if (currentArtwork === 'flow' && flowParams) return { width: flowParams.canvasWidth, height: flowParams.canvasHeight };
        if (currentArtwork === 'grid' && gridParams) return { width: gridParams.canvasWidth, height: gridParams.canvasHeight };
        if (currentArtwork === 'mosaic' && mosaicParams) return { width: mosaicParams.canvasWidth, height: mosaicParams.canvasHeight };
        if (currentArtwork === 'rotated' && rotatedGridParams) return { width: rotatedGridParams.canvasWidth, height: rotatedGridParams.canvasHeight };
        if (currentArtwork === 'tree' && treeParams) return { width: treeParams.canvasWidth, height: treeParams.canvasHeight };
        if (currentArtwork === 'text' && textDesignParams) return { width: textDesignParams.canvasWidth, height: textDesignParams.canvasHeight };
        return { width: 630, height: 790 };
    };

    const dimensions = getCurrentDimensions();
    const aspectRatio = dimensions.width / dimensions.height;

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 relative">
            {/* Home Button - Top Left */}
            <Link
                href="/"
                className="absolute top-8 left-8 w-11 h-11 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all hover:scale-105 active:scale-95 shadow-lg z-30"
                title="Return Home"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </Link>

            {/* Input Area - Fixed hover detection */}
            <div
                className="absolute top-8 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300"
                style={{ opacity: currentArtwork && !isHoveringInput ? 0 : 1 }}
                onMouseEnter={() => setIsHoveringInput(true)}
                onMouseLeave={() => setIsHoveringInput(false)}
            >
                <div className="w-[500px] max-w-[90vw]">
                    <input
                        type="text"
                        value={tokenInput}
                        onChange={handleTokenChange}
                        placeholder="input key to unveil"
                        className={`w-full h-12 px-4 bg-white/90 backdrop-blur-sm border outline-none transition-all font-mono text-sm
                            ${error
                                ? "border-red-400 text-red-600 placeholder:text-red-300"
                                : "border-black/10 text-black/60 placeholder:text-black/30"
                            }`}
                    />
                    {error && (
                        <div className="mt-2 text-red-500 text-xs text-center">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Buttons - Top Right of Page (outside canvas) */}
            {currentArtwork && !error && (
                <div className="absolute top-8 right-8 flex gap-3 z-30">
                    <button
                        onClick={handleDownload}
                        className="w-11 h-11 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                        title="Download (4x Resolution)"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    {!isEncrypted && (
                        <Link
                            href={`/studio?artwork=${currentArtwork === 'text' ? 'textdesign' : currentArtwork}&token=${encodeURIComponent(tokenInput.trim())}`}
                            className="w-11 h-11 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                            title="Open in Studio"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            )}

            {/* Artwork Display */}
            <div className="flex-1 w-full flex items-center justify-center" style={{ perspective: '1500px' }}>
                {currentArtwork && !error ? (
                    <div className="relative">
                        {/* 3D Card with Premium Physics, Tight Frame, and Holographic Effect */}
                        <div
                            ref={cardRef}
                            onMouseMove={handleCardMouseMove}
                            onMouseLeave={handleCardMouseLeave}
                            className="relative rounded-lg overflow-hidden transition-all duration-300 ease-out"
                            style={{
                                transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(30px)`,
                                boxShadow: `
                                    0 2px 4px rgba(0, 0, 0, 0.08),
                                    0 4px 8px rgba(0, 0, 0, 0.08),
                                    0 8px 16px rgba(0, 0, 0, 0.08),
                                    0 16px 32px rgba(0, 0, 0, 0.1),
                                    0 32px 64px rgba(0, 0, 0, 0.12),
                                    ${-tiltY * 2}px ${tiltX * 2}px 40px rgba(0, 0, 0, 0.15),
                                    inset 0 0 0 1px rgba(255, 255, 255, 0.1)
                                `,
                                maxWidth: '90vw',
                                maxHeight: '85vh',
                                padding: '4px',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
                            }}
                        >
                            {/* Inner card with tight border */}
                            <div
                                className="relative overflow-hidden rounded-md"
                                style={{
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
                                }}
                            >
                                {currentArtwork === 'flow' && flowParams && (
                                    <Artwork ref={flowRef} params={flowParams} />
                                )}
                                {currentArtwork === 'grid' && gridParams && (
                                    <GridArtwork ref={gridRef} params={gridParams} />
                                )}
                                {currentArtwork === 'mosaic' && mosaicParams && (
                                    <MosaicArtwork ref={mosaicRef} params={mosaicParams} />
                                )}
                                {currentArtwork === 'rotated' && rotatedGridParams && (
                                    <RotatedGridArtwork ref={rotatedRef} params={rotatedGridParams} />
                                )}
                                {currentArtwork === 'tree' && treeParams && (
                                    <TreeArtwork ref={treeRef} params={treeParams} />
                                )}
                                {currentArtwork === 'text' && textDesignParams && (
                                    <TextDesignArtwork ref={textRef} params={textDesignParams} />
                                )}

                                {/* Holographic Light Reflection Overlay */}
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                                    style={{
                                        background: `
                                            radial-gradient(
                                                ellipse 80% 50% at ${holoX}% ${holoY}%,
                                                rgba(255, 0, 128, 0.15) 0%,
                                                rgba(255, 128, 0, 0.12) 15%,
                                                rgba(255, 255, 0, 0.1) 30%,
                                                rgba(0, 255, 128, 0.08) 45%,
                                                rgba(0, 128, 255, 0.1) 60%,
                                                rgba(128, 0, 255, 0.12) 75%,
                                                rgba(255, 0, 128, 0.08) 90%,
                                                transparent 100%
                                            )
                                        `,
                                        mixBlendMode: 'overlay',
                                        opacity: Math.abs(tiltX) + Math.abs(tiltY) > 1 ? 1 : 0.3,
                                    }}
                                />

                                {/* Shimmer/Glare Effect */}
                                <div
                                    className="absolute inset-0 pointer-events-none transition-all duration-200"
                                    style={{
                                        background: `
                                            linear-gradient(
                                                ${135 + (holoX - 50) * 0.5}deg,
                                                transparent 0%,
                                                transparent ${40 + (holoY - 50) * 0.3}%,
                                                rgba(255, 255, 255, 0.4) ${50 + (holoY - 50) * 0.3}%,
                                                transparent ${60 + (holoY - 50) * 0.3}%,
                                                transparent 100%
                                            )
                                        `,
                                        opacity: Math.abs(tiltX) + Math.abs(tiltY) > 2 ? 0.6 : 0.2,
                                    }}
                                />

                                {/* Iridescent Edge Highlight */}
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background: `
                                            conic-gradient(
                                                from ${(holoX + holoY) * 1.8}deg at ${holoX}% ${holoY}%,
                                                rgba(255, 0, 100, 0.05),
                                                rgba(255, 200, 0, 0.05),
                                                rgba(0, 255, 150, 0.05),
                                                rgba(0, 150, 255, 0.05),
                                                rgba(200, 0, 255, 0.05),
                                                rgba(255, 0, 100, 0.05)
                                            )
                                        `,
                                        mixBlendMode: 'color-dodge',
                                        opacity: Math.abs(tiltX) + Math.abs(tiltY) > 1 ? 0.8 : 0.3,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-black/20 gap-4">
                        <div className="w-16 h-16 rounded-full border border-dashed border-black/10 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-black/20" />
                        </div>
                        <p className="text-sm">Awaiting key...</p>
                    </div>
                )}
            </div>
        </div >
    );
}

