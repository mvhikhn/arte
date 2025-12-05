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
    },
    "secure-token-architecture": {
        title: "Building an Evergreen Secure Token System",
        date: "December 05, 2024",
        content: `
      <p>When you create generative art, every slider tweak, color choice, and parameter adjustment defines a unique piece. But how do you <strong>share</strong> that creation without revealing the recipe? How do you let someone view your art while keeping your creative parameters hidden?</p>
      
      <p>This post documents the complete journey of building a <strong>zero-cost, evergreen, cryptographically-secure</strong> token system for the ARTE generative art platform.</p>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>The Challenge</h2>
      <p>Traditional generative art platforms face a fundamental tension:</p>
      <ul>
        <li><strong>Save as image</strong> → Easy to share, but loses interactivity</li>
        <li><strong>Save parameters as JSON</strong> → Preserves state, but exposes your creative recipe</li>
        <li><strong>Client-side encryption</strong> → Hides parameters, but key is exposed in browser code</li>
      </ul>
      <p>We needed: compact URLs, hidden parameters, zero server costs, and evergreen operation.</p>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>The Solution: Hybrid Token Architecture</h2>
      <p>We built a <strong>dual-token system</strong> that optimizes for both speed and security:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e5e5;">
            <th style="text-align: left; padding: 0.75rem;">Token</th>
            <th style="text-align: left; padding: 0.75rem;">Format</th>
            <th style="text-align: left; padding: 0.75rem;">Use Case</th>
            <th style="text-align: left; padding: 0.75rem;">Speed</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;"><strong>v2</strong></td>
            <td style="padding: 0.75rem; font-family: monospace; font-size: 12px;">fx-mosaic-v2.{hash}.{data}</td>
            <td style="padding: 0.75rem;">Live editing in Studio</td>
            <td style="padding: 0.75rem;">⚡ Instant (no network)</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;"><strong>v2e</strong></td>
            <td style="padding: 0.75rem; font-family: monospace; font-size: 12px;">fx-mosaic-v2e.{hash}.{data}</td>
            <td style="padding: 0.75rem;">Sharing/selling artwork</td>
            <td style="padding: 0.75rem;">🔐 ~200ms (encrypted)</td>
          </tr>
        </tbody>
      </table>

      <h3>Why Two Types?</h3>
      <p>When you're creating art, you move sliders constantly. Each adjustment regenerates the token. Making a network call for every slider movement would be painfully slow.</p>
      <p>But when you're sharing, security matters more than speed. The encrypted token ensures your parameters are completely hidden.</p>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Technical Deep Dive</h2>

      <h3>Token Structure</h3>
      <pre style="background: #0a0a0a; color: #a0a0a0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 12px;"><code>fx-mosaic-v2e.7e0019cc96d321d2.koymarpzu8bVMZjZuu1fM2GMSnYu...
│  │      │   │                │
│  │      │   │                └── AES-256-GCM Encrypted + Base64
│  │      │   └── SHA-256 Hash (first 16 chars)
│  │      └── Version + Encryption flag
│  └── Artwork type (mosaic, flow, tree, etc.)
└── Prefix (always "fx")</code></pre>

      <h3>The Encryption Pipeline</h3>
      <ol>
        <li><strong>Canonicalize</strong> — Sort keys alphabetically, round floats to 4 decimals</li>
        <li><strong>Stringify</strong> — JSON.stringify for consistent serialization</li>
        <li><strong>Compress</strong> — LZ-String reduces payload by ~60%</li>
        <li><strong>Hash</strong> — SHA-256 for integrity verification</li>
        <li><strong>Encrypt</strong> — Send to Cloudflare Worker for AES-256-GCM encryption</li>
        <li><strong>Assemble</strong> — Combine prefix + hash + encrypted data</li>
      </ol>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Cloudflare Workers: The Secret Sauce</h2>
      <p>The encryption/decryption logic runs on Cloudflare Workers—serverless functions that:</p>
      <ul>
        <li>✅ Cost $0 (free tier: 100K requests/day)</li>
        <li>✅ Run on Cloudflare's global edge network</li>
        <li>✅ Store the secret key in secure environment variables</li>
        <li>✅ Never expose the key to the browser</li>
      </ul>

      <h3>Why AES-256-GCM?</h3>
      <p>AES-GCM is <strong>authenticated encryption</strong>. The "GCM" mode includes an authentication tag. If decryption succeeds, the data is mathematically guaranteed to be untampered. This means we don't need a separate hash validation step on the server—AES-GCM handles it automatically.</p>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Security Measures</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e5e5;">
            <th style="text-align: left; padding: 0.75rem;">Measure</th>
            <th style="text-align: left; padding: 0.75rem;">Implementation</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;">Secret key isolation</td>
            <td style="padding: 0.75rem;">Only exists in Cloudflare environment variables</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;">No client-side key</td>
            <td style="padding: 0.75rem;">Browser never sees the encryption key</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;">Authenticated encryption</td>
            <td style="padding: 0.75rem;">AES-256-GCM validates integrity automatically</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;">No silent fallbacks</td>
            <td style="padding: 0.75rem;">Encryption failure = user alert, not unencrypted token</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;">Hidden Studio button</td>
            <td style="padding: 0.75rem;">v2e tokens hide "Open in Studio" to prevent reverse-engineering</td>
          </tr>
        </tbody>
      </table>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Cost Analysis: Truly Evergreen</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e5e5;">
            <th style="text-align: left; padding: 0.75rem;">Component</th>
            <th style="text-align: left; padding: 0.75rem;">Provider</th>
            <th style="text-align: left; padding: 0.75rem;">Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;">Frontend hosting</td>
            <td style="padding: 0.75rem;">Vercel/Netlify/GitHub Pages</td>
            <td style="padding: 0.75rem;">$0</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;">Encryption API</td>
            <td style="padding: 0.75rem;">Cloudflare Workers (100K req/day free)</td>
            <td style="padding: 0.75rem;">$0</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;">Secret storage</td>
            <td style="padding: 0.75rem;">CF Worker environment variables</td>
            <td style="padding: 0.75rem;">$0</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 0.75rem;">Database</td>
            <td style="padding: 0.75rem;">None needed (stateless tokens)</td>
            <td style="padding: 0.75rem;">$0</td>
          </tr>
          <tr style="border-bottom: 2px solid #e5e5e5; font-weight: bold;">
            <td style="padding: 0.75rem;">Total monthly cost</td>
            <td style="padding: 0.75rem;"></td>
            <td style="padding: 0.75rem;">$0</td>
          </tr>
        </tbody>
      </table>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Lessons Learned</h2>
      
      <h3>1. AES-GCM Makes Re-Hashing Redundant</h3>
      <p>Our initial design validated tokens by decrypting, re-hashing, and comparing. But AES-GCM already includes an authentication tag. If decryption succeeds, the data is untampered. Re-hashing added no security, just complexity.</p>

      <h3>2. Synchronous SHA-256 is Possible</h3>
      <p>The Web Crypto API is async-only. But for instant-feedback UI, we needed synchronous hashing. Solution: a pure JavaScript SHA-256 implementation (~100 lines).</p>

      <h3>3. Silent Fallbacks Are Dangerous</h3>
      <p>Our first version silently returned unencrypted tokens if encryption failed. Users could click "Get Secure Link" and receive an unencrypted v2 token without knowing. We fixed this to throw an error instead.</p>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Future Directions</h2>
      <ul>
        <li><strong>Key Rotation</strong> — Version-prefixed keys for backward compatibility</li>
        <li><strong>Token Expiration</strong> — Time-limited sharing for gallery previews</li>
        <li><strong>Rate Limiting</strong> — Cloudflare's built-in rate limiting</li>
        <li><strong>NFT Integration</strong> — Encrypted tokens as on-chain metadata</li>
      </ul>

      <hr style="margin: 3rem 0; border: none; border-top: 1px solid #e5e5e5;" />

      <h2>Conclusion</h2>
      <p>We built a token system that:</p>
      <ul>
        <li>✅ <strong>Works forever</strong> without ongoing costs</li>
        <li>✅ <strong>Protects artist parameters</strong> with AES-256-GCM encryption</li>
        <li>✅ <strong>Stays fast</strong> with hybrid local/encrypted tokens</li>
        <li>✅ <strong>Fails safely</strong> with explicit error handling</li>
      </ul>
      <p>The entire system runs on Cloudflare's free tier with no database, no sessions, and no maintenance required.</p>

      <p style="margin-top: 2rem; font-style: italic; color: #888;">Implementation details available in the <a href="https://github.com/mvhikhn/arte/tree/main/cloudflare-workers">source code</a>.</p>
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
