"use client";

import { useState, useRef, useEffect } from "react";
import { ARTWORKS } from "@/config/artworks";
import ArtworkCard from "@/components/ArtworkCard";
import Footer from "@/components/Footer";
import CleanLink from "@/components/CleanLink";
import { ChevronDown, ChevronUp } from "lucide-react";

import gsap from "gsap";

export default function Home() {
    const [leftPanelWidth, setLeftPanelWidth] = useState(40);
    const [isDragging, setIsDragging] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const nameRef = useRef<HTMLHeadingElement>(null);

    // Get artworks from registry
    const artworks = Object.values(ARTWORKS);

    // Specific colors for artworks (matching original design)
    const artworkColors = [
        '#f5f5f5', // Flow
        '#f0f7ff', // Grid
        '#fff0f5', // Mosaic
        '#f0fff4', // Rotated
        '#fff8f0', // Tree
        '#f8f0ff', // Text
        '#f0f8ff', // Lamb (added)
    ];

    // Custom GSAP Scramble Hook
    useEffect(() => {
        const element = nameRef.current;
        if (!element) return;

        const targetText = "Mahi Khan";
        const chars = "!<>-_\\/[]{}—=+*^?#________";
        const duration = 1.5;

        // Proxy object to tween
        const scramble = { value: 0 };

        gsap.to(scramble, {
            value: 1,
            duration: duration,
            ease: "power4.out",
            onUpdate: () => {
                const progress = scramble.value;
                const len = targetText.length;
                const revealed = Math.floor(progress * len);

                let output = "";
                for (let i = 0; i < len; i++) {
                    if (i < revealed) {
                        output += targetText[i];
                    } else {
                        output += chars[Math.floor(Math.random() * chars.length)];
                    }
                }

                element.innerText = output;
            },
            onComplete: () => {
                element.innerText = targetText;
            }
        });

    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });

            if (isDragging) {
                const newWidth = (e.clientX / window.innerWidth) * 100;
                if (newWidth > 20 && newWidth < 80) {
                    setLeftPanelWidth(newWidth);
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    return (
        <main
            className="flex flex-col md:flex-row h-screen w-full bg-white overflow-hidden"
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
                                <CleanLink
                                    href="/view"
                                    className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-zinc-900 transition-colors border-b border-zinc-200 hover:border-zinc-900 pb-0.5"
                                >
                                    Retrieve
                                </CleanLink>
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

                            {/* Blog Link */}
                            <div className="pt-6 max-w-md">
                                <CleanLink
                                    href="/blog"
                                    className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                                >
                                    <span className="text-xs font-medium uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 transition-colors">Blog</span>
                                    <span className="text-zinc-300 group-hover:text-zinc-500 transition-colors">→</span>
                                </CleanLink>
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
