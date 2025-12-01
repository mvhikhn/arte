"use client";

import CleanLink from "@/components/CleanLink";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
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
        { slug: "mosaic-technical-deep-dive", title: "Mosaic: A Technical Deep Dive", date: "Dec 12, 2025" },
    ];

    // Generate random pastel colors for each artwork
    const [artworkColors, setArtworkColors] = useState<string[]>([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // Ref for name text scramble
    const nameRef = useRef<HTMLHeadingElement | null>(null);

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

    // Resizable partition state
    const [leftPanelWidth, setLeftPanelWidth] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Load saved width on mount
    useEffect(() => {
        const savedWidth = localStorage.getItem('arte_divider_width');
        if (savedWidth) {
            setLeftPanelWidth(parseFloat(savedWidth));
        }
    }, []);

    // Handle resizing
    useEffect(() => {
        let rafId: number | null = null;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            setMousePosition({ x: e.clientX, y: e.clientY });

            // Cancel previous frame if it hasn't run yet
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            // Throttle with requestAnimationFrame
            rafId = requestAnimationFrame(() => {
                const newWidth = (e.clientX / window.innerWidth) * 100;
                if (newWidth >= 20 && newWidth <= 80) {
                    setLeftPanelWidth(newWidth);
                }
                rafId = null;
            });
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                document.body.style.cursor = 'default';
                document.body.classList.remove('cursor-none-override');
                // Save width to localStorage
                localStorage.setItem('arte_divider_width', leftPanelWidth.toString());
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'none'; // Hide default cursor during drag
            document.body.classList.add('cursor-none-override');
        }

        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
            document.body.classList.remove('cursor-none-override');
        };
    }, [isDragging, leftPanelWidth]);

    return (
        <main
            ref={containerRef}
            className="h-dvh w-full flex flex-col md:flex-row bg-white text-zinc-900 font-sans selection:bg-zinc-100 overflow-hidden select-none"
            style={{
                '--left-panel-width': `${leftPanelWidth}%`
            } as React.CSSProperties}
        >
            {/* Left Section - Bio, Blog, Footer - Scrollable */}
            <div
                className="w-full md:w-[var(--left-panel-width)] h-full overflow-y-auto no-scrollbar border-b md:border-b-0 border-zinc-200 flex flex-col flex-shrink-0 relative"
            >
                {/* Content Wrapper - Z-10, pointer-events-none to allow clicks through (though no whiteboard anymore, keeping structure for safety) */}
                <div className="min-h-full flex flex-col relative z-10">
                    {/* Main Content - flex-1 to fill space */}
                    <div className="flex-1 p-6 md:p-12">
                        <div className="space-y-12">
                            {/* Header */}
                            <div className="space-y-2 max-w-md">
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
                            <div className="space-y-6 pt-6 max-w-md">
                                <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400">Journal</h2>
                                <div className="space-y-4">
                                    {blogPosts.map((post) => (
                                        <CleanLink
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
                                        </CleanLink>
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

                            {/* Mobile Gallery Grid */}
                            <div className={`md:hidden pt-6 ${isGalleryOpen ? 'block' : 'hidden'}`}>
                                <div className="grid grid-cols-1 gap-4">
                                    {artworks.map((artwork, index) => (
                                        <ArtworkCard
                                            key={artwork.id}
                                            id={artwork.id}
                                            title={artwork.title}
                                            description={artwork.description}
                                            index={index}
                                            color={artworkColors[index] || '#f5f5f5'}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Stays at bottom */}
                    <div className="pointer-events-auto">
                        <Footer />
                    </div>
                </div>
            </div>

            {/* Custom Resize Icon - Only visible when dragging */}
            {isDragging && (
                <div
                    className="fixed z-50 pointer-events-none text-zinc-900 mix-blend-difference"
                    style={{
                        left: mousePosition.x,
                        top: mousePosition.y,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="bg-white/80 backdrop-blur rounded-full p-2 shadow-lg border border-zinc-200">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8L22 12L18 16" />
                            <path d="M6 8L2 12L6 16" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Drag Handle - Desktop Only */}
            <div
                className="hidden md:block w-[1px] h-full bg-zinc-200 hover:bg-zinc-400 transition-colors relative z-10 flex-shrink-0 group"
                onMouseDown={() => setIsDragging(true)}
                style={{ cursor: isDragging ? 'none' : 'col-resize' }}
            >
                {/* Invisible wider hit area for easier grabbing */}
                <div className="absolute inset-y-0 -left-2 -right-2 bg-transparent cursor-col-resize" />
            </div>

            {/* Right Section - Gallery - Desktop Only */}
            <div className="hidden md:block flex-1 h-full overflow-y-auto no-scrollbar p-12 custom-scrollbar">
                <div className={`grid gap-4 pb-12 ${leftPanelWidth > 60 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {artworks.map((artwork, index) => (
                        <ArtworkCard
                            key={artwork.id}
                            id={artwork.id}
                            title={artwork.title}
                            description={artwork.description}
                            index={index}
                            color={artworkColors[index] || '#f5f5f5'}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

