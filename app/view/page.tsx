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

    // 3D card tilt state
    const [tiltX, setTiltX] = useState(0);
    const [tiltY, setTiltY] = useState(0);
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

        const trimmedToken = value.trim();
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

            try {
                switch (type) {
                    case 'flow':
                        setFlowParams(generateFlowParamsFromToken(trimmedToken));
                        break;
                    case 'grid':
                        setGridParams(generateGridParamsFromToken(trimmedToken));
                        break;
                    case 'mosaic':
                        setMosaicParams(generateMosaicParamsFromToken(trimmedToken));
                        break;
                    case 'rotated':
                        setRotatedGridParams(generateRotatedGridParamsFromToken(trimmedToken));
                        break;
                    case 'tree':
                        setTreeParams(generateTreeParamsFromToken(trimmedToken));
                        break;
                    case 'text':
                        setTextDesignParams(generateTextDesignParamsFromToken(trimmedToken));
                        break;
                }
            } catch (error) {
                setError("Invalid key");
                setCurrentArtwork(null);
            }
        } else {
            setError("Invalid key");
            setCurrentArtwork(null);
        }
    };

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

        setTiltX(rotateX);
        setTiltY(rotateY);
    };

    const handleCardMouseLeave = () => {
        setTiltX(0);
        setTiltY(0);
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
            {/* Input Area Hover Detection Zone - Invisible but captures hover */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] max-w-[90vw] h-24 z-10"
                onMouseEnter={() => setIsHoveringInput(true)}
                onMouseLeave={() => setIsHoveringInput(false)}
            />

            {/* Input Area - Auto-hide when artwork is shown */}
            <div
                className="absolute top-8 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300 pointer-events-none"
                style={{ opacity: currentArtwork && !isHoveringInput ? 0 : 1 }}
            >
                <div className="w-[500px] max-w-[90vw] pointer-events-auto">
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
                    <Link
                        href={`/studio?artwork=${currentArtwork === 'text' ? 'textdesign' : currentArtwork}&token=${encodeURIComponent(tokenInput.trim())}`}
                        className="w-11 h-11 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                        title="Open in Studio"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            )}

            {/* Artwork Display */}
            <div className="flex-1 w-full flex items-center justify-center" style={{ perspective: '1500px' }}>
                {currentArtwork && !error ? (
                    <div className="relative">
                        {/* 3D Card with Premium Physics */}
                        <div
                            ref={cardRef}
                            onMouseMove={handleCardMouseMove}
                            onMouseLeave={handleCardMouseLeave}
                            className="relative rounded-sm overflow-hidden transition-all duration-500 ease-out"
                            style={{
                                transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(20px)`,
                                boxShadow: `
                                    ${-tiltY * 3}px ${tiltX * 3}px 60px rgba(0, 0, 0, 0.15),
                                    ${-tiltY * 1.5}px ${tiltX * 1.5}px 30px rgba(0, 0, 0, 0.1),
                                    0 20px 80px rgba(0, 0, 0, 0.12)
                                `,
                                maxWidth: '90vw',
                                maxHeight: '85vh',
                                padding: '12px',
                                backgroundColor: '#ffffff',
                            }}
                        >
                            <div className="relative bg-white overflow-hidden" style={{
                                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)'
                            }}>
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
        </div>
    );
}
