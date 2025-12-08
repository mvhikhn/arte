"use client";

import { useState, useEffect, useRef, MouseEvent } from "react";
import Link from "next/link";
import { ExternalLink, Download, MapPin, Calendar, User, MessageCircle } from "lucide-react";
import { validateToken, getTokenArtworkType } from "@/utils/token";
import { ARTWORKS } from "@/config/artworks";
import { ProvenanceData } from "@/utils/serialization";

export default function ViewPage() {
    const [tokenInput, setTokenInput] = useState("");
    const [currentArtwork, setCurrentArtwork] = useState<string | null>(null);
    const [params, setParams] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isHoveringInput, setIsHoveringInput] = useState(false);
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [isV4, setIsV4] = useState(false);
    const [provenance, setProvenance] = useState<ProvenanceData | null>(null);

    // 3D card tilt state
    const [tiltX, setTiltX] = useState(0);
    const [tiltY, setTiltY] = useState(0);
    const [holoX, setHoloX] = useState(50);  // Hologram gradient position
    const [holoY, setHoloY] = useState(50);
    const cardRef = useRef<HTMLDivElement>(null);

    // Generic ref
    const artworkRef = useRef<any>(null);

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTokenInput(value);
        setError(null);
    };

    // Read token from URL query params on page load (for QR code scanning)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get('token');
            if (tokenFromUrl) {
                setTokenInput(decodeURIComponent(tokenFromUrl));
                // Clean up URL to remove token param
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, []);

    // Debounced token validation and decoding
    useEffect(() => {
        const trimmedToken = tokenInput.trim();

        if (!trimmedToken) {
            setCurrentArtwork(null);
            setParams(null);
            setProvenance(null);
            setIsV4(false);
            return;
        }

        const type = getTokenArtworkType(trimmedToken);

        if (!type || !ARTWORKS[type]) {
            if (trimmedToken.startsWith("fx-")) {
                setError("Invalid key format or unknown artwork type");
            }
            setCurrentArtwork(null);
            setParams(null);
            setProvenance(null);
            setIsV4(false);
            return;
        }

        // We cast type to string to index ARTWORKS, though getTokenArtworkType returns known types
        const artworkType = type as string;

        if (validateToken(trimmedToken, artworkType)) {
            setCurrentArtwork(artworkType);
            setError(null);
            setIsEncrypted(trimmedToken.includes('-v2e.'));
            setIsV4(trimmedToken.includes('-v4.'));

            // Async decoding to support all token versions
            const decode = async () => {
                try {
                    const { decodeParamsUniversal, isV4Token } = await import("@/utils/serialization");

                    if (isV4Token(trimmedToken)) {
                        // v4 tokens - use universal decoder which returns provenance
                        const result = await decodeParamsUniversal(trimmedToken);
                        setParams(result.params);
                        setProvenance(result.provenance || null);
                    } else if (trimmedToken.includes("-v2e.")) {
                        // v2e tokens
                        const { decodeParams } = await import("@/utils/serialization");
                        const result = await decodeParams(trimmedToken);
                        setParams(result.params);
                        setProvenance(null);
                    } else {
                        // v1/v2 tokens - use generator from registry
                        const generator = ARTWORKS[artworkType].generator;
                        setParams(generator(trimmedToken));
                        setProvenance(null);
                    }
                } catch (error: any) {
                    console.error("Decoding error:", error);
                    setError(`Error: ${error.message || "Invalid key or decryption failed"}`);
                    setCurrentArtwork(null);
                    setParams(null);
                    setProvenance(null);
                }
            };

            decode();
        } else {
            setError("Invalid key");
            setCurrentArtwork(null);
            setParams(null);
            setProvenance(null);
        }
    }, [tokenInput]);

    const handleTilt = (clientX: number, clientY: number) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate rotation based on distance from center
        // Reduced to 8 degrees max for heavier, more premium feel
        const rotateY = ((clientX - centerX) / (rect.width / 2)) * 8;
        const rotateX = -((clientY - centerY) / (rect.height / 2)) * 8;

        // Calculate hologram gradient position (0-100 for percentage)
        const holoXPos = ((clientX - rect.left) / rect.width) * 100;
        const holoYPos = ((clientY - rect.top) / rect.height) * 100;

        setTiltX(rotateX);
        setTiltY(rotateY);
        setHoloX(holoXPos);
        setHoloY(holoYPos);
    };

    const handleCardMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        // Disable mouse tilt on touch devices to prevent conflict, 
        // but we'll handle touch separately
        if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
            return;
        }
        handleTilt(e.clientX, e.clientY);
    };

    const handleCardTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        // Prevent scrolling while interacting with the card
        // e.preventDefault(); // Optional: might block page scroll, use with caution
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            handleTilt(touch.clientX, touch.clientY);
        }
    };

    const handleResetTilt = () => {
        setTiltX(0);
        setTiltY(0);
        setHoloX(50);
        setHoloY(50);
    };

    const handleDownload = () => {
        artworkRef.current?.exportHighRes?.(4);
    };

    // Get current canvas dimensions for responsive card sizing
    const getCurrentDimensions = () => {
        if (currentArtwork && params) {
            return {
                width: params.canvasWidth || 630,
                height: params.canvasHeight || 790
            };
        }
        return { width: 630, height: 790 };
    };

    const dimensions = getCurrentDimensions();
    const aspectRatio = dimensions.width / dimensions.height;
    const ArtworkComponent = currentArtwork ? ARTWORKS[currentArtwork].component : null;

    return (
        <div className="min-h-screen w-full bg-[#fafafa] flex flex-col items-center justify-between relative overflow-hidden overscroll-none touch-none">

            {/* Header Zone */}
            <div className="w-full p-6 flex justify-between items-start z-50 relative shrink-0 h-[100px]">
                {/* Home Button */}
                <Link
                    href="/"
                    className="group p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                    title="Return Home"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>

                {/* Action Buttons */}
                {currentArtwork && !error && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="group p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            title="Download (4x Resolution)"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        {!isEncrypted && (
                            <Link
                                href={`/studio?artwork=${currentArtwork === 'text' ? 'textdesign' : currentArtwork}&token=${encodeURIComponent(tokenInput.trim())}`}
                                className="group p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                                title="Open in Studio"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Input Area - Absolute Centered (Safe from Header) */}
            <div
                className="absolute top-24 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300"
                style={{ opacity: currentArtwork && !isHoveringInput ? 0 : 1 }}
                onMouseEnter={() => setIsHoveringInput(true)}
                onMouseLeave={() => setIsHoveringInput(false)}
            >
                <div className="w-[300px] md:w-[500px] max-w-[90vw]">
                    <input
                        type="text"
                        value={tokenInput}
                        onChange={handleTokenChange}
                        placeholder="input key to unveil"
                        className={`w-full h-12 px-4 bg-white/90 backdrop-blur-sm border outline-none transition-all font-mono text-sm rounded-md shadow-sm
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

            {/* Main Content Zone - The Card */}
            {/* Added pb-12 to shift center of gravity upwards */}
            <div className="flex-1 w-full flex items-center justify-center p-4 min-h-0 z-10 pb-12 md:pb-4">
                {currentArtwork && !error && ArtworkComponent && params ? (
                    <div
                        className="relative w-full max-w-[90vw] max-h-[55vh] aspect-[2.5/3.5] flex items-center justify-center"
                        style={{ perspective: '1500px' }}
                    >
                        <div
                            ref={cardRef}
                            className="relative w-full h-full rounded-lg overflow-hidden transition-transform duration-100 ease-out preserve-3d"
                            style={{
                                transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(30px)`,
                                boxShadow: `
                                    ${-tiltY * 2}px ${tiltX * 2}px 20px rgba(0,0,0,0.1),
                                    0 20px 50px rgba(0,0,0,0.1)
                                `,
                                padding: '4px',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
                            }}
                            onMouseMove={(e) => handleTilt(e.clientX, e.clientY)}
                            onMouseLeave={handleResetTilt}
                            onTouchMove={(e) => {
                                if (e.touches.length > 0) {
                                    handleTilt(e.touches[0].clientX, e.touches[0].clientY);
                                }
                            }}
                            onTouchEnd={handleResetTilt}
                        >
                            {/* Force canvas to scale to container */}
                            <div className="w-full h-full [&>canvas]:!w-full [&>canvas]:!h-full [&>canvas]:!object-contain">
                                <ArtworkComponent ref={artworkRef} params={params} />
                            </div>

                            {/* Holographic Overlay */}
                            <div
                                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
                                style={{
                                    background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.8) 45%, rgba(255,255,255,0) 50%)`,
                                    transform: `translateX(${holoX}%) translateY(${holoY}%)`
                                }}
                            />
                        </div>
                    </div>

                        {/* Provenance Display - Mobile (Bottom of Screen) */}
                {isV4 && provenance && (
                    <div className="absolute bottom-6 left-0 right-0 text-center md:hidden px-6 z-20">
                        <div className="font-mono text-xs text-zinc-400 mb-2 tracking-wider uppercase">Provenance</div>
                        <div className="font-serif text-lg text-zinc-800 italic">
                            {provenance.feeling} in {provenance.location}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-300 mt-1">
                            {new Date(provenance.timestamp).toLocaleDateString()} • {provenance.creator}
                        </div>
                    </div>
                )}

                {/* Provenance Display - Desktop (Below Card) */}
                {isV4 && provenance && (
                    <div className="hidden md:block absolute -bottom-32 left-0 right-0 text-center">
                        <div className="font-mono text-xs text-zinc-400 mb-2 tracking-wider uppercase">Provenance</div>
                        <div className="font-serif text-xl text-zinc-800 italic">
                            {provenance.feeling} in {provenance.location}
                        </div>
                        <div className="font-mono text-xs text-zinc-300 mt-1">
                            {new Date(provenance.timestamp).toLocaleDateString()} • {provenance.creator}
                        </div>
                    </div>
                )}
                )}
            </div>
        </div>
    );
}

