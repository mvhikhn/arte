---
title: "Adding New Artworks to Arte"
date: "December 06, 2025"
description: "A comprehensive technical guide on how to integrate new generative algorithms into the Arte platform, from parameter definition to UI controls."
---

Arte is designed to be an extensible platform for generative art. Adding a new artwork type involves a systematic process of defining parameters, creating the visual component, implementing deterministic generation logic, and wiring it all up in the Studio and View interfaces.

This guide walks you through the exact steps to add a new artwork type (let's call it "Circles").

## Step 1: Define the Artwork Type

First, register the new artwork type in the system's type definitions.

**File:** `utils/token.ts`

```typescript
// Add 'circles' to the union type
export type ArtworkType = 'flow' | 'grid' | 'mosaic' | 'rotated' | 'tree' | 'text' | 'circles';
```

## Step 2: Define Parameters & Create Component

Create the visual component that renders your artwork. This component should accept a `params` object and use a `ref` to expose export functionality.

**File:** `components/CirclesArtwork.tsx`

```tsx
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

// 1. Define the parameters interface
export interface CirclesArtworkParams {
    radius: number;
    count: number;
    colorSeed: string;
    // ... other params
    canvasWidth: number;
    canvasHeight: number;
    token: string;
}

// 2. Define the Ref interface for export
export interface CirclesArtworkRef {
    exportImage: () => void;
    exportHighRes: (scale: number) => void;
}

const CirclesArtwork = forwardRef<CirclesArtworkRef, { params: CirclesArtworkParams }>(
    ({ params }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);

        // 3. Implement drawing logic
        const draw = (ctx: CanvasRenderingContext2D) => {
            // Use params to draw...
        };

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (ctx) draw(ctx);
        }, [params]);

        // 4. Expose export methods
        useImperativeHandle(ref, () => ({
            exportImage: () => { /* ... */ },
            exportHighRes: (scale) => { /* ... */ }
        }));

        return (
            <canvas 
                ref={canvasRef} 
                width={params.canvasWidth} 
                height={params.canvasHeight}
                className="shadow-sm"
            />
        );
    }
);

export default CirclesArtwork;
```

## Step 3: Implement Generator Logic

You need a deterministic way to generate parameters from a token string. This ensures that the same token always produces the same artwork.

**File:** `utils/artworkGenerator.ts`

```typescript
import { CirclesArtworkParams } from '@/components/CirclesArtwork';

// 1. Create a generator function
export const generateCirclesParamsFromToken = (token: string): CirclesArtworkParams => {
    // Initialize PRNG with token hash
    const rng = new PRNG(token);
    
    return {
        radius: rng.range(10, 100),
        count: Math.floor(rng.range(5, 20)),
        colorSeed: token,
        canvasWidth: 630,
        canvasHeight: 790,
        token: token
    };
};
```

## Step 4: Create Controls UI

Build the sidebar controls that allow users to tweak parameters in the Studio.

**File:** `components/CirclesControls.tsx`

```tsx
import { CirclesArtworkParams } from '@/components/CirclesArtwork';

interface CirclesControlsProps {
    params: CirclesArtworkParams;
    onParamChange: (key: keyof CirclesArtworkParams, value: any) => void;
    // ... other props like onRandomize, onExport
}

export default function CirclesControls({ params, onParamChange }: CirclesControlsProps) {
    return (
        <div className="space-y-6 p-4">
            <section>
                <label>Radius</label>
                <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={params.radius}
                    onChange={(e) => onParamChange('radius', Number(e.target.value))} 
                />
            </section>
            {/* Add more controls... */}
        </div>
    );
}
```

## Step 5: Integrate into Studio

Wire everything up in the main Studio page.

**File:** `app/studio/page.tsx`

1.  **Import components**:
    ```tsx
    import CirclesArtwork, { CirclesArtworkParams, CirclesArtworkRef } from "@/components/CirclesArtwork";
    import CirclesControls from "@/components/CirclesControls";
    import { generateCirclesParamsFromToken } from "@/utils/artworkGenerator";
    ```

2.  **Add State**:
    ```tsx
    const [circlesParams, setCirclesParams] = useState<CirclesArtworkParams | null>(null);
    const circlesRef = useRef<CirclesArtworkRef>(null);
    ```

3.  **Update `useEffect` for Token Decoding**:
    Add a case for `'circles'` to decode params from the token.

4.  **Update Render Logic**:
    Add conditional rendering for the artwork and controls:
    ```tsx
    {currentArtwork === "circles" && circlesParams && (
        <CirclesArtwork ref={circlesRef} params={circlesParams} />
    )}
    ```

## Step 6: Integrate into View Page

Enable the public view page to render your new artwork type.

**File:** `app/view/page.tsx`

1.  **Import components**:
    ```tsx
    import CirclesArtwork, { CirclesArtworkParams, CirclesArtworkRef } from "@/components/CirclesArtwork";
    ```

2.  **Update State & Refs**:
    Similar to Studio, add state and refs for the new artwork.

3.  **Update Decoding Logic**:
    Ensure `generateCirclesParamsFromToken` is called when a 'circles' token is detected.

4.  **Update Render Logic**:
    Add the component to the 3D card's render block.

## Step 7: Add to Homepage

Finally, make it discoverable.

**File:** `app/page.tsx`

Add it to the `artworks` array:

```tsx
const artworks = [
    // ... existing artworks
    { id: "circles", title: "Circles", description: "Geometric harmony" },
];
```

## Conclusion

By following these steps, you ensure that your new artwork is fully integrated into Arte's ecosystem, benefiting from:
- **Secure Tokens**: Automatic v2/v2e token generation.
- **Studio Features**: Export, randomization, and parameter tuning.
- **Public View**: Premium 3D card presentation with holographic effects.
