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

## The Solution: Tokens

### What is a Token?

A token is a compact string that uniquely identifies an artwork iteration. Think of it as a "save code" for your creation.

```
Example Tokens:
fx-mosaic-3xKpR9YbM2nT...vb81          (Random seed token)
fx-mosaic-v1-eyJjb2xvcjEi...-a3f9      (State-encoded token)
```

### Token Anatomy

```
┌──────────────── Token Format ────────────────┐
│                                               │
│  fx - TYPE - VERSION - DATA - CHECKSUM       │
│  │    │       │        │       │             │
│  │    │       │        │       └─ Tamper detection
│  │    │       │        └───────── Encoded parameters
│  │    │       └────────────────── v1 = state token
│  │    └────────────────────────── Artwork type
│  └─────────────────────────────── Platform prefix
│                                               │
└───────────────────────────────────────────────┘
```

## Two Token Types

### 1. Random Seed Tokens

**Format:** `fx-[type]-[randomhash][checksum]`

**Use Case:** Initial random generation

**How it works:**
```
┌─────────────┐
│ User clicks │
│ "Randomize" │
└──────┬──────┘
       │
       v
┌───────────────────┐
│ Generate random   │──┐
│ 44-char string    │  │
└─────────┬─────────┘  │
          │            │  ┌──────────────────┐
          v            └─>│ Calculate 2-char │
    ┌──────────┐          │ checksum binding │
    │ Hash:    │          │ type + hash      │
    │ 3xKpR9.. │          └────────┬─────────┘
    └──────────┘                   │
          │                        v
          │                  ┌──────────┐
          │                  │ Checksum │
          │                  │   vb     │
          │                  └─────┬────┘
          │                        │
          v                        v
       ┌──────────────────────────────┐
       │    fx-mosaic-3xKpR9...vb     │
       └──────────────┬───────────────┘
                      │
                      v
              ┌───────────────┐
              │ Feed to PRNG  │
              │ (sfc32)       │
              └───────┬───────┘
                      │
                      v
           ┌─────────────────────┐
           │ Generate all params │
           │ deterministically   │
           │ - Colors            │
           │ - Dimensions        │
           │ - Settings          │
           └─────────────────────┘
```

**Key insight:** The same hash always produces the same artwork because it seeds a pseudo-random number generator (PRNG).

### 2. State-Encoded Tokens

**Format:** `fx-[type]-v1-[base64data]-[checksum]`

**Use Case:** Preserving manual edits

**How it works:**
```
User changes color → Encode ALL parameters → Append checksum
         │                     │                    │
         v                     v                    v
    ┌─────────┐      ┌──────────────────┐   ┌───────────┐
    │ New     │      │ Params → Array → │   │ Hash data │
    │ Color   │      │ JSON → Base64    │   │ → 4 chars │
    └─────────┘      └──────────────────┘   └───────────┘
                              │                    │
                              v                    v
                     fx-mosaic-v1-eyJj...-a3f9
                                  └──────┘   └──┘
                                   Data    Checksum
```

**On decode:**
```
Token → Split by '-' → Validate checksum → Base64 decode
                             │                   │
                             v                   v
                      ┌────────────┐      ┌────────────┐
                      │ MATCH?     │      │ Parse JSON │
                      │ checksum   │      │ to Array   │
                      └─────┬──────┘      └──────┬─────┘
                            │                    │
                         ✓ YES                   v
                            │            ┌───────────────┐
                            │            │ Map to Params │
                            │            │ Object        │
                            │            └───────┬───────┘
                            │                    │
                            └────────────────────┘
                                      │
                                      v
                           ┌────────────────────┐
                           │ EXACT restoration  │
                           │ of your artwork    │
                           └────────────────────┘
```

## Security: Checksums

Every token includes a checksum to detect corruption or tampering.

### Random Token Checksum

```typescript
// Type + Random Hash → Sum → Modulo 256 → Hex
const checksumSource = `${artworkType}${randomPart}`;
let sum = 0;
for (let i = 0; i < checksumSource.length; i++) {
    sum += checksumSource.charCodeAt(i);
}
const checksum = (sum % 256).toString(16).padStart(2, '0');
```

This binds the artwork type to the token. Changing `fx-grid-` to `fx-mosaic-` invalidates the checksum.

### State Token Checksum

```typescript
// Similar, but 4 hex characters for more robustness
const checksum = (sum % 65536).toString(16).padStart(4, '0');
```

**Why checksums matter:**
- Copy-paste errors detected immediately
- Prevents URL corruption
- Explicit "Invalid token" message instead of broken artwork

## Parameter Serialization

State tokens encode parameters into a compact format. Here's the Mosaic artwork schema:

```typescript
const encodeMosaicParams = (params) => {
    const data = [
        params.color1,              // 0
        params.color2,              // 1
        params.color3,              // 2
        params.color4,              // 3
        params.initialRectMinSize,  // 4
        params.initialRectMaxSize,  // 5
        // ... 13 more numerical params
        params.canvasWidth,         // 19
        params.canvasHeight,        // 20
        params.exportWidth,         // 21
        params.exportHeight         // 22
    ];
    return toBase64(JSON.stringify(data));
};
```

**Space efficiency:**
- Parameter names removed (use array indices)
- JSON → Base64 → Compact URL-safe string
- Example: 23 parameters → ~150 characters

## The Deterministic PRNG

For random tokens, we use the sfc32 algorithm (simple fast counter):

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
- Deterministic: Same seed → Same sequence
- Fast: Optimized for generative art
- Good distribution: Passes randomness tests
- Used by fxhash: Battle-tested

## Complete Workflow

### Creating Art

```
┌──────────┐
│  Studio  │
└────┬─────┘
     │
     ├─ Click Randomize ──> Generate random token
     │                      └─> Seed PRNG → Parameters
     │
     ├─ Tweak color ─────> Encode all params → v1 token
     │
     └─ Copy token ──────> Share with world
```

### Viewing Art

```
┌──────────┐
│  Viewer  │
└────┬─────┘
     │
     ├─ Paste token
     │    └─> Validate format & checksum
     │
     ├─ Detect type ──────> Mosaic / Grid / Tree / etc.
     │
     ├─ Check version ────> Random or v1 state?
     │    │
     │    ├─ Random ─────> tokenToSeed() → PRNG → Params
     │    └─ v1 ────────> decodeParams() → Exact params
     │
     └─> Render artwork
```

## Cross-Artwork Protection

Tokens are artwork-specific. A Mosaic token won't work on a Grid artwork.

```
Token:  fx-mosaic-abc123

Try on Grid artwork:
  └─> validateToken('fx-mosaic-abc123', 'grid')
      └─> type mismatch! → REJECT
```

**Why?**
- Prevents confusion
- Clear error messages
- Type safety

## URL Integration

Tokens flow seamlessly between pages:

```
Studio → Copy token → Viewer → Open in Studio
  │                     │            │
  │                     │            └─> URL: /studio?token=fx-mosaic-v1-...
  │                     │
  │                     └─> Renders artwork
  │
  └─> Creates artwork
```

Studio reads `?token=` from URL and initializes the artwork state.

## Technical Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript for type safety
- p5.js for canvas rendering

**Token System:**
- `utils/token.ts` - Token generation, validation, PRNG
- `utils/serialization.ts` - Parameter encoding/decoding
- `utils/artworkGenerator.ts` - Shared generation logic

## Lessons Learned

### 1. Canvas Dimensions Matter

Initially, our state tokens didn't include `canvasWidth`, `canvasHeight`, etc. This caused artworks to render at default dimensions instead of the actual size, breaking the "exact reproduction" promise.

**Fix:** Added dimension fields to all encode/decode functions.

### 2. Error Propagation is Critical

When checksums failed, the code silently fell back to random generation. Users saw a different artwork instead of an error.

**Fix:** Made `decodeParams()` throw errors that propagate to the UI.

### 3. Type Binding Prevents Spoofing

Without binding artwork type to checksum, users could change `fx-grid-` to `fx-mosaic-` and bypass validation.

**Fix:** Include `artworkType` in checksum calculation.

## Try It Yourself

1. Visit the [Studio](/studio)
2. Generate a Mosaic artwork
3. Change a color manually
4. Copy the long token (starts with `fx-mosaic-v1-`)
5. Paste it into the [Viewer](/view)
6. See your exact custom artwork render

Then try tampering with the token—change a single character. You'll get an explicit error instead of a broken image.

## Conclusion

This token system embodies three principles:

1. **Determinism** - Same token → Same artwork, always
2. **Portability** - Share art with a string, not gigabytes
3. **Security** - Checksums prevent corruption & tampering

It's a foundation that makes generative art accessible, shareable, and permanent.

---

*Implementation details available in the [source code](https://github.com/mvhikhn/arte).*
