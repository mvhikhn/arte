# Mosaic Artwork Added - Third Generative Art Style ✅

## What's New

**Third artwork added: "Mosaic" - Recursive rectangle subdivision with geometric patterns**

The system now cycles through **three distinct artworks**:
1. **Flow** → 2. **Grid** → 3. **Mosaic** → back to Flow

---

## Mosaic Artwork Features

### **Visual Style**
- **Square aspect ratio** (1:1)
- **Recursive rectangle subdivision** - rectangles divide into smaller rectangles
- **Two-color patterns** - Each rectangle uses 2 colors from the 3-color palette
- **Grid details** - Small grid patterns within each rectangle
- **Noise texture** - Subtle white noise dots for texture
- **One background color** - Picked randomly from 4 colors, others used for shapes
- **Static artwork** - Generated once, no animation (use Regenerate for new version)

### **How It Works**
```
1. Pick random background color from 4 colors
2. Use remaining 3 colors for rectangles
3. Create initial rectangle (random size)
4. Recursively subdivide based on:
   - Grid division chance → creates NxM grid
   - OR split horizontally/vertically
   - Recursion chance → subdivide further
   - Min size threshold → stops when too small
5. Each final rectangle:
   - Gets 2 random colors from palette
   - Filled with first color
   - Grid of smaller rectangles in second color
   - Small noise dots for texture
6. Final pass: Add noise texture overlay
```

---

## Mosaic Controls

### **Initial Rectangle**
- **Min Size (0.2-0.8):** Minimum starting rectangle size
- **Max Size (0.4-1.0):** Maximum starting rectangle size

### **Division**
- **Grid Chance (0-1):** Probability of grid division vs binary split
- **Recursion (0-1):** Chance to keep subdividing
- **Min Size (20-100):** Stop subdividing below this pixel size

### **Grid Settings**
- **Min/Max Rows (2-10):** Grid rows range for subdivision
- **Min/Max Cols (2-10):** Grid columns range for subdivision

### **Details**
- **Split Min/Max (0.1-0.9):** Ratio for binary splits
- **Margin (0.05-0.3):** Space between rectangles
- **Detail Min/Max (2-6):** Grid size within each rectangle
- **Noise (0-0.3):** Density of texture dots

### **Colors** (4 total)
- One becomes background (randomly chosen)
- Other 3 used for rectangle patterns

---

## Special Features

### **Two Buttons**
1. **Regenerate** - New layout with same parameters
   - Changes seed only
   - Same colors, same settings
   - Different arrangement

2. **Randomize All** - Completely new everything
   - All 4 colors randomized
   - All parameters randomized
   - New seed
   - Completely different artwork

### **No Animation**
- Mosaic is **static/generative** (not animated)
- No Play/Pause button
- Click Regenerate for variations
- Export captures the static image

---

## Parameters in Detail

### **Grid Division Chance (0.7 default)**
- **High (0.8-1.0):** More grid-based layouts, complex patterns
- **Low (0-0.3):** More binary splits, simpler rectangles

### **Recursion Chance (0.5 default)**
- **High (0.7-1.0):** Deep subdivision, many small rectangles
- **Low (0-0.3):** Shallow subdivision, fewer large rectangles

### **Min Recursion Size (50 default)**
- **Large (70-100):** Stops subdividing earlier, bigger rectangles
- **Small (20-40):** Subdivides more, smaller rectangles

### **Margin Multiplier (0.1 default)**
- **High (0.2-0.3):** Wide gaps between rectangles
- **Low (0.05-0.1):** Tight spacing, more filled

### **Noise Density (0.1 default)**
- **High (0.2-0.3):** Heavy texture, grainy look
- **Low (0-0.05):** Subtle texture, clean look
- **Zero:** No noise texture

---

## Cycling Through Artworks

**Next button cycles:**
```
Flow → Grid → Mosaic → Flow → ...
```

**Visual indicators:**
- **Flow:** Portrait (4:5), animated
- **Grid:** Square (1:1), animated
- **Mosaic:** Square (1:1), static

**Control panels:**
- **Flow:** Play/Pause + Randomize
- **Grid:** Play/Pause + Randomize
- **Mosaic:** Regenerate + Randomize All

---

## Randomization

### **Randomize All (Mosaic):**
```typescript
- Colors: 4 random from 30-color palette
- Initial Rect: Random size range
- Grid Chance: 0.3-0.9 (random)
- Recursion: 0.2-0.8 (random)
- Grid Rows: 2-8 (random)
- Grid Cols: 2-8 (random)
- Split Ratios: Random ranges
- Margin: 0.05-0.2 (random)
- Detail Grid: 2-5 (random)
- Noise: 0-0.2 (random)
- Min Size: 30-70 (random)
- Seed: New timestamp
```

### **Regenerate (Mosaic):**
```typescript
- Only changes: seed
- Same: All colors and parameters
- Result: New layout, same style
```

---

## Export

**Image Export:**
- Captures current static artwork
- 1600x1600 resolution
- Exact WYSIWYG rendering

**GIF Export:**
- Not applicable (artwork is static)
- Only available for Flow and Grid artworks

---

## Usage Examples

### **Example 1: Fine-tune a pattern**
1. Click Randomize All
2. Like the colors but not the layout?
3. Click Regenerate repeatedly
4. Same colors, different arrangements
5. Export when perfect!

### **Example 2: Explore subdivisions**
1. Start with default
2. Increase Grid Chance → More complex grids
3. Increase Recursion → More subdivisions
4. Decrease Min Size → Smaller rectangles
5. Click Regenerate to see variations

### **Example 3: Minimal clean look**
1. Set Recursion low (0.2)
2. Set Grid Chance low (0.3)
3. Set Min Size high (80)
4. Set Margin high (0.2)
5. Set Noise low (0.02)
6. Result: Clean, simple, spacious composition

### **Example 4: Complex density**
1. Set Recursion high (0.8)
2. Set Grid Chance high (0.9)
3. Set Min Size low (30)
4. Set Noise high (0.25)
5. Result: Dense, intricate, textured artwork

---

## Technical Implementation

### **Components**
- **MosaicArtwork.tsx** - p5.js sketch implementation
- **MosaicControls.tsx** - Control panel for parameters
- **Updated page.tsx** - Three-way artwork switching

### **Key Differences from Other Artworks**
- **Static rendering:** `noLoop()` instead of continuous draw
- **Regenerate function:** Exposed to redraw with new seed
- **No animation toggle:** Static by design
- **Color selection:** One color becomes background automatically

### **Recursive Algorithm**
```javascript
function divideRectangle(x, y, w, h) {
  if (random() > gridChance) {
    // Grid division
    for each cell in grid:
      createUnit(cell)
  } else {
    // Binary split
    split at random ratio
    createUnit(left/top)
    createUnit(right/bottom)
  }
}

function createUnit(x, y, w, h) {
  if (random() > recursionChance && size > minSize) {
    divideRectangle(x, y, w, h)  // Recurse
  } else {
    drawRectangle(x, y, w, h)     // Terminal node
  }
}
```

---

## Comparison of Three Artworks

| Feature | Flow | Grid | Mosaic |
|---------|------|------|--------|
| **Aspect Ratio** | 4:5 | 1:1 | 1:1 |
| **Animation** | Yes | Yes | No |
| **Style** | Organic | Geometric | Geometric |
| **Colors** | 5 | 6 | 4 |
| **Generation** | Continuous | Continuous | Static |
| **Main Control** | Randomize | Randomize | Regenerate |
| **Complexity** | Flow fields | Grid + shapes | Recursive subdivision |

---

## Benefits

✅ **Three distinct styles** - Organic, animated grid, static mosaic  
✅ **Complete control** - Every parameter exposed  
✅ **Regenerate option** - Quick variations of same style  
✅ **Static + Animated** - Different modes for different needs  
✅ **Export ready** - High-resolution image export  
✅ **Preserved state** - Settings saved when switching artworks

---

## Result

🎨 **Three Complete Artworks**
- Flow: Flowing organic animation
- Grid: Geometric animated grid
- Mosaic: Static recursive rectangles

↔️ **Seamless Cycling**
- Next button cycles through all three
- Each has custom controls
- All settings preserved

⚡ **Unique Features**
- Mosaic has Regenerate button
- Static rendering for clean patterns
- Recursive subdivision algorithm

**You now have three completely different generative art styles, each with full parameter control and unique features!** ✨
