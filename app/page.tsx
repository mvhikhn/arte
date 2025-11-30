"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import ArtworkPreviewCursor from "@/components/ArtworkPreviewCursor";
import gsap from "gsap";

export default function Home() {
    const artworks = [
        { id: "flow", title: "Flow Field", description: "Generative flow particles" },
        { id: "grid", title: "Grid System", description: "Structured chaos" },
        { id: "mosaic", title: "Mosaic", description: "Tiled patterns" },
        { id: "rotated", title: "Rotated Grid", description: "Angular compositions" },
        { id: "tree", title: "Recursive Tree", description: "Organic growth algorithms" },
        { id: "textdesign", title: "Text Design", description: "Typography experiments" },
    ];

    const blogPosts = [
        { slug: "hello-world", title: "Hello World", date: "Nov 29, 2025" },
        { slug: "algorithmic-beauty", title: "The Beauty of Algorithms", date: "Dec 05, 2025" },
    ];

    // Generate random pastel colors for each artwork
    const [artworkColors, setArtworkColors] = useState<string[]>([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // Cursor preview state
    const [hoveredArtwork, setHoveredArtwork] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Mobile preview state
    const [touchedArtwork, setTouchedArtwork] = useState<string | null>(null);
    const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });

    // Ref for name text scramble
    const nameRef = useRef<HTMLHeadingElement | null>(null);
    const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const pastelColors = artworks.map(() => {
            const hue = Math.floor(Math.random() * 360);
            const saturation = Math.floor(Math.random() * 30) + 60; // 60-90%
            const lightness = Math.floor(Math.random() * 15) + 85; // 85-100%
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        setArtworkColors(pastelColors);
    }, []);

    // GSAP text scramble effect for name only
    useEffect(() => {
        if (!nameRef.current) return;

        const scrambleText = (element: HTMLElement) => {
            const originalText = element.textContent || "";
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

            let iteration = 0;
            const interval = setInterval(() => {
                element.textContent = originalText
                    .split("")
                    .map((char, index) => {
                        if (char === " ") return char;
                        if (index < iteration) return originalText[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("");

                if (iteration >= originalText.length) {
                    clearInterval(interval);
                    element.textContent = originalText;
                }
                iteration += 1 / 3;
            }, 30);
        };

        scrambleText(nameRef.current);
    }, []);

    // Track mouse position
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Handle mobile touch with 3-second hold
    const handleTouchStart = (e: React.TouchEvent, artworkId: string) => {
        const touch = e.touches[0];
        setTouchPosition({ x: touch.clientX, y: touch.clientY });

        // Set a 3-second timer before showing preview
        touchTimerRef.current = setTimeout(() => {
            setTouchedArtwork(artworkId);
        }, 3000);
    };

    const handleTouchEnd = () => {
        if (touchTimerRef.current) {
            clearTimeout(touchTimerRef.current);
            touchTimerRef.current = null;
        }
        setTouchedArtwork(null);
    };

    return (
        <main className="h-screen w-full flex flex-col md:flex-row bg-white text-zinc-900 font-sans selection:bg-zinc-100 overflow-hidden">
            {/* Custom cursor preview for desktop */}
            <ArtworkPreviewCursor
                artworkId={hoveredArtwork}
                mouseX={mousePosition.x}
                mouseY={mousePosition.y}
            />

            {/* Mobile touch preview */}
            {touchedArtwork && (
                <div
                    className="md:hidden fixed z-50 pointer-events-none"
                    style={{
                        left: touchPosition.x - 80,
                        top: touchPosition.y - 120,
                        width: "160px",
                        height: "200px",
                    }}
                >
                    <div className="w-full h-full bg-white border border-zinc-300 shadow-2xl overflow-hidden">
                        <iframe
                            src={`/studio?artwork=${touchedArtwork}&preview=true`}
                            className="w-full h-full border-none"
                            style={{
                                transform: "scale(0.8)",
                                transformOrigin: "top left",
                                width: "125%",
                                height: "125%",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Left Section - Bio, Blog, Footer - Scrollable */}
            <div className="w-full md:w-1/2 h-full overflow-y-auto no-scrollbar border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col">
                <div className="p-6 md:p-12 flex-grow">
                    <div className="space-y-12">
                        {/* Header */}
                        <div className="space-y-2">
                            <h1 ref={nameRef} className="text-4xl font-medium tracking-tight text-black">Mahi Khan</h1>
                            <p className="text-zinc-500 text-sm">est. 2004</p>
                        </div>

                        {/* Bio Content */}
                        <div className="max-w-md space-y-6 text-sm leading-relaxed text-zinc-600">
                            <p>
                                Because of having an esoteric level of curiosity about a wide range of subjects, I have struggled for a long time to decide where to put my effort. I wanted something that would give me a peaceful mind and a fulfilled life. Visual media captured a different and surprisingly tenacious part of me. I have been an avid consumer all my life, but I found this field difficult to enter because of financial, social, and networking limitations. That changed when I discovered algorithmic art.
                            </p>
                            <p>
                                This levelling of the field for every creative person, and the way it removes so many barriers to entry, became the main reason I fell in love with it. Anyone can put together some algorithmic wizardry, and anyone can make art that stands beside work from a fancy Manhattan studio. I still intend to broaden my footprint across the full visual media spectrum over time, as I slowly reach mastery in each distinct area.
                            </p>
                            <p>
                                This website chronicles the passion projects I take on throughout my twenties. I occasionally add blog posts to write about my process, reflect on things, and share my views on life or the state of the world.
                            </p>
                        </div>

                        {/* Blog Section */}
                        <div className="space-y-6 pt-6">
                            <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400">Journal</h2>
                            <div className="space-y-4">
                                {blogPosts.map((post) => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="group block"
                                    >
                                        <div className="flex items-baseline justify-between border-b border-zinc-100 pb-2 group-hover:border-zinc-300 transition-colors">
                                            <h3 className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">
                                                {post.title}
                                            </h3>
                                            <span className="text-xs text-zinc-400 font-mono group-hover:text-zinc-500 transition-colors">
                                                {post.date}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Gallery Toggle */}
                        <div className="md:hidden pt-6">
                            <button
                                onClick={() => setIsGalleryOpen(!isGalleryOpen)}
                                className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors w-full py-2 border-b border-zinc-100"
                            >
                                <span>Project Gallery</span>
                                {isGalleryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Mobile Gallery Grid - Rendered here to be before Footer */}
                        <div className={`md:hidden pt-6 ${isGalleryOpen ? 'block' : 'hidden'}`}>
                            <div className="grid grid-cols-1 gap-4">
                                {artworks.map((artwork, index) => (
                                    <Link
                                        key={artwork.id}
                                        href={`/studio?artwork=${artwork.id}`}
                                        className="group block aspect-square border border-zinc-100 hover:border-zinc-300 transition-all duration-300 p-6 flex flex-col justify-between"
                                        style={{ backgroundColor: artworkColors[index] || '#f5f5f5' }}
                                        onTouchStart={(e) => handleTouchStart(e, artwork.id)}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors">0{index + 1}</span>
                                            <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors opacity-0 group-hover:opacity-100" />
                                        </div>

                                        <div>
                                            <h3 className="font-medium text-lg mb-1 group-hover:translate-x-1 transition-transform duration-300">{artwork.title}</h3>
                                            <p className="text-xs text-zinc-400 group-hover:text-zinc-600 transition-colors">{artwork.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer at the bottom of left section */}
                <Footer />
            </div>

            {/* Right Section - Gallery - Desktop Only */}
            <div className="hidden md:block w-1/2 h-full overflow-y-auto no-scrollbar p-12 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 pb-12">
                    {artworks.map((artwork, index) => (
                        <Link
                            key={artwork.id}
                            href={`/studio?artwork=${artwork.id}`}
                            className="group block aspect-square border border-zinc-100 hover:border-zinc-300 transition-all duration-300 p-6 flex flex-col justify-between cursor-none"
                            style={{ backgroundColor: artworkColors[index] || '#f5f5f5' }}
                            onMouseEnter={() => setHoveredArtwork(artwork.id)}
                            onMouseLeave={() => setHoveredArtwork(null)}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors">0{index + 1}</span>
                                <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors opacity-0 group-hover:opacity-100" />
                            </div>

                            <div>
                                <h3 className="font-medium text-lg mb-1 group-hover:translate-x-1 transition-transform duration-300">{artwork.title}</h3>
                                <p className="text-xs text-zinc-400 group-hover:text-zinc-600 transition-colors">{artwork.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}

