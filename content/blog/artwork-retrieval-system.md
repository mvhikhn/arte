---
title: "How Artwork Retrieval Works"
date: "Dec 03, 2024"
description: "A deep dive into the deterministic token system powering artwork generation and preservation on this site"
---

# How Artwork Retrieval Works

Every artwork you see on this site can be perfectly recreated from a simple string of characters—a token. This isn't magic; it's a carefully designed system inspired by platforms like fxhash that enables deterministic generation and exact state preservation.

## The Problem

When you create generative art, you face a fundamental challenge:

**How do you save and share your exact creation?**

Traditional approaches:
- **Save the image** → Loses interactivity, parameters, can't recreate at different sizes
- **Save parameters** → Verbose JSON files, difficult to share, not portable
- **Use random seeds** → Can reproduce randomness, but manual changes are lost

We needed something better: a compact, shareable code that captures the complete state of an artwork.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
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
│  │  • createSeededRandom() │    │  • calculateChecksum()  │                 │
│  └──────────┬──────────┘        └───────────┬─────────────┘                 │
│             │                               │                                │
│             └───────────────┬───────────────┘                                │
│                             ▼                                                │
│  ┌───────────────────────────────────────────────────────────┐              │
│  │                 utils/artworkGenerator.ts                  │              │
│  │                                                            │              │
│  │  Artwork-specific parameter generators:                    │              │
│  │  • generateFlowParamsFromToken()                          │              │
│  │  • generateGridParamsFromToken()                          │              │
│  │  • generateMosaicParamsFromToken()                        │              │
│  │  • generateRotatedGridParamsFromToken()                   │              │
│  │  • generateTreeParamsFromToken()                          │              │
│  │  • generateTextDesignParamsFromToken()                    │              │
│  └───────────────────────────────────────────────────────────┘              │
│                             │                                                │
│                             ▼                                                │
│  ┌───────────────────────────────────────────────────────────┐              │
│  │                   ARTWORK COMPONENTS                       │              │
│  │                                                            │              │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │              │
│  │  │ Artwork │ │  Grid   │ │ Mosaic  │ │ Rotated │          │              │
│  │  │ (Flow)  │ │ Artwork │ │ Artwork │ │  Grid   │          │              │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │              │
│  │                                                            │              │
│  │  ┌─────────┐ ┌──────────────┐                             │              │
│  │  │  Tree   │ │ TextDesign   │                             │              │
│  │  │ Artwork │ │   Artwork    │                             │              │
│  │  └─────────┘ └──────────────┘                             │              │
│  └───────────────────────────────────────────────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Token Types Deep Dive

### Type 1: Random Seed Tokens

**Format:** `fx-{type}-{44-char random hash}{2-char checksum}`

**Example:** `fx-mosaic-3xKpR9YbM2nTqWe5...vb81`

```
              RANDOM TOKEN STRUCTURE
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
└─────────────────────────────────────────────────┘
```

**Generation Flow:**

```
User clicks "Randomize"
         │
         ▼
┌────────────────────────────────┐
│ Generate 44 random characters  │
│ from Base58 alphabet           │
│ "123456789ABCDEFGH..."         │
└────────────────┬───────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│ Calculate checksum:            │
│                                │
│ source = type + randomPart     │
│ sum = Σ charCodeAt(i)          │
│ checksum = (sum % 256).hex()   │
└────────────────┬───────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│ Combine: fx-{type}-{hash}{chk} │
│                                │
│ fx-mosaic-3xKpR9...vb81        │
└────────────────┬───────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│ Hash token → 4 seed integers   │
│ Feed to sfc32 PRNG             │
│                                │
│ Every random() call returns    │
│ deterministic values           │
└────────────────────────────────┘
```

### Type 2: State-Encoded Tokens (v1)

**Format:** `fx-{type}-v1-{base64 data}-{4-char checksum}`

**Example:** `fx-mosaic-v1-eyJjb2xvcjEi...-a3f9`

When you manually change any parameter (color, size, etc.), the entire artwork state is captured:

```
           STATE TOKEN ENCODING
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
│  │   color4: "#1D3557",                     │   │
│  │   initialRectMinSize: 40,                │   │
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
│  │ JSON.stringify → Base64 encode          │   │
│  │ "WyIjRkYwMDAw..."                       │   │
│  └─────────────────┬───────────────────────┘   │
│                    │                            │
│                    ▼                            │
│  ┌─────────────────────────────────────────┐   │
│  │ Calculate 4-char checksum               │   │
│  │ sum = Σ charCodeAt(i)                   │   │
│  │ checksum = (sum % 65536).hex(4)         │   │
│  └─────────────────┬───────────────────────┘   │
│                    │                            │
│                    ▼                            │
│  fx-mosaic-v1-WyIjRkYwMDAw...-a3f9             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Type 3: Encrypted State Tokens

**Format:** `fx-{type}-v1-ENC:{encrypted base64}-{checksum}`

For added obfuscation, v1 tokens are XOR-encrypted:

```
            ENCRYPTION LAYER
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
│  │                                          │   │
│  │ Key: "ARTE_SECURE_2024" (16 chars)       │   │
│  └─────────────────┬───────────────────────┘   │
│                    │                            │
│                    ▼                            │
│  ┌─────────────────────────────────────────┐   │
│  │ Base64-encode the XOR result            │   │
│  │ (makes it URL-safe again)               │   │
│  └─────────────────┬───────────────────────┘   │
│                    │                            │
│                    ▼                            │
│  ┌─────────────────────────────────────────┐   │
│  │ Prefix with "ENC:" marker               │   │
│  │ "ENC:FisdLxIXBDsPBRw..."                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Final Token:                                   │
│  fx-mosaic-v1-ENC:FisdLxIXBDsPBRw...-5e06      │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Decryption (symmetric):**

```
ENC:FisdLxIX...  →  Base64 decode  →  XOR cipher  →  Original Base64
```

XOR is its own inverse: `encrypt(encrypt(data)) = data`

---

## The PRNG: sfc32 Algorithm

For random seed tokens, we use the **sfc32** (Simple Fast Counter) algorithm, the same PRNG used by fxhash:

```typescript
function sfc32(a: number, b: number, c: number, d: number) {
    return function() {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}
```

**Why sfc32?**

| Property | Benefit |
|----------|---------|
| Deterministic | Same seed → identical sequence |
| Fast | Optimized for real-time art |
| Period: 2^128 | Won't repeat in human lifetimes |
| Battle-tested | Used by fxhash platform |

**Token → Seeds → PRNG:**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Token: "fx-mosaic-3xKpR9YbM2nT..."                 │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ hashToken(token):                             │   │
│  │                                               │   │
│  │ hashes = [0, 0, 0, 0]                        │   │
│  │ for each char:                               │   │
│  │   hashes[i % 4] = hash algorithm             │   │
│  │                                               │   │
│  │ Returns: [2847194823, 1923847, 39284, 8374]  │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ sfc32(hash[0], hash[1], hash[2], hash[3])    │   │
│  │                                               │   │
│  │ Returns function that generates:             │   │
│  │   0.7234, 0.1923, 0.8372, 0.4521, ...       │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Same token always produces identical sequence!     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Parameter Schemas by Artwork Type

Each artwork type has a specific encoding schema. Parameters are stored as arrays (no keys) for compactness:

### Mosaic Parameters (25 fields)

```
Index  Parameter              Type     Example
─────  ─────────────────────  ───────  ─────────
0      color1                 string   "#A8DADC"
1      color2                 string   "#E63946"
2      color3                 string   "#457B9D"
3      color4                 string   "#1D3557"
4      initialRectMinSize     number   40
5      initialRectMaxSize     number   100
6      gridDivisionChance     number   0.5
7      recursionChance        number   0.3
8      minGridRows            number   2
9      maxGridRows            number   5
10     minGridCols            number   2
11     maxGridCols            number   5
12     splitRatioMin          number   0.3
13     splitRatioMax          number   0.7
14     marginMultiplier       number   0.02
15     detailGridMin          number   2
16     detailGridMax          number   4
17     noiseDensity           number   0.5
18     minRecursionSize       number   20
19     canvasWidth            number   630
20     canvasHeight           number   790
21     exportWidth            number   1600
22     exportHeight           number   2000
23     token (original seed)  string   "fx-mosaic-..."
24     colorSeed              string   "fx-mosaic-..."
```

### TextDesign Parameters (Nested Structure)

TextDesign uses nested arrays for layers:

```
Index  Parameter              Type     
─────  ─────────────────────  ───────
0      backgroundColor        string
1      grainAmount            number
2      fontUrl                string
3      customFontFamily       string
4      canvasWidth            number
5      canvasHeight           number
6      exportWidth            number
7      exportHeight           number
8      layer1                 array[16]  ◄─┐
9      layer2                 array[16]    │
10     layer3                 array[16]    │
11     token                  string       │
12     colorSeed              string       │
                                           │
Layer Array Structure: ◄───────────────────┘

Index  Field           Type
─────  ──────────────  ──────
0      text            string
1      x               number (0.0-1.0)
2      y               number (0.0-1.0)  
3      size            number
4      alignment       string
5      fill            string
6      extrudeDepth    number
7      extrudeX        number
8      extrudeY        number
9      extrudeStart    string
10     extrudeEnd      string
11     highlight       string
12     showHighlight   0 | 1
13     outlineThickness number
14     outlineColor    string
15     fontUrl         string
```

---

## Security: Checksum Binding

Checksums bind the artwork type to the token data, preventing type spoofing:

```
           CHECKSUM VALIDATION
┌─────────────────────────────────────────────────┐
│                                                 │
│  Attacker tries to change:                      │
│  fx-grid-abc123... → fx-mosaic-abc123...       │
│        │                    │                   │
│        ▼                    ▼                   │
│  Original checksum    New type mismatch!        │
│  = hash("grid" + data)  ≠ hash("mosaic" + data)│
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ validateToken("fx-mosaic-abc...", type):  │ │
│  │                                           │ │
│  │  calculatedChecksum ≠ providedChecksum   │ │
│  │                                           │ │
│  │  → REJECT: "Token checksum mismatch"     │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Color Locking: Regenerate vs Randomize

A key feature is separating layout randomness from color choices:

```
            REGENERATE (Layout Only)
┌─────────────────────────────────────────────────┐
│                                                 │
│  Current State:                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ token: "fx-mosaic-abc123"               │   │
│  │ colorSeed: "fx-mosaic-abc123"           │   │
│  │ color1: "#A8DADC" (user-picked)         │   │
│  │ color2: "#E63946"                       │   │
│  │ ...layout params...                     │   │
│  └─────────────────────────────────────────┘   │
│                    │                            │
│                    ▼ Click "Regenerate"         │
│  ┌─────────────────────────────────────────┐   │
│  │ NEW token: "fx-mosaic-xyz789"           │   │
│  │ KEEP colorSeed: "fx-mosaic-abc123"      │   │
│  │ KEEP colors: "#A8DADC", "#E63946"...    │   │
│  │ NEW layout params from xyz789           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Result: Different layout, SAME colors!        │
│                                                 │
└─────────────────────────────────────────────────┘

            RANDOMIZE (Everything New)
┌─────────────────────────────────────────────────┐
│                                                 │
│  Current State: (same as above)                 │
│                    │                            │
│                    ▼ Click "Randomize"          │
│  ┌─────────────────────────────────────────┐   │
│  │ NEW token: "fx-mosaic-def456"           │   │
│  │ NEW colorSeed: "fx-mosaic-def456"       │   │
│  │ NEW colors from generator               │   │
│  │ NEW layout params                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Result: Completely fresh artwork!              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
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
│                     { color1: "#A8DADC", ... }                              │
│                                  │                                          │
│                                  ▼                                          │
│                     Artwork renders on canvas                               │
│                                                                              │
│                                                                              │
│  [2] USER EDITS PARAMETERS                                                  │
│  ─────────────────────────                                                  │
│                                                                              │
│  ┌────────────────┐                                                         │
│  │ Change color1  │───▶ setParams({ ...params, color1: "#FF0000" })        │
│  │ to #FF0000     │              │                                          │
│  └────────────────┘              ▼                                          │
│                     encodeParams('mosaic', params)                          │
│                                  │                                          │
│                                  ▼                                          │
│                     "fx-mosaic-v1-ENC:FisdLx...-a3f9"                       │
│                                  │                                          │
│                                  ▼                                          │
│                     URL updates: ?token=fx-mosaic-v1-...                    │
│                                                                              │
│                                                                              │
│  [3] USER SHARES TOKEN                                                      │
│  ────────────────────                                                       │
│                                                                              │
│  ┌────────────────┐                                                         │
│  │ Copy token     │───▶ "fx-mosaic-v1-ENC:FisdLx...-a3f9"                  │
│  └────────────────┘              │                                          │
│                                  │                                          │
│                         (Send via message/email/URL)                        │
│                                  │                                          │
│                                  ▼                                          │
│                                                                              │
│  [4] RECIPIENT VIEWS IN VIEWER                                              │
│  ────────────────────────────────                                           │
│                                                                              │
│  ┌────────────────┐                                                         │
│  │ Paste token    │───▶ validateToken() ✓                                  │
│  │ in /view       │              │                                          │
│  └────────────────┘              ▼                                          │
│                     Detect type: "mosaic"                                   │
│                                  │                                          │
│                                  ▼                                          │
│                     Detect version: "v1" (state token)                      │
│                                  │                                          │
│                                  ▼                                          │
│                     Detect encryption: "ENC:" prefix                        │
│                                  │                                          │
│                                  ▼                                          │
│                     xorCipher(fromBase64(data))                             │
│                                  │                                          │
│                                  ▼                                          │
│                     decodeParams() → { color1: "#FF0000", ... }             │
│                                  │                                          │
│                                  ▼                                          │
│                     MosaicArtwork renders EXACTLY as creator saw it         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
utils/
├── token.ts              # Token generation & validation
│   ├── generateToken()   # Create random token
│   ├── validateToken()   # Check format & checksum
│   ├── tokenToSeed()     # Convert to numeric seed
│   ├── createSeededRandom() # Create PRNG
│   └── hashToken()       # Generate 4 seed values
│
├── serialization.ts      # Parameter encoding/decoding
│   ├── encodeParams()    # Params → encrypted token
│   ├── decodeParams()    # Token → params object
│   ├── xorCipher()       # Symmetric encryption
│   ├── toBase64/fromBase64() # URL-safe encoding
│   └── calculateChecksum() # Integrity verification
│
└── artworkGenerator.ts   # Artwork-specific generators
    ├── generateFlowParamsFromToken()
    ├── generateGridParamsFromToken()
    ├── generateMosaicParamsFromToken()
    ├── generateRotatedGridParamsFromToken()
    ├── generateTreeParamsFromToken()
    └── generateTextDesignParamsFromToken()
```

---

## Lessons Learned

### 1. Canvas Dimensions Are Critical

Initially, state tokens didn't include `canvasWidth` and `canvasHeight`. Artworks rendered at default 630×790 instead of custom sizes.

**Fix:** Added dimension fields to all encode/decode schemas.

### 2. Silent Failures Are Dangerous

When checksum validation failed, code silently fell back to random generation. Users saw completely different artwork without any error.

**Fix:** Made `decodeParams()` throw errors that propagate to the UI with clear messages.

### 3. Type Binding Prevents Spoofing

Without binding artwork type to the checksum, users could change `fx-grid-` to `fx-mosaic-` and bypass validation.

**Fix:** Include `artworkType` in checksum calculation:
```typescript
const checksumSource = `${artworkType}${randomPart}`;
```

### 4. Nested Data Needs Careful Indexing

When encoding complex structures like TextDesign layers, manual array indexing is error-prone.

**Fix:** Thorough testing of encode/decode round-trips.

---

## Try It Yourself

1. Visit the [Studio](/studio)
2. Generate a Mosaic artwork
3. Change a color manually
4. Copy the long token (starts with `fx-mosaic-v1-`)
5. Paste it into the [Viewer](/view)
6. See your exact custom artwork render

Then try tampering with the token—change a single character. You'll get an explicit error instead of a broken image.

---

## Conclusion

This token system embodies three principles:

| Principle | Implementation |
|-----------|----------------|
| **Determinism** | sfc32 PRNG ensures same token → same artwork |
| **Portability** | Base64 + encryption = share via URL/text |
| **Security** | Checksums + type binding detect tampering |

It's a foundation that makes generative art accessible, shareable, and permanent.

---

*Implementation details available in the [source code](https://github.com/mvhikhn/arte).*
