"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";

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

    useEffect(() => {
        const pastelColors = artworks.map(() => {
            const hue = Math.floor(Math.random() * 360);
            const saturation = Math.floor(Math.random() * 30) + 60; // 60-90%
            const lightness = Math.floor(Math.random() * 15) + 85; // 85-100%
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        setArtworkColors(pastelColors);
    }, []);

    return (
        <main className="h-screen w-full flex flex-col md:flex-row bg-white text-zinc-900 font-sans selection:bg-zinc-100 overflow-hidden">
            {/* Left Section - Bio, Blog, Footer - Scrollable */}
            <div className="w-full md:w-1/2 h-full overflow-y-auto no-scrollbar border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col">
                <div className="p-6 md:p-12 flex-grow">
                    <div className="space-y-12">
                        {/* Header */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-medium tracking-tight">Mahi Khan</h1>
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
                    </div>
                </div>

                {/* Footer at the bottom of left section */}
                <Footer />
            </div>

            {/* Right Section - Gallery - Scrollable */}
            <div className="w-full md:w-1/2 h-full overflow-y-auto no-scrollbar p-6 md:p-12 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
                    {artworks.map((artwork, index) => (
                        <Link
                            key={artwork.id}
                            href={`/studio?artwork=${artwork.id}`}
                            className="group block aspect-square border border-zinc-100 hover:border-zinc-300 transition-all duration-300 p-6 flex flex-col justify-between"
                            style={{ backgroundColor: artworkColors[index] || '#f5f5f5' }}
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
