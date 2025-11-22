// Curated color palettes that work well together
// Each palette is designed with color theory in mind

export interface ColorPalette {
  name: string;
  colors: string[];
  background?: string;
}

// All palettes have 5-6 colors that harmonize well
export const colorPalettes: ColorPalette[] = [
  // Warm & Vibrant
  {
    name: "Sunset Glow",
    colors: ["#FF6B6B", "#FF8E53", "#FFA07A", "#FFD93D", "#F8B739"],
    background: "#2C1810"
  },
  {
    name: "Fire & Passion",
    colors: ["#E63946", "#F1495B", "#FF6B6B", "#FF8E72", "#FFA07A"],
    background: "#1A0A0A"
  },
  {
    name: "Autumn Leaves",
    colors: ["#D97642", "#E8924C", "#F4A460", "#C98749", "#B87333"],
    background: "#2B1B0F"
  },
  
  // Cool & Calm
  {
    name: "Ocean Depths",
    colors: ["#4ECDC4", "#45B7D1", "#5DADE2", "#3498DB", "#2E86AB"],
    background: "#0A1828"
  },
  {
    name: "Mint & Teal",
    colors: ["#4ECDC4", "#6DD5C3", "#98D8C8", "#81C6B5", "#5FB49C"],
    background: "#16232E"
  },
  {
    name: "Arctic Ice",
    colors: ["#A8DADC", "#B8E1E3", "#C4E7E8", "#D0EDEE", "#A0C4D4"],
    background: "#1D3557"
  },
  
  // Purple & Pink
  {
    name: "Lavender Dreams",
    colors: ["#BB8FCE", "#C39BD3", "#D7BDE2", "#E8DAEF", "#A87FC7"],
    background: "#1C1832"
  },
  {
    name: "Neon Nights",
    colors: ["#FF006E", "#FB5607", "#FF8500", "#FFBE0B", "#8338EC"],
    background: "#03071E"
  },
  {
    name: "Candy Pop",
    colors: ["#FF8FB1", "#FFB3C6", "#FFC8DD", "#FFAFCC", "#CDB4DB"],
    background: "#2D1B2E"
  },
  
  // Earth Tones
  {
    name: "Desert Sand",
    colors: ["#E8C4A0", "#D4A574", "#C89968", "#B88A5F", "#A67C52"],
    background: "#2C1810"
  },
  {
    name: "Forest Floor",
    colors: ["#52B788", "#74C69D", "#95D5B2", "#B7E4C7", "#40916C"],
    background: "#1B3A2F"
  },
  {
    name: "Clay & Terracotta",
    colors: ["#D97642", "#C8784F", "#B8795E", "#A8826D", "#C97642"],
    background: "#2B1911"
  },
  
  // Bright & Bold
  {
    name: "Tropical Punch",
    colors: ["#F72585", "#7209B7", "#3A0CA3", "#4361EE", "#4CC9F0"],
    background: "#0D0221"
  },
  {
    name: "Citrus Burst",
    colors: ["#FFBE0B", "#FB5607", "#FF006E", "#8338EC", "#3A86FF"],
    background: "#06070E"
  },
  {
    name: "Retro Gaming",
    colors: ["#06FFA5", "#FFFB00", "#FF006E", "#8338EC", "#3A0CA3"],
    background: "#03071E"
  },
  
  // Monochromatic
  {
    name: "Blue Gradient",
    colors: ["#023E8A", "#0077B6", "#0096C7", "#00B4D8", "#48CAE4"],
    background: "#03045E"
  },
  {
    name: "Green Gradient",
    colors: ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2"],
    background: "#1B4332"
  },
  {
    name: "Purple Gradient",
    colors: ["#5A189A", "#7209B7", "#9D4EDD", "#C77DFF", "#E0AAFF"],
    background: "#240046"
  },
  
  // Pastel & Soft
  {
    name: "Soft Pastels",
    colors: ["#FFD6E8", "#FFABE1", "#C9A9E9", "#A78BFA", "#818CF8"],
    background: "#F8F9FA"
  },
  {
    name: "Peach & Cream",
    colors: ["#FFD5C2", "#F28F3B", "#C8553D", "#F6AE2D", "#F26419"],
    background: "#FFF8F0"
  },
  {
    name: "Mint Cream",
    colors: ["#D4F1F4", "#75E6DA", "#189AB4", "#05445E", "#06D6A0"],
    background: "#EFF7F6"
  },
  
  // High Contrast
  {
    name: "Cyberpunk",
    colors: ["#00F5FF", "#FF00FF", "#FFFF00", "#00FF00", "#FF0080"],
    background: "#000000"
  },
  {
    name: "Noir Pop",
    colors: ["#FFFFFF", "#FF006E", "#FFBE0B", "#3A86FF", "#8338EC"],
    background: "#000000"
  },
  {
    name: "Neon Tokyo",
    colors: ["#FF0080", "#00F5FF", "#FFFF00", "#FF00FF", "#00FF9F"],
    background: "#0A0E27"
  },
  
  // Nature Inspired
  {
    name: "Coral Reef",
    colors: ["#FF6B9D", "#C44569", "#F8B739", "#F97F51", "#FEA47F"],
    background: "#1E3D59"
  },
  {
    name: "Garden Party",
    colors: ["#FF6B9D", "#F8B739", "#52B788", "#74C69D", "#B7E4C7"],
    background: "#1B3A2F"
  },
  {
    name: "Mountain Mist",
    colors: ["#A8DADC", "#457B9D", "#1D3557", "#F1FAEE", "#E63946"],
    background: "#2B2D42"
  },
  
  // Sophisticated
  {
    name: "Elegant Gold",
    colors: ["#FFD700", "#DAA520", "#B8860B", "#F4E4C1", "#E6C79C"],
    background: "#1C1C1E"
  },
  {
    name: "Royal Purple",
    colors: ["#6A0572", "#AB83A1", "#C3B1E1", "#DBCDF0", "#9D84B7"],
    background: "#2E0249"
  },
  {
    name: "Navy & Rose",
    colors: ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
    background: "#0D1B2A"
  },
  
  // Unexpected & Surprising
  {
    name: "Alien Landscape",
    colors: ["#39FF14", "#FF10F0", "#00FFFF", "#FFD700", "#FF1493"],
    background: "#0D0208"
  },
  {
    name: "Cosmic Explosion",
    colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"],
    background: "#03071E"
  },
  {
    name: "Vaporwave",
    colors: ["#FF71CE", "#01CDFE", "#05FFA1", "#B967FF", "#FFFB96"],
    background: "#0E0B16"
  },
  {
    name: "Electric Dreams",
    colors: ["#08F7FE", "#09FBD3", "#FE53BB", "#F5D300", "#00FF41"],
    background: "#000000"
  },
  {
    name: "Toxic Waste",
    colors: ["#CCFF00", "#00FF00", "#39FF14", "#7FFF00", "#ADFF2F"],
    background: "#1A1A1D"
  },
  {
    name: "Magma Flow",
    colors: ["#FF0000", "#FF4500", "#FF6347", "#FF7F50", "#FFA500"],
    background: "#1C0A00"
  },
  {
    name: "Deep Sea Bioluminescence",
    colors: ["#00D9FF", "#00FFF0", "#7BFFDA", "#4DFFDF", "#00E5FF"],
    background: "#001F3F"
  },
  {
    name: "Sakura Sunset",
    colors: ["#FFB7C5", "#FF69B4", "#FF1493", "#C71585", "#FF91A4"],
    background: "#2C1810"
  },
  {
    name: "Aurora Borealis",
    colors: ["#00FF87", "#60EFFF", "#B967FF", "#05FFA1", "#FFFB96"],
    background: "#0A192F"
  },
  {
    name: "Infrared Vision",
    colors: ["#FF0080", "#FF0066", "#FF3366", "#FF1A75", "#FF0044"],
    background: "#000000"
  },
  {
    name: "Radioactive",
    colors: ["#DFFF00", "#CCFF00", "#BFFF00", "#B0FF00", "#9AFF00"],
    background: "#000000"
  },
  {
    name: "Midnight Rave",
    colors: ["#FF006E", "#8338EC", "#3A86FF", "#06FFA5", "#FFFB00"],
    background: "#03071E"
  },
  {
    name: "Peacock Feather",
    colors: ["#0047AB", "#00CED1", "#138808", "#FFD700", "#4B0082"],
    background: "#0D1B2A"
  },
  {
    name: "Lava Lamp",
    colors: ["#FF006E", "#FF4B91", "#FF85B3", "#FFB3D1", "#FFDDE8"],
    background: "#1A0B15"
  },
  {
    name: "Glitch Art",
    colors: ["#00FFFF", "#FF00FF", "#FFFF00", "#00FF00", "#FF0000"],
    background: "#000000"
  },
  {
    name: "Poison Ivy",
    colors: ["#355E3B", "#50C878", "#0BDA51", "#00A86B", "#29AB87"],
    background: "#0F1F0F"
  },
  {
    name: "Cotton Candy Sky",
    colors: ["#FFB3DE", "#D891EF", "#AED8F7", "#FFF9A5", "#FFD6E8"],
    background: "#FFF5F7"
  },
  {
    name: "Molten Metal",
    colors: ["#C0C0C0", "#FFD700", "#FF8C00", "#DC143C", "#8B0000"],
    background: "#1C1C1C"
  },
  {
    name: "Plasma",
    colors: ["#BF00FF", "#FF00BF", "#00BFFF", "#00FFBF", "#BFFF00"],
    background: "#0A0014"
  },
  {
    name: "Holographic",
    colors: ["#FF77FF", "#77FFFF", "#FFFF77", "#FF7777", "#77FF77"],
    background: "#1A1A2E"
  },
];

// Get a random palette
export function getRandomPalette(): ColorPalette {
  return colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
}

// Get N colors from a random palette
export function getRandomColors(count: number): { colors: string[], background?: string } {
  const palette = getRandomPalette();
  
  // Shuffle the colors
  const shuffled = [...palette.colors].sort(() => Math.random() - 0.5);
  
  // If we need more colors than available, repeat the palette
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }
  
  return {
    colors: result,
    background: palette.background
  };
}

// Get a palette by name (useful for favorites)
export function getPaletteByName(name: string): ColorPalette | undefined {
  return colorPalettes.find(p => p.name === name);
}

// Get all palette names
export function getAllPaletteNames(): string[] {
  return colorPalettes.map(p => p.name);
}
