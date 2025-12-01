"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import { useParams } from "next/navigation";

// Placeholder blog content
const BLOG_POSTS: Record<string, { title: string; date: string; content: string }> = {
    "hello-world": {
        title: "Hello World",
        date: "November 29, 2025",
        content: `
      <p>This is the start of my digital garden. A place where I'll document my journey through creative coding, design engineering, and the search for mastery.</p>
      <p>I've always been fascinated by the intersection of logic and beauty. Algorithmic art provides a unique canvas where code becomes the brush and mathematics the paint.</p>
      <p>Stay tuned for more updates on my process and experiments.</p>
    `
    },
    "algorithmic-beauty": {
        title: "The Beauty of Algorithms",
        date: "December 05, 2025",
        content: `
      <p>When we think of algorithms, we often think of efficiency, sorting, or data processing. But algorithms can also be expressive.</p>
      <p>In my work with flow fields and recursive trees, I've found that simple rules can lead to emergent complexity that mimics nature in surprising ways.</p>
    `
    }
};

export default function BlogPost() {
    const params = useParams();
    const slug = params.slug as string;
    const post = BLOG_POSTS[slug];
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setScrollProgress(Number(scroll));
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-light mb-4">Post not found</h1>
                <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Progress Bar */}
            <div
                className="fixed top-0 left-0 h-[1px] bg-zinc-900 z-50 transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress * 100}%` }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center bg-white/80 backdrop-blur-sm z-40">
                <Link href="/" className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0">Home</span>
                </Link>
            </nav>

            {/* Content */}
            <article className="flex-grow w-full max-w-2xl mx-auto px-6 pt-32 pb-20">
                <header className="mb-12 space-y-4">
                    <div className="text-xs text-zinc-400 uppercase tracking-widest">{post.date}</div>
                    <h1 className="text-3xl md:text-4xl font-light text-zinc-900 tracking-tight leading-tight">
                        {post.title}
                    </h1>
                </header>

                <div
                    className="prose prose-zinc prose-sm md:prose-base max-w-none font-light text-zinc-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Next Post Navigation */}
                {(() => {
                    const slugs = Object.keys(BLOG_POSTS);
                    const currentIndex = slugs.indexOf(slug);
                    const nextIndex = (currentIndex + 1) % slugs.length;
                    const nextSlug = slugs[nextIndex];
                    const nextPost = BLOG_POSTS[nextSlug];

                    return (
                        <div className="mt-20 pt-12 border-t border-zinc-100">
                            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">Read Next</p>
                            <Link
                                href={`/blog/${nextSlug}`}
                                className="group inline-flex items-center gap-4"
                            >
                                <div className="space-y-1">
                                    <h3 className="text-xl font-light text-zinc-900 group-hover:text-zinc-600 transition-colors">
                                        {nextPost.title}
                                    </h3>
                                    <p className="text-sm text-zinc-400 font-mono">{nextPost.date}</p>
                                </div>
                                <div className="p-2 rounded-full bg-zinc-50 group-hover:bg-zinc-100 transition-colors">
                                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                                </div>
                            </Link>
                        </div>
                    );
                })()}
            </article>

            <Footer />
        </div>
    );
}
