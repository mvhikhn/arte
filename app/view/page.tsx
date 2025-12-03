"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
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
    const [copied, setCopied] = useState(false);

    // Params state
    const [flowParams, setFlowParams] = useState<ArtworkParams | null>(null);
    const [gridParams, setGridParams] = useState<GridArtworkParams | null>(null);
    const [mosaicParams, setMosaicParams] = useState<MosaicArtworkParams | null>(null);
    const [rotatedGridParams, setRotatedGridParams] = useState<RotatedGridArtworkParams | null>(null);
    const [treeParams, setTreeParams] = useState<TreeArtworkParams | null>(null);
    const [textDesignParams, setTextDesignParams] = useState<TextDesignArtworkParams | null>(null);

    // Refs (needed for rendering but not used for controls here)
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

        // Detect artwork type
        const type = getTokenArtworkType(trimmedToken);

        if (!type) {
            // If it looks like a token but has no type prefix, it might be an old token or invalid
            if (trimmedToken.startsWith("fx-")) {
                setError("Invalid token format. Missing artwork type prefix (e.g., fx-flow-...).");
            }
            setCurrentArtwork(null);
            return;
        }

        // Validate token with type binding
        if (validateToken(trimmedToken, type)) {
            setCurrentArtwork(type);
            setError(null);

            // Generate params based on type
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
        } else {
            setError("Invalid token. Checksum mismatch or tampered token.");
            setCurrentArtwork(null);
        }
    };

    const copyToken = () => {
        navigator.clipboard.writeText(tokenInput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-black/5 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 text-black/60" />
                    </Link>
                    <h1 className="font-medium text-black/80">Artwork Viewer</h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center p-6 md:p-12 gap-8">
                {/* Token Input Section */}
                <div className="w-full max-w-2xl flex flex-col gap-4">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-serif text-black/80">View Artwork by Token</h2>
                        <p className="text-black/40 text-sm">Paste a valid token to render its artwork</p>
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            value={tokenInput}
                            onChange={handleTokenChange}
                            placeholder="Paste token here (e.g., fx-flow-...)"
                            className={`w-full h-14 pl-4 pr-12 bg-white border rounded-xl outline-none transition-all font-mono text-sm
                ${error
                                    ? "border-red-300 focus:border-red-500 text-red-600 placeholder:text-red-300"
                                    : "border-black/10 focus:border-black/30 text-black/80 placeholder:text-black/20"
                                } shadow-sm hover:shadow-md focus:shadow-lg`}
                        />
                        {tokenInput && !error && (
                            <button
                                onClick={copyToken}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-black/40 hover:text-black/80 transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* Artwork Display */}
                <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[400px]">
                    {currentArtwork && !error ? (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                            <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white">
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

                            <div className="flex gap-3">
                                <Link
                                    href={`/studio?artwork=${currentArtwork === 'text' ? 'textdesign' : currentArtwork}&token=${encodeURIComponent(tokenInput.trim())}`}
                                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-black/80 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    <span>Open in Studio</span>
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-black/20 gap-4">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-black/10 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-black/20" />
                            </div>
                            <p>Waiting for valid token...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
