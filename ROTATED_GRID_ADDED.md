# Rotated Grid Artwork Added - Fourth Generative Art Style ✅

## What's New

**Fourth artwork added: "Rotated Grid" - Recursive grid with random rotations**

The system now cycles through **FOUR distinct artworks**:
1. **Flow** → 2. **Grid** → 3. **Mosaic** → 4. **Rotated Grid** → back to Flow

---

## Rotated Grid Features

### **Visual Style**
- **Square aspect ratio** (1:1)
- **Recursive grid subdivision** - Grids within grids
- **Random rotations** - Each grid level randomly rotated 0°, 90°, 180°, or 270°
- **4 vibrant colors** - Green, yellow, orange, red palette
- **Black background** by default
- **Geometric precision** - Clean rectangular divisions
- **Static artwork** - Generated once (use Regenerate for new version)

### **How It Works**
```
1. Start with offset frame (based on offsetRatio)
2. Create initial grid (random cell count)
3. For each cell:
   - Randomly rotate entire grid (0°, 90°, 180°, 270°)
   - Subdivide into NxM cells
   - Recursively repeat for each subcell
   - Stop when cells too small (minRecursionSize)
4. Draw final cells with random colors/strokes
5. Each level has margin/spacing between cells
```

---

## Rotated Grid Controls

### **Layout**
- **Offset (0.01-0.15):** Outer frame size
- **Margin (0.1-0.5):** Space between cells (halves each level)

### **Grid Settings**
- **Min Cells (2-4):** Minimum grid size
- **Max Cells (3-6):** Maximum grid size
- **Min Size (0.03-0.15):** Stop subdividing below this ratio

### **Style**
- **Stroke (0.5-4):** Rectangle outline thickness

### **Colors** (5 total)
- **Background:** Canvas background
- **Color 1-4:** Cell fill and stroke colors (randomly picked)

---

## Special Features

### **Random Rotations**
Each grid level is randomly rotated, creating complex interlocking patterns:
- **0°**: Normal orientation
- **90°**: Rotated right
- **180°**: Upside down
- **270°**: Rotated left

This creates visual complexity without increasing parameters!

### **Two Buttons**
1. **Regenerate** - New layout, same parameters
   - Changes seed only
   - Same colors, same settings
   - Different grid arrangement

2. **Randomize All** - Completely new everything
   - All 5 colors randomized
   - All parameters randomized
   - New seed
   - Completely different artwork

### **Real-Time Updates**
✅ All parameters update instantly when changed
✅ No need to click Regenerate unless you want a new random seed
✅ Smooth, responsive parameter adjustments

---

## Parameters in Detail

### **Offset Ratio (0.05 default)**
- **Large (0.1-0.15):** Thick outer frame
- **Small (0.01-0.03):** Thin outer frame, more art

### **Margin Ratio (0.2 default)**
- **Large (0.3-0.5):** Wide gaps between cells, airy
- **Small (0.1-0.15):** Tight spacing, dense

**Note:** Margin halves each recursion level automatically

### **Min/Max Cell Count**
- **Small (2-3):** Simple grids, fewer divisions
- **Large (4-6):** Complex grids, many divisions

**Example:**
- Min=2, Max=4 → Each grid can be 2×2, 3×3, or 4×4

### **Min Recursion Size (0.067 default)**
- **Large (0.1-0.15):** Stops early, bigger cells
- **Small (0.03-0.05):** Deep recursion, tiny cells

**Formula:** Cell size > canvas width × minRecursionSize

### **Stroke Weight (1 default)**
- **Thin (0.5-1):** Delicate outlines
- **Thick (2-4):** Bold, graphic lines

---

## Cycling Through Artworks

**Next button now cycles through FOUR:**
```
Flow → Grid → Mosaic → Rotated Grid → Flow → ...
```

**Visual indicators:**
- **Flow:** Portrait (4:5), animated, organic
- **Grid:** Square (1:1), animated, geometric shapes
- **Mosaic:** Square (1:1), static, rectangular subdivisions
- **Rotated Grid:** Square (1:1), static, rotated grids

**Control panels:**
- **Flow:** Play/Pause + Randomize
- **Grid:** Play/Pause + Randomize
- **Mosaic:** Regenerate + Randomize All
- **Rotated Grid:** Regenerate + Randomize All

---

## Randomization

### **Randomize All (Rotated Grid):**
```typescript
- Colors: 5 random from 30-color palette
- Offset: 0.02-0.12 (random)
- Margin: 0.1-0.4 (random)
- Min Cells: 2-3 (random)
- Max Cells: 3-5 (random)
- Min Size: 0.04-0.12 (random)
- Stroke: 0.5-3.5 (random)
- Seed: New timestamp
```

### **Regenerate (Rotated Grid):**
```typescript
- Only changes: seed
- Same: All colors and parameters
- Result: New rotations, new arrangement
```

---

## Comparison of Four Artworks

| Feature | Flow | Grid | Mosaic | Rotated Grid |
|---------|------|------|--------|--------------|
| **Aspect Ratio** | 4:5 | 1:1 | 1:1 | 1:1 |
| **Animation** | Yes | Yes | No | No |
| **Style** | Organic | Animated Geo | Static Rects | Rotated Grids |
| **Colors** | 5 | 6 | 4 | 5 (4+bg) |
| **Main Feature** | Flow fields | Spinning shapes | Subdivision | Rotations |
| **Control** | Randomize | Randomize | Regen/Random | Regen/Random |
| **Complexity** | Noise-based | Grid+shapes | Recursive | Recursive+rotation |

---

## Usage Examples

### **Example 1: Dense intricate pattern**
1. Min Cells: 3, Max Cells: 5
2. Min Size: 0.04 (small)
3. Margin: 0.15 (tight)
4. Click Regenerate until perfect!

### **Example 2: Clean minimalist**
1. Min Cells: 2, Max Cells: 3
2. Min Size: 0.1 (large)
3. Margin: 0.35 (wide)
4. Stroke: 2 (medium)
5. Simple, elegant

### **Example 3: Bold graphic**
1. Stroke: 3.5 (thick)
2. High contrast colors
3. Margin: 0.2 (balanced)
4. Export at high resolution!

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

## Technical Implementation

### **Key Algorithm**
```javascript
function drawGrid(x, y, w, h, cellCount, margin) {
  // Random rotation (0, 90, 180, 270)
  const rotation = int(random(4)) * 90;
  
  // Swap dimensions if rotated 90° or 270°
  if (rotation % 180 === 0) {
    cellWidth = w;
    cellHeight = h;
  } else {
    cellWidth = h;
    cellHeight = w;
  }
  
  // Apply rotation transform
  push();
  translate(x + w/2, y + h/2);
  rotate(rotation);
  translate(-cellWidth/2, -cellHeight/2);
  
  // Draw grid cells
  for each cell:
    if (size > minSize):
      drawGrid(recursively)  // Recurse with margin/2
    else:
      drawCell(random colors)
  
  pop();
}
```

### **Rotation Magic**
- Each recursion level gets independent random rotation
- Creates intricate interlocking patterns
- Transform stack (push/pop) preserves rotations
- Dimension swap handles aspect ratio changes

---

## Benefits

✅ **Four distinct styles** - Maximum variety  
✅ **Real-time updates** - All parameters reactive  
✅ **Rotation complexity** - Simple params, complex output  
✅ **Complete control** - Every aspect customizable  
✅ **Preserved state** - Settings saved when switching  
✅ **Export ready** - High-resolution image export

---

## Result

🎨 **Four Complete Artworks**
- Flow: Organic flowing animation
- Grid: Geometric animated shapes
- Mosaic: Static recursive rectangles
- Rotated Grid: Static rotated subdivisions

↔️ **Seamless Cycling**
- Next button cycles through all four
- Each has custom controls
- All settings preserved
- Independent parameters

⚡ **Unique Features**
- Rotated Grid: Random rotations per level
- Real-time parameter updates
- Static but fully reactive
- Regenerate for variations

**You now have four completely different generative art styles, each with full parameter control, real-time updates, and unique visual characteristics!** ✨
