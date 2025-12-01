"use client";

import { useState, useEffect } from "react";
import CleanLink from "@/components/CleanLink";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import { useParams } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Placeholder blog content
const BLOG_POSTS: Record<string, { title: string; date: string; content: string }> = {
    "hello-world": {
        title: "Hello World",
        date: "November 29, 2025",
        content: `
This is the start of my digital garden. A place where I'll document my journey through creative coding, design engineering, and the search for mastery.

I've always been fascinated by the intersection of logic and beauty. Algorithmic art provides a unique canvas where code becomes the brush and mathematics the paint.

Stay tuned for more updates on my process and experiments.
    `
    },
    "algorithmic-beauty": {
        title: "The Beauty of Algorithms",
        date: "December 05, 2025",
        content: `
When we think of algorithms, we often think of efficiency, sorting, or data processing. But algorithms can also be expressive.

In my work with flow fields and recursive trees, I've found that simple rules can lead to emergent complexity that mimics nature in surprising ways.
    `
    },
    "mosaic-technical-deep-dive": {
        title: "Mosaic: A Technical Deep Dive",
        date: "December 12, 2025",
        content: `
The **Mosaic** artwork is a generative system exploring the balance between structure and randomness. Inspired by the De Stijl movement and Piet Mondrian's compositions, it uses recursive algorithms to create balanced, grid-based layouts.

## Core Algorithm: Recursive Subdivision

At its heart, Mosaic relies on a recursive function \`divideRectangle\`. Starting with a large rectangle (or the entire canvas), the algorithm decides whether to:

1.  **Split** the rectangle into two smaller ones (vertically or horizontally).
2.  **Stop** and draw the rectangle.

This simple decision tree creates complex, non-uniform grids.

## The Mathematics of Balance

To prevent the composition from looking too chaotic or too uniform, we introduce biased randomness.

The \`splitRatio\` determines where a cut happens. Instead of a perfect 0.5 (halfway) split, we use a range:

$$
split = w \\times random(0.4, 0.6)
$$

This slight variation creates a more organic, "hand-drawn" feel.

## Implementation

Here is the core TypeScript logic using p5.js:

\`\`\`typescript
const divideRectangle = (x, y, w, h) => {
  if (random() > recursionChance && min(w, h) > minSize) {
    // Decide split direction based on aspect ratio
    if (w >= h) {
      let split = w * random(0.4, 0.6);
      divideRectangle(x, y, split, h);
      divideRectangle(x + split, y, w - split, h);
    } else {
      let split = h * random(0.4, 0.6);
      divideRectangle(x, y, w, split);
      divideRectangle(x, y + split, w, h - split);
    }
  } else {
    drawRectangle(x, y, w, h);
  }
};
\`\`\`

## Aesthetics & Texture

To ground the digital abstraction, we apply a noise grain layer. This mimics the texture of paper or canvas, softening the harsh digital edges.

$$
noise(x, y) = perlin(x \\times 0.01, y \\times 0.01)
$$

The color palette is also crucial. We use a limited set of 4 colors, randomly assigned but weighted to ensure contrast.

---

**Mosaic** is a study in how simple rules, applied recursively, can generate infinite variation while maintaining a cohesive visual identity.
        `
    }
};

export default function BlogPost() {
    const params = useParams();
    const slug = params.slug as string;
    const post = BLOG_POSTS[slug];
    const [scrollProgress, setScrollProgress] = useState(0);

    // Scroll progress handled in onScroll prop

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-light mb-4">Post not found</h1>
                <CleanLink href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back Home
                </CleanLink>
            </div>
        );
    }

    return (
        <div className="h-dvh w-full bg-white flex flex-col overflow-hidden">
            {/* Progress Bar */}
            <div
                className="fixed top-0 left-0 h-[1px] bg-zinc-900 z-50 transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress * 100}%` }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center bg-white/80 backdrop-blur-sm z-40 pointer-events-none">
                <div className="pointer-events-auto">
                    <CleanLink href="/" className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                        <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0">Home</span>
                    </CleanLink>
                </div>
            </nav>

            {/* Scrollable Content */}
            <div
                className="flex-1 overflow-y-auto no-scrollbar"
                onScroll={(e) => {
                    const target = e.currentTarget;
                    const totalScroll = target.scrollTop;
                    const windowHeight = target.scrollHeight - target.clientHeight;
                    const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
                    setScrollProgress(scroll);
                }}
            >
                <article className="w-full max-w-2xl mx-auto px-6 pt-32 pb-20">
                    <header className="mb-12 space-y-4">
                        <div className="text-xs text-zinc-400 uppercase tracking-widest">{post.date}</div>
                        <h1 className="text-3xl md:text-4xl font-light text-zinc-900 tracking-tight leading-tight">
                            {post.title}
                        </h1>
                    </header>

                    <div className="prose prose-zinc prose-sm md:prose-base max-w-none font-light text-zinc-600 leading-relaxed">
                        <MDXRemote
                            source={post.content}
                            options={{
                                mdxOptions: {
                                    remarkPlugins: [remarkMath],
                                    rehypePlugins: [rehypeKatex],
                                }
                            }}
                        />
                    </div>

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
                                <CleanLink
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
                                </CleanLink>
                            </div>
                        );
                    })()}
                </article>
            </div>
        </div>
    );
}
