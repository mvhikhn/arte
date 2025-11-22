# Multi-Artwork System with Next Button ✅

## What's New

**Two artworks are now available, with a Next button to switch between them:**

1. **Flow Artwork** - Original generative flow field art (4:5 aspect ratio)
2. **Grid Artwork** - NEW geometric grid art with animated shapes (1:1 aspect ratio)

---

## Features

### **Next Button**
- Located in the bottom-right of the artwork area
- **Cyan background** with arrow icon
- Click to cycle between artworks
- Switches both the artwork AND the control panel

### **Artwork-Specific Controls**
- Each artwork has its own dedicated control panel
- Parameters automatically switch when you change artworks
- All settings are preserved when switching back

---

## Grid Artwork Details

### **Visual Style**
- **Dark theme:** Black background (#1d1d1b)
- **Light border:** Off-white borders (#f2f2e7)
- **4 main colors:** Customizable palette
- **Geometric shapes:** Crosses, circles, crowns, diamonds
- **Recursive subdivision:** Grid cells subdivide into smaller grids
- **Smooth animation:** Rotating crosses, pulsing circles, morphing shapes

### **Parameters**

#### **Grid Settings**
- **Min Columns (3-8):** Minimum grid columns
- **Max Columns (6-12):** Maximum grid columns  
- **Min Module (20-100):** Smallest cell size before no more subdivision
- **Max Depth (1-4):** How many levels of subdivision
- **Subdivide (0-1):** Probability of cell subdivision

#### **Animation**
- **Speed (0.001-0.15):** Animation speed
- **Cross Size (0.3-1):** Size of spinning crosses

#### **Colors** (6 total)
- **Background:** Canvas background color
- **Border:** Cell border color
- **Color 1-4:** Shape fill colors (randomly picked)

### **How It Works**

```
1. Grid generated with random columns (minColumns to maxColumns)
2. Each cell can subdivide based on:
   - Random chance (subdivideChance)
   - Current depth < maxDepth
   - Cell size > minModuleSize
3. If doesn't subdivide, draw a random shape:
   - Spinning Cross (rotates with animation)
   - Circle (pulses with animation)
   - Crown (peaks vary with animation)
   - Diamond (scales with animation)
4. Animation driven by sine wave
```

---

## Flow Artwork (Original)

### **Visual Style**
- **4:5 aspect ratio** (portrait)
- **5 custom colors**
- **Noise-based flow fields**
- **Organic, flowing lines**

### **Parameters**
- Points, Movement, Noise, Angles
- Gaussian distribution settings
- Stroke weights, circle sizes
- All previous controls intact

---

## Usage

### **Switching Artworks**
1. Click **Next** button (bottom-right)
2. Artwork and controls change instantly
3. All parameters preserved per artwork

### **Randomizing**
- **Flow Artwork:** Randomizes all flow parameters + colors
- **Grid Artwork:** Randomizes grid settings, animation, colors

### **Exporting**
- Works for both artworks
- Image export respects artwork aspect ratio
- GIF export captures animation

---

## Control Panel Differences

### **Flow Controls**
```
- Play/Pause
- Randomize
- Basic Settings (Points)
- Movement Settings (Scale, Noise, Movement)
- Drawing Settings (Circle, Strokes, Iterations)
- Angle Settings
- Color Palette (5 colors)
- Export
```

### **Grid Controls**
```
- Play/Pause
- Randomize
- Grid Settings (Columns, Module, Depth, Subdivide)
- Animation (Speed, Cross Size)
- Colors (Background, Border, 4 colors)
- Export
```

---

## Technical Implementation

### **Components Created**
1. **GridArtwork.tsx** - New p5.js sketch for grid art
2. **GridControls.tsx** - Control panel for grid parameters
3. **Updated page.tsx** - Artwork switching logic

### **State Management**
```typescript
// Separate state for each artwork
const [flowParams, setFlowParams] = useState<ArtworkParams>({...});
const [gridParams, setGridParams] = useState<GridArtworkParams>({...});

// Current artwork tracker
const [currentArtwork, setCurrentArtwork] = useState<"flow" | "grid">("flow");

// Separate refs for each artwork
const flowArtworkRef = useRef<ArtworkRef>(null);
const gridArtworkRef = useRef<GridArtworkRef>(null);
```

### **Artwork Switching**
```typescript
const handleNextArtwork = () => {
  setCurrentArtwork((prev) => (prev === "flow" ? "grid" : "flow"));
};
```

**Conditional rendering:**
```tsx
{currentArtwork === "flow" ? (
  <Artwork ref={flowArtworkRef} params={flowParams} />
) : (
  <GridArtwork ref={gridArtworkRef} params={gridParams} />
)}
```

**Conditional controls:**
```tsx
{currentArtwork === "flow" ? (
  <Controls ... />
) : (
  <GridControls ... />
)}
```

---

## Grid Randomization

**When you click Randomize on Grid Artwork:**

```typescript
- Background: Random color from 30 options
- Border: Random color from 30 options
- Colors 1-4: Random colors
- Animation Speed: 0.01-0.11 (random)
- Max Depth: 1-3 (random)
- Min Module Size: 20-70 (random)
- Subdivide Chance: 0.2-0.8 (random)
- Cross Size: 0.5-1.0 (random)
- Columns: 4-11 (random range)
- Seed: New timestamp
```

---

## Benefits

✅ **Two Distinct Styles** - Organic flows vs geometric grids
✅ **Easy Switching** - One button to change everything
✅ **Independent Parameters** - Each artwork has its own settings
✅ **Preserved State** - Settings don't reset when switching
✅ **Consistent Interface** - Same control panel style for both
✅ **Full Functionality** - Export, randomize, animate both artworks

---

## Workflow Examples

### **Explore Both Styles:**
1. Start with Flow artwork
2. Click Randomize until you find something interesting
3. Click Next to see Grid artwork
4. Click Randomize to explore geometric patterns
5. Click Next to return to Flow
6. Your Flow settings are still there!

### **Export Multiple:**
1. Customize Flow artwork → Export
2. Click Next
3. Customize Grid artwork → Export
4. Two different artworks exported!

---

## Next Button Location

```
┌─────────────────────────────────────┐
│                                     │
│         Artwork Display             │
│                                     │
│                                     │
│                                     │
│                                     │
│                        [Next →]  ← │
└─────────────────────────────────────┘
      Bottom-right, floating button
```

**Style:**
- Cyan background (#0891b2)
- White text
- Arrow icon (→)
- Shadow for visibility
- Hover effect (lighter cyan)

---

## Result

🎨 **Two Complete Artworks**
- Flow: Organic, flowing, 5 colors
- Grid: Geometric, animated, 6 colors

↔️ **Seamless Switching**
- One button to toggle
- Instant transition
- All settings preserved

⚡ **Independent Control**
- Each artwork fully customizable
- Separate randomization
- Unique parameter sets

**You now have two completely different generative art styles in one application, switchable with a single click!** ✨
