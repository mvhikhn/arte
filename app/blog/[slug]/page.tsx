"use client";

import { useState, useEffect } from "react";
import CleanLink from "@/components/CleanLink";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";

// Placeholder blog content
const BLOG_POSTS: Record<string, { title: string; date: string; content: string }> = {
    "artwork-retrieval-system": {
        title: "How Artwork Retrieval Works",
        date: "December 03, 2024",
        content: `
      <p>Every artwork you see on this site can be perfectly recreated from a simple string of characters—a token. This isn't magic; it's a carefully designed system inspired by platforms like fxhash that enables deterministic generation and exact state preservation.</p>
      
      <h2>The Problem</h2>
      <p>When you create generative art, you face a fundamental challenge: <strong>How do you save and share your exact creation?</strong></p>
      
      <p>Traditional approaches:</p>
      <ul>
        <li><strong>Save the image</strong> → Loses interactivity, parameters, can't recreate at different sizes</li>
        <li><strong>Save parameters</strong> → Verbose JSON files, difficult to share, not portable</li>
        <li><strong>Use random seeds</strong> → Can reproduce randomness, but manual changes are lost</li>
      </ul>
      
      <p>We needed something better: a compact, shareable code that captures the complete state of an artwork.</p>
      
      <h2>The Solution: Tokens</h2>
      
      <h3>What is a Token?</h3>
      <p>A token is a compact string that uniquely identifies an artwork iteration. Think of it as a "save code" for your creation.</p>
      
      <pre><code>Example Tokens:
fx-mosaic-3xKpR9YbM2nT...vb81          (Random seed token)
fx-mosaic-v1-eyJjb2xvcjEi...-a3f9      (State-encoded token)</code></pre>
      
      <h3>Token Anatomy</h3>
      <pre><code>┌──────────────── Token Format ────────────────┐
│                                               │
│  fx - TYPE - VERSION - DATA - CHECKSUM       │
│  │    │       │        │       │             │
│  │    │       │        │       └─ Tamper detection
│  │    │       │        └───────── Encoded parameters
│  │    │       └────────────────── v1 = state token
│  │    └────────────────────────── Artwork type
│  └─────────────────────────────── Platform prefix
│                                               │
└───────────────────────────────────────────────┘</code></pre>
      
      <h2>Two Token Types</h2>
      
      <h3>1. Random Seed Tokens</h3>
      <p><strong>Format:</strong> <code>fx-[type]-[randomhash][checksum]</code></p>
      <p><strong>Use Case:</strong> Initial random generation</p>
      <p><strong>Key insight:</strong> The same hash always produces the same artwork because it seeds a pseudo-random number generator (PRNG).</p>
      
      <h3>2. State-Encoded Tokens</h3>
      <p><strong>Format:</strong> <code>fx-[type]-v1-[base64data]-[checksum]</code></p>
      <p><strong>Use Case:</strong> Preserving manual edits</p>
      <p>When you change a color or any parameter, all settings are encoded into a Base64 string with a checksum for integrity verification.</p>
      
      <h2>Security: Checksums</h2>
      <p>Every token includes a checksum to detect corruption or tampering.</p>
      
      <pre><code>// Random Token Checksum
const checksumSource = \`\${artworkType}\${randomPart}\`;
let sum = 0;
for (let i = 0; i &lt; checksumSource.length; i++) {
    sum += checksumSource.charCodeAt(i);
}
const checksum = (sum % 256).toString(16).padStart(2, '0');</code></pre>
      
      <p>This binds the artwork type to the token. Changing <code>fx-grid-</code> to <code>fx-mosaic-</code> invalidates the checksum.</p>
      
      <p><strong>Why checksums matter:</strong></p>
      <ul>
        <li>Copy-paste errors detected immediately</li>
        <li>Prevents URL corruption</li>
        <li>Explicit "Invalid token" message instead of broken artwork</li>
      </ul>
      
      <h2>The Deterministic PRNG</h2>
      <p>For random tokens, we use the sfc32 algorithm (simple fast counter):</p>
      
      <pre><code>function sfc32(a, b, c, d) {
    return function() {
        a &gt;&gt;&gt;= 0; b &gt;&gt;&gt;= 0; c &gt;&gt;&gt;= 0; d &gt;&gt;&gt;= 0;
        let t = (a + b) | 0;
        a = b ^ b &gt;&gt;&gt; 9;
        b = c + (c &lt;&lt; 3) | 0;
        c = (c &lt;&lt; 21 | c &gt;&gt;&gt; 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t &gt;&gt;&gt; 0) / 4294967296;
    }
}</code></pre>
      
      <p><strong>Why sfc32?</strong></p>
      <ul>
        <li>Deterministic: Same seed → Same sequence</li>
        <li>Fast: Optimized for generative art</li>
        <li>Good distribution: Passes randomness tests</li>
        <li>Used by fxhash: Battle-tested</li>
      </ul>
      
      <h2>Complete Workflow</h2>
      
      <h3>Creating Art</h3>
      <pre><code>┌──────────┐
│  Studio  │
└────┬─────┘
     │
     ├─ Click Randomize ──&gt; Generate random token
     │                      └─&gt; Seed PRNG → Parameters
     │
     ├─ Tweak color ─────&gt; Encode all params → v1 token
     │
     └─ Copy token ──────&gt; Share with world</code></pre>
      
      <h3>Viewing Art</h3>
      <pre><code>┌──────────┐
│  Viewer  │
└────┬─────┘
     │
     ├─ Paste token
     │    └─&gt; Validate format &amp; checksum
     │
     ├─ Detect type ──────&gt; Mosaic / Grid / Tree / etc.
     │
     ├─ Check version ────&gt; Random or v1 state?
     │    │
     │    ├─ Random ─────&gt; tokenToSeed() → PRNG → Params
     │    └─ v1 ────────&gt; decodeParams() → Exact params
     │
     └─&gt; Render artwork</code></pre>
      
      <h2>Cross-Artwork Protection</h2>
      <p>Tokens are artwork-specific. A Mosaic token won't work on a Grid artwork.</p>
      <p><strong>Why?</strong> Prevents confusion, provides clear error messages, and ensures type safety.</p>
      
      <h2>URL Integration</h2>
      <p>Tokens flow seamlessly between pages. Studio reads <code>?token=</code> from URL and initializes the artwork state, allowing you to share exact creations via URL.</p>
      
      <h2>Technical Stack</h2>
      <ul>
        <li><strong>Frontend:</strong> Next.js 14 (App Router), TypeScript, p5.js</li>
        <li><strong>Token System:</strong> <code>utils/token.ts</code>, <code>utils/serialization.ts</code>, <code>utils/artworkGenerator.ts</code></li>
      </ul>
      
      <h2>Lessons Learned</h2>
      
      <h3>1. Canvas Dimensions Matter</h3>
      <p>Initially, state tokens didn't include <code>canvasWidth</code>, <code>canvasHeight</code>, etc. This caused artworks to render at default dimensions instead of actual size.</p>
      <p><strong>Fix:</strong> Added dimension fields to all encode/decode functions.</p>
      
      <h3>2. Error Propagation is Critical</h3>
      <p>When checksums failed, the code silently fell back to random generation. Users saw a different artwork instead of an error.</p>
      <p><strong>Fix:</strong> Made <code>decodeParams()</code> throw errors that propagate to the UI.</p>
      
      <h3>3. Type Binding Prevents Spoofing</h3>
      <p>Without binding artwork type to checksum, users could change <code>fx-grid-</code> to <code>fx-mosaic-</code> and bypass validation.</p>
      <p><strong>Fix:</strong> Include <code>artworkType</code> in checksum calculation.</p>
      
      <h2>Try It Yourself</h2>
      <ol>
        <li>Visit the <a href="/studio">Studio</a></li>
        <li>Generate a Mosaic artwork</li>
        <li>Change a color manually</li>
        <li>Copy the long token (starts with <code>fx-mosaic-v1-</code>)</li>
        <li>Paste it into the <a href="/view">Viewer</a></li>
        <li>See your exact custom artwork render</li>
      </ol>
      <p>Then try tampering with the token—change a single character. You'll get an explicit error instead of a broken image.</p>
      
      <h2>Conclusion</h2>
      <p>This token system embodies three principles:</p>
      <ol>
        <li><strong>Determinism</strong> - Same token → Same artwork, always</li>
        <li><strong>Portability</strong> - Share art with a string, not gigabytes</li>
        <li><strong>Security</strong> - Checksums prevent corruption &amp; tampering</li>
      </ol>
      <p>It's a foundation that makes generative art accessible, shareable, and permanent.</p>
      
      <p style="margin-top: 2rem; font-style: italic; color: #888;">Implementation details available in the <a href="https://github.com/mvhikhn/arte">source code</a>.</p>
    `
    },
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
                <CleanLink href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back Home
                </CleanLink>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col overflow-y-auto no-scrollbar">
            {/* Progress Bar */}
            <div
                className="fixed top-0 left-0 h-[1px] bg-zinc-900 z-50 transition-all duration-100 ease-out"
                style={{ width: `${scrollProgress * 100}%` }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center bg-white/80 backdrop-blur-sm z-40">
                <CleanLink href="/" className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0">Home</span>
                </CleanLink>
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
    );
}
