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
      
      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />
      
      <h2>System Architecture Overview</h2>
      <pre style="background: #0a0a0a; color: #a0a0a0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 11px; line-height: 1.4;"><code>┌─────────────────────────────────────────────────────────────────────────────┐
│                        ARTE TOKEN SYSTEM                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │    STUDIO    │     │    VIEWER    │     │   URL/SHARE  │                 │
│  │   /studio    │     │    /view     │     │    ?token=   │                 │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘                 │
│         │                    │                    │                          │
│         └────────────────────┴────────────────────┘                          │
│                              │                                               │
│                              ▼                                               │
│  ┌───────────────────────────────────────────────────────────┐              │
│  │                     TOKEN ROUTER                           │              │
│  │                                                            │              │
│  │   Token Format Detection:                                  │              │
│  │   ┌─────────────────────────────────────────────────────┐ │              │
│  │   │ fx-{type}-{hash}{checksum}      → Random Seed       │ │              │
│  │   │ fx-{type}-v1-{data}-{checksum}  → State Token       │ │              │
│  │   │ fx-{type}-v1-ENC:{data}-{chk}   → Encrypted Token   │ │              │
│  │   └─────────────────────────────────────────────────────┘ │              │
│  └───────────────────────────────────────────────────────────┘              │
│                              │                                               │
│              ┌───────────────┴───────────────┐                              │
│              ▼                               ▼                               │
│  ┌─────────────────────┐        ┌─────────────────────────┐                 │
│  │   utils/token.ts    │        │ utils/serialization.ts  │                 │
│  │                     │        │                         │                 │
│  │  • generateToken()  │        │  • encodeParams()       │                 │
│  │  • validateToken()  │        │  • decodeParams()       │                 │
│  │  • tokenToSeed()    │        │  • xorCipher()          │                 │
│  │  • hashToken()      │        │  • calculateChecksum()  │                 │
│  └──────────┬──────────┘        └───────────┬─────────────┘                 │
│             │                               │                                │
│             └───────────────┬───────────────┘                                │
│                             ▼                                                │
│  ┌───────────────────────────────────────────────────────────┐              │
│  │                 utils/artworkGenerator.ts                  │              │
│  │                                                            │              │
│  │  Artwork-specific parameter generators:                    │              │
│  │  • generateFlowParamsFromToken()                          │              │
│  │  • generateMosaicParamsFromToken()                        │              │
│  │  • generateTreeParamsFromToken()                          │              │
│  │  • generateTextDesignParamsFromToken()                    │              │
│  └───────────────────────────────────────────────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘</code></pre>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />
      
      <h2>Token Types Deep Dive</h2>
      
      <h3>Type 1: Random Seed Tokens</h3>
      <p><strong>Format:</strong> <code>fx-{type}-{44-char random hash}{2-char checksum}</code></p>
      <p><strong>Example:</strong> <code>fx-mosaic-3xKpR9YbM2nTqWe5...vb81</code></p>
      
      <pre style="background: #0a0a0a; color: #a0a0a0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 11px; line-height: 1.4;"><code>              RANDOM TOKEN STRUCTURE
┌─────────────────────────────────────────────────┐
│                                                 │
│  fx-mosaic-3xKpR9YbM2nTqWe5...vb81             │
│  ││  │      │                    ││             │
│  ││  │      │                    │└─ Checksum   │
│  ││  │      │                    │   (2 hex)    │
│  ││  │      │                    │              │
│  ││  │      └────────────────────┴─ Random Hash │
│  ││  │                               (44 chars) │
│  ││  │                                          │
│  ││  └─ Artwork Type                            │
│  │└─ Separator                                  │
│  └─ Platform Prefix                             │
│                                                 │
└─────────────────────────────────────────────────┘</code></pre>

      <h3>Type 2: State-Encoded Tokens (v1)</h3>
      <p><strong>Format:</strong> <code>fx-{type}-v1-{base64 data}-{4-char checksum}</code></p>
      <p>When you manually change any parameter (color, size, etc.), the entire artwork state is captured and encoded.</p>
      
      <pre style="background: #0a0a0a; color: #a0a0a0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 11px; line-height: 1.4;"><code>           STATE TOKEN ENCODING
┌─────────────────────────────────────────────────┐
│                                                 │
│  User changes color #A8DADC → #FF0000          │
│                    │                            │
│                    ▼                            │
│  ┌─────────────────────────────────────────┐   │
│  │ Current Parameters Object:               │   │
│  │ {                                        │   │
│  │   color1: "#FF0000",  // Changed!        │   │
│  │   color2: "#E63946",                     │   │
│  │   color3: "#457B9D",                     │   │
│  │   ...23 more parameters...               │   │
│  │   canvasWidth: 630,                      │   │
│  │   canvasHeight: 790                      │   │
│  │ }                                        │   │
│  └─────────────────┬───────────────────────┘   │
│                    │                            │
│                    ▼                            │
│  ┌─────────────────────────────────────────┐   │
│  │ Convert to compact array (drop keys):    │   │
│  │ ["#FF0000","#E63946","#457B9D",...]     │   │
│  └─────────────────┬───────────────────────┘   │
│                    │                            │
│                    ▼                            │
│  ┌─────────────────────────────────────────┐   │
│  │ JSON.stringify → Base64 → XOR Encrypt   │   │
│  └─────────────────┬───────────────────────┘   │
│                    │                            │
│                    ▼                            │
│  fx-mosaic-v1-ENC:FisdLx...-a3f9               │
│                                                 │
└─────────────────────────────────────────────────┘</code></pre>

      <h3>Type 3: Encrypted State Tokens</h3>
      <p>For added obfuscation, v1 tokens are XOR-encrypted with a symmetric key:</p>
      
      <pre style="background: #0a0a0a; color: #a0a0a0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 11px; line-height: 1.4;"><code>            ENCRYPTION LAYER
┌─────────────────────────────────────────────────┐
│                                                 │
│  Plain Base64: "WyIjRkYwMDAw..."               │
│                    │                            │
│                    ▼                            │
│  ┌─────────────────────────────────────────┐   │
│  │ XOR Cipher with Key:                     │   │
│  │                                          │   │
│  │ for each char in plaintext:             │   │
│  │   encrypted[i] = plain[i] XOR key[i%16] │   │
│  └─────────────────┬───────────────────────┘   │
│                    │                            │
│                    ▼                            │
│  ┌─────────────────────────────────────────┐   │
│  │ Base64-encode result → Prefix "ENC:"    │   │
│  │ "ENC:FisdLxIXBDsPBRw..."                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  XOR is symmetric: encrypt(encrypt(x)) = x     │
│                                                 │
└─────────────────────────────────────────────────┘</code></pre>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>The PRNG: sfc32 Algorithm</h2>
      <p>For random seed tokens, we use the <strong>sfc32</strong> (Simple Fast Counter) algorithm, the same PRNG used by fxhash:</p>
      
      <pre style="background: #0a0a0a; color: #a0a0a0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 12px;"><code>function sfc32(a, b, c, d) {
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
        <li><strong>Deterministic:</strong> Same seed → identical sequence</li>
        <li><strong>Fast:</strong> Optimized for real-time art</li>
        <li><strong>Period: 2^128:</strong> Won't repeat in human lifetimes</li>
        <li><strong>Battle-tested:</strong> Used by fxhash platform</li>
      </ul>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Color Locking: Regenerate vs Randomize</h2>
      <p>A key feature is separating layout randomness from color choices:</p>
      
      <pre style="background: #0a0a0a; color: #a0a0a0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 11px; line-height: 1.4;"><code>            REGENERATE (Layout Only)
┌─────────────────────────────────────────────────┐
│                                                 │
│  Current State:                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ token: "fx-mosaic-abc123"               │   │
│  │ colorSeed: "fx-mosaic-abc123"           │   │
│  │ color1: "#A8DADC" (user-picked)         │   │
│  └─────────────────────────────────────────┘   │
│                    │                            │
│                    ▼ Click "Regenerate"         │
│  ┌─────────────────────────────────────────┐   │
│  │ NEW token: "fx-mosaic-xyz789"           │   │
│  │ KEEP colorSeed: "fx-mosaic-abc123"      │   │
│  │ KEEP colors: "#A8DADC"...               │   │
│  │ NEW layout params from xyz789           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Result: Different layout, SAME colors!        │
│                                                 │
└─────────────────────────────────────────────────┘</code></pre>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Complete Data Flow</h2>
      
      <pre style="background: #0a0a0a; color: #a0a0a0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 11px; line-height: 1.4;"><code>┌─────────────────────────────────────────────────────────────────────────────┐
│                           STUDIO → VIEWER FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [1] USER CREATES IN STUDIO                                                 │
│  ─────────────────────────                                                  │
│                                                                              │
│  ┌────────────────┐                                                         │
│  │ Click Randomize│───▶ generateToken('mosaic')                            │
│  └────────────────┘              │                                          │
│                                  ▼                                          │
│                     "fx-mosaic-3xKpR9YbM2nT..."                             │
│                                  │                                          │
│                                  ▼                                          │
│                     generateMosaicParamsFromToken()                         │
│                                  │                                          │
│                                  ▼                                          │
│                     Artwork renders on canvas                               │
│                                                                              │
│  [2] USER EDITS PARAMETERS                                                  │
│  ─────────────────────────                                                  │
│                                                                              │
│  ┌────────────────┐                                                         │
│  │ Change color   │───▶ setParams({ ...params, color1: "#FF0000" })        │
│  └────────────────┘              │                                          │
│                                  ▼                                          │
│                     encodeParams('mosaic', params)                          │
│                                  │                                          │
│                                  ▼                                          │
│                     "fx-mosaic-v1-ENC:FisdLx...-a3f9"                       │
│                                                                              │
│  [3] RECIPIENT VIEWS IN VIEWER                                              │
│  ────────────────────────────────                                           │
│                                                                              │
│  ┌────────────────┐                                                         │
│  │ Paste token    │───▶ validateToken() ✓                                  │
│  └────────────────┘              │                                          │
│                                  ▼                                          │
│                     decodeParams() → { color1: "#FF0000", ... }             │
│                                  │                                          │
│                                  ▼                                          │
│                     Artwork renders EXACTLY as creator saw it               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘</code></pre>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>File Structure</h2>
      
      <pre style="background: #0a0a0a; color: #a0a0a0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 12px;"><code>utils/
├── token.ts              # Token generation & validation
│   ├── generateToken()   # Create random token
│   ├── validateToken()   # Check format & checksum
│   ├── tokenToSeed()     # Convert to numeric seed
│   └── createSeededRandom() # Create PRNG
│
├── serialization.ts      # Parameter encoding/decoding
│   ├── encodeParams()    # Params → encrypted token
│   ├── decodeParams()    # Token → params object
│   ├── xorCipher()       # Symmetric encryption
│   └── calculateChecksum() # Integrity verification
│
└── artworkGenerator.ts   # Artwork-specific generators
    ├── generateFlowParamsFromToken()
    ├── generateMosaicParamsFromToken()
    ├── generateTreeParamsFromToken()
    └── generateTextDesignParamsFromToken()</code></pre>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Security: Checksum Binding</h2>
      <p>Checksums bind the artwork type to the token data, preventing type spoofing:</p>
      
      <pre style="background: #0a0a0a; color: #a0a0a0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 11px; line-height: 1.4;"><code>           CHECKSUM VALIDATION
┌─────────────────────────────────────────────────┐
│                                                 │
│  Attacker tries to change:                      │
│  fx-grid-abc123... → fx-mosaic-abc123...       │
│        │                    │                   │
│        ▼                    ▼                   │
│  Original checksum    New type mismatch!        │
│  = hash("grid" + data)  ≠ hash("mosaic" + data)│
│                                                 │
│  → REJECT: "Token checksum mismatch"           │
│                                                 │
└─────────────────────────────────────────────────┘</code></pre>

      <p><strong>Why checksums matter:</strong></p>
      <ul>
        <li>Copy-paste errors detected immediately</li>
        <li>Prevents URL corruption</li>
        <li>Explicit "Invalid token" message instead of broken artwork</li>
      </ul>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Lessons Learned</h2>
      
      <h3>1. Canvas Dimensions Are Critical</h3>
      <p>Initially, state tokens didn't include <code>canvasWidth</code> and <code>canvasHeight</code>. Artworks rendered at default 630×790 instead of custom sizes.</p>
      <p><strong>Fix:</strong> Added dimension fields to all encode/decode schemas.</p>
      
      <h3>2. Silent Failures Are Dangerous</h3>
      <p>When checksum validation failed, code silently fell back to random generation. Users saw completely different artwork without any error.</p>
      <p><strong>Fix:</strong> Made <code>decodeParams()</code> throw errors that propagate to the UI.</p>
      
      <h3>3. Type Binding Prevents Spoofing</h3>
      <p>Without binding artwork type to the checksum, users could change <code>fx-grid-</code> to <code>fx-mosaic-</code> and bypass validation.</p>
      <p><strong>Fix:</strong> Include <code>artworkType</code> in checksum calculation.</p>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

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

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Conclusion</h2>
      <p>This token system embodies three principles:</p>
      <ol>
        <li><strong>Determinism</strong> — Same token → Same artwork, always</li>
        <li><strong>Portability</strong> — Share art with a string, not gigabytes</li>
        <li><strong>Security</strong> — Checksums prevent corruption & tampering</li>
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
