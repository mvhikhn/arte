"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
    const artworks = [
        { id: "flow", title: "Flow Field", description: "Generative flow particles" },
        { id: "grid", title: "Grid System", description: "Structured chaos" },
        { id: "mosaic", title: "Mosaic", description: "Tiled patterns" },
        { id: "rotated", title: "Rotated Grid", description: "Angular compositions" },
        { id: "tree", title: "Recursive Tree", description: "Organic growth algorithms" },
        { id: "textdesign", title: "Text Design", description: "Typography experiments" },
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
        <main className="min-h-screen w-full flex flex-col md:flex-row bg-white text-zinc-900 font-sans selection:bg-zinc-100">
            {/* Left Section - Bio */}
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-zinc-200 p-6 md:p-12 flex flex-col justify-between min-h-[50vh] md:min-h-screen">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-medium tracking-tight">Mahi Khan</h1>
                        <p className="text-zinc-500 text-sm">Creative Technologist & Design Engineer</p>
                    </div>

                    <div className="max-w-md space-y-6 text-sm leading-relaxed text-zinc-600">
                        <p>
                            Exploring the intersection of code, design, and generative art.
                            Building tools that empower creativity and systems that generate beauty.
                        </p>
                        <p>
                            Based in Dhaka. Working on experimental interfaces and digital gardens.
                        </p>
                    </div>
                </div>

                <div className="mt-12 md:mt-0 space-y-4">
                    <div className="flex gap-6 text-sm">
                        <a href="https://github.com/mvhikhn" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-900 transition-colors">GitHub</a>
                        <a href="https://linkedin.com/in/mvhikhn" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-900 transition-colors">LinkedIn</a>
                        <a href="https://x.com/mvhikhn" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-900 transition-colors">X</a>
                        <a href="mailto:mvhikhn@gmail.com" className="text-zinc-500 hover:text-zinc-900 transition-colors">Email</a>
                    </div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                        © {new Date().getFullYear()} @mvhikhn
                    </p>
                </div>
            </div>

            {/* Right Section - Gallery */}
            <div className="w-full md:w-1/2 p-6 md:p-12 overflow-y-auto h-[50vh] md:h-screen custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
