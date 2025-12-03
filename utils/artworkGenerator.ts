import { ArtworkParams } from "@/components/Artwork";
import { GridArtworkParams } from "@/components/GridArtwork";
import { MosaicArtworkParams } from "@/components/MosaicArtwork";
import { RotatedGridArtworkParams } from "@/components/RotatedGridArtwork";
import { TreeArtworkParams } from "@/components/TreeArtwork";
import { TextDesignArtworkParams } from "@/components/TextDesignArtwork";
import { createSeededRandom } from "@/utils/token";
import { decodeParams } from "@/utils/serialization";

// Helper to generate random value within range
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate flow params from a token (deterministic)
export const generateFlowParamsFromToken = (token: string): ArtworkParams => {
    // Check for encoded params first
    if (token.includes("-v1-") || !token.startsWith("fx-")) {
        try {
            return decodeParams(token);
        } catch (error) {
            // Re-throw decode errors (checksum mismatch, etc.)
            throw error;
        }
    }

    // Detect if mobile (screen width < 768px)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const rand = createSeededRandom(token);

    // Multiple curated palette styles
    const paletteStyles = [
        {
            name: 'studioyorktown',
            backgrounds: ['#000000', '#0a0a0a', '#0f0f0f', '#1a1a1a'],
            strokes: ['#ffffff', '#f5f5f5', '#e8e8e8', '#d4d4d4', '#c0c0c0', '#faf8f3', '#f0ede6', '#e6e3dc'],
        },
        {
            name: 'nat_sarkissian',
            backgrounds: ['#1a1614', '#2b2520', '#0d0c0b', '#1e1b18'],
            strokes: ['#e8d5c4', '#f4e8d9', '#d4c0ab', '#c9b59a', '#f0e6d2', '#dcc8b3'],
        },
        {
            name: 'vibrant_dark',
            backgrounds: ['#0a0e27', '#1a1a2e', '#16213e', '#0f1419'],
            strokes: ['#ff6b9d', '#c44569', '#f8b500', '#4a90e2', '#50c878', '#e94b3c'],
        },
        {
            name: 'ocean_depths',
            backgrounds: ['#001f3f', '#0a2f51', '#001a33', '#0d2b45'],
            strokes: ['#7fcdcd', '#41b3d3', '#84fab0', '#8fd3f4', '#a8e6cf'],
        },
        {
            name: 'sunset_minimal',
            backgrounds: ['#2d1b2e', '#1a1423', '#2a1a2e', '#1e1326'],
            strokes: ['#ff6b9d', '#ffa07a', '#ffb6c1', '#ffd700', '#ff8c94'],
        },
    ];

    // Pick a palette style
    const paletteIndex = Math.floor(rand() * paletteStyles.length);
    const palette = paletteStyles[paletteIndex];

    // Pick background
    const backgroundColor = palette.backgrounds[Math.floor(rand() * palette.backgrounds.length)];

    // Pick 5 coordinated strokes
    const colors = [];
    for (let i = 0; i < 5; i++) {
        colors.push(palette.strokes[Math.floor(rand() * palette.strokes.length)]);
    }

    return {
        numPoints: isMobile ? 350 : Math.floor(rand() * 300) + 250, // More points for density
        backgroundFade: 5, // Less fade for cleaner look
        scaleValue: rand() * 0.015 + 0.002, // Smoother, more organic curves
        noiseSpeed: rand() * 0.001 + 0.0002, // Slower movement
        movementDistance: Math.floor(rand() * 8) + 4, // Moderate movement
        gaussianMean: rand() * 0.2 + 0.4, // More centered
        gaussianStd: rand() * 0.15 + 0.08, // Tighter distribution
        minIterations: Math.floor(rand() * 30) + 40, // Longer lines
        maxIterations: Math.floor(rand() * 50) + 60, // Even longer lines
        circleSize: isMobile ? 2 : Math.floor(rand() * 4) + 1, // Smaller dots for elegance
        strokeWeightMin: rand() * 0.3 + 0.1, // Thinner lines
        strokeWeightMax: rand() * 1.5 + 0.5, // Varied but elegant
        angleMultiplier1: Math.floor(rand() * 15) + 8,
        angleMultiplier2: Math.floor(rand() * 15) + 8,
        canvasWidth: isMobile ? 400 : 630,
        canvasHeight: isMobile ? 500 : 790,
        targetWidth: 800,
        targetHeight: 1000,
        color1: colors[0],
        color2: colors[1],
        color3: colors[2],
        color4: colors[3],
        color5: colors[4],
        exportWidth: 1600,
        exportHeight: 2000,
        isAnimating: true,
        token: token,
        colorSeed: token,
    };
};

// Generate grid params from token
export const generateGridParamsFromToken = (token: string): GridArtworkParams => {
    // Check for encoded params first
    if (token.includes("-v1-") || !token.startsWith("fx-")) {
        try {
            return decodeParams(token);
        } catch (error) {
            // Re-throw decode errors (checksum mismatch, etc.)
            throw error;
        }
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const rand = createSeededRandom(token);

    const palettes = [
        ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
        ["#000000", "#14213d", "#fca311", "#e5e5e5", "#ffffff"],
        ["#3d5a80", "#98c1d9", "#e0fbfc", "#ee6c4d", "#293241"],
    ];
    const palette = palettes[Math.floor(rand() * palettes.length)];

    return {
        backgroundColor: palette[0],
        borderColor: palette[1],
        color1: palette[1],
        color2: palette[2],
        color3: palette[3],
        color4: palette[4],
        animationSpeed: rand() * 0.02 + 0.005,
        maxDepth: Math.floor(rand() * 3) + 3,
        minModuleSize: Math.floor(rand() * 20) + 10,
        subdivideChance: rand() * 0.4 + 0.3,
        crossSize: rand() * 0.4 + 0.1,
        minColumns: Math.floor(rand() * 3) + 3,
        maxColumns: Math.floor(rand() * 5) + 5,
        isAnimating: true,
        canvasWidth: isMobile ? 400 : 630,
        canvasHeight: isMobile ? 500 : 790,
        token: token,
        colorSeed: token,
        exportWidth: 1600,
        exportHeight: 2000,
    };
};

// Generate mosaic params from token
export const generateMosaicParamsFromToken = (token: string): MosaicArtworkParams => {
    // Check for encoded params first
    if (token.includes("-v1-") || !token.startsWith("fx-")) {
        try {
            return decodeParams(token);
        } catch (error) {
            // Re-throw decode errors (checksum mismatch, etc.)
            throw error;
        }
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const rand = createSeededRandom(token);

    const palettes = [
        ["#A8DADC", "#E63946", "#457B9D", "#1D3557"],
        ["#264653", "#2a9d8f", "#e9c46a", "#f4a261"],
        ["#cdb4db", "#ffc8dd", "#ffafcc", "#bde0fe"],
    ];
    const palette = palettes[Math.floor(rand() * palettes.length)];

    return {
        color1: palette[0],
        color2: palette[1],
        color3: palette[2],
        color4: palette[3],
        initialRectMinSize: rand() * 0.4 + 0.6,
        initialRectMaxSize: 1.00,
        gridDivisionChance: rand() * 0.3,
        recursionChance: rand() * 0.3,
        minGridRows: Math.floor(rand() * 3) + 1,
        maxGridRows: Math.floor(rand() * 4) + 2,
        minGridCols: Math.floor(rand() * 3) + 2,
        maxGridCols: Math.floor(rand() * 5) + 3,
        splitRatioMin: rand() * 0.3 + 0.1,
        splitRatioMax: rand() * 0.4 + 0.5,
        marginMultiplier: rand() * 0.08 + 0.01,
        detailGridMin: Math.floor(rand() * 3) + 2,
        detailGridMax: Math.floor(rand() * 4) + 4,
        noiseDensity: rand() * 0.15,
        minRecursionSize: Math.floor(rand() * 20) + 10,
        canvasWidth: isMobile ? 400 : 630,
        canvasHeight: isMobile ? 500 : 790,
        token: token,
        colorSeed: token,
        exportWidth: 1600,
        exportHeight: 2000,
    };
};

// Generate rotated grid params from token
export const generateRotatedGridParamsFromToken = (token: string): RotatedGridArtworkParams => {
    // Check for encoded params first
    if (token.includes("-v1-") || !token.startsWith("fx-")) {
        try {
            return decodeParams(token);
        } catch (error) {
            // Re-throw decode errors (checksum mismatch, etc.)
            throw error;
        }
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const rand = createSeededRandom(token);

    const palettes = [
        ["#FF1493", "#FF69B4", "#FFB7C5", "#C71585", "#2C1810"],
        ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
        ["#000000", "#14213d", "#fca311", "#e5e5e5", "#ffffff"],
    ];
    const palette = palettes[Math.floor(rand() * palettes.length)];

    return {
        color1: palette[0],
        color2: palette[1],
        color3: palette[2],
        color4: palette[3],
        backgroundColor: palette[4],
        offsetRatio: rand() * 0.04 + 0.005,
        marginRatio: rand() * 0.4 + 0.3,
        minCellCount: Math.floor(rand() * 3) + 1,
        maxCellCount: Math.floor(rand() * 5) + 4,
        minRecursionSize: rand() * 0.04 + 0.01,
        strokeWeight: rand() * 4 + 1,
        canvasWidth: isMobile ? 400 : 630,
        canvasHeight: isMobile ? 500 : 790,
        token: token,
        colorSeed: token,
        exportWidth: 1600,
        exportHeight: 2000,
    };
};

// Generate tree params from token
export const generateTreeParamsFromToken = (token: string): TreeArtworkParams => {
    // Check for encoded params first
    if (token.includes("-v1-") || !token.startsWith("fx-")) {
        try {
            return decodeParams(token);
        } catch (error) {
            // Re-throw decode errors (checksum mismatch, etc.)
            throw error;
        }
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const rand = createSeededRandom(token);

    const palettes = [
        {
            stem: ["#4a4e69", "#22223b", "#9a8c98"],
            tip: ["#c9ada7", "#f2e9e4", "#9a8c98"],
            bg: "#f2e9e4"
        },
        {
            stem: ["#264653", "#2a9d8f", "#e9c46a"],
            tip: ["#f4a261", "#e76f51", "#e9c46a"],
            bg: "#f1faee"
        },
        {
            stem: ["#000000", "#14213d", "#fca311"],
            tip: ["#e5e5e5", "#ffffff", "#fca311"],
            bg: "#000000"
        }
    ];
    const palette = palettes[Math.floor(rand() * palettes.length)];

    return {
        initialPaths: Math.floor(rand() * 5) + 3,
        initialVelocity: rand() * 2 + 3,
        branchProbability: rand() * 0.02 + 0.01,
        diameterShrink: rand() * 0.02 + 0.95,
        minDiameter: rand() * 1 + 0.5,
        bumpMultiplier: rand() * 0.05 + 0.01,
        velocityRetention: rand() * 0.1 + 0.85,
        speedMin: 0.5,
        speedMax: 2,
        finishedCircleSize: rand() * 3 + 1,
        strokeWeightMultiplier: rand() * 0.5 + 0.5,
        stemColor1: palette.stem[0],
        stemColor2: palette.stem[1],
        stemColor3: palette.stem[2],
        tipColor1: palette.tip[0],
        tipColor2: palette.tip[1],
        tipColor3: palette.tip[2],
        backgroundColor: palette.bg,
        grainAmount: rand() * 0.1,
        isAnimating: true,
        canvasWidth: isMobile ? 400 : 630,
        canvasHeight: isMobile ? 500 : 790,
        token: token,
        exportWidth: 1600,
        exportHeight: 2000,
        textContent: "ARTE",
        textEnabled: false,
        fontSize: 120,
        textColor: "#000000",
        textAlign: "center",
        textX: 50,
        textY: 50,
        lineHeight: 1.2,
        fontFamily: "Inter",
        fontUrl: "",
        customFontFamily: "Inter",
        colorSeed: token
    };
};

// Generate text design params from token
export const generateTextDesignParamsFromToken = (token: string): TextDesignArtworkParams => {
    // Check for encoded params first
    if (token.includes("-v1-") || !token.startsWith("fx-")) {
        try {
            return decodeParams(token);
        } catch (error) {
            // Re-throw decode errors (checksum mismatch, etc.)
            throw error;
        }
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const rand = createSeededRandom(token);

    const palettes = [
        ["#001ef1", "#FF9900", "#ff0000", "#fff4b8", "#D10000"],
        ["#2b2d42", "#8d99ae", "#edf2f4", "#ef233c", "#d90429"],
        ["#000000", "#ffffff", "#ff006e", "#8338ec", "#3a86ff"],
    ];
    const palette = palettes[Math.floor(rand() * palettes.length)];

    return {
        backgroundColor: palette[0],
        canvasWidth: isMobile ? 400 : 630,
        canvasHeight: isMobile ? 500 : 790,
        grainAmount: Math.floor(rand() * 30) + 10,
        fontUrl: "https://example.com/font.ttf",
        customFontFamily: "Noto Sans Bengali",
        layer1: {
            text: "ZOHRAN",
            x: 0.500,
            y: 0.500,
            size: Math.floor(rand() * 40) + 50,
            alignment: 'center',
            fill: palette[1],
            extrudeDepth: Math.floor(rand() * 10) + 2,
            extrudeX: rand() * 4 - 2,
            extrudeY: rand() * 4 - 2,
            extrudeStart: palette[2],
            extrudeEnd: palette[2],
            highlight: palette[3],
            showHighlight: rand() > 0.5,
            outlineThickness: 0,
            outlineColor: palette[4],
            fontUrl: "https://db.onlinewebfonts.com/t/05772fcddb0048a8a7d2279736c5790a.ttf",
        },
        layer2: {
            text: "",
            x: 0.3,
            y: 0.68,
            size: 60,
            alignment: 'center',
            fill: palette[1],
            extrudeDepth: 12,
            extrudeX: 1.0,
            extrudeY: 1.0,
            extrudeStart: palette[4],
            extrudeEnd: palette[4],
            highlight: palette[3],
            showHighlight: false,
            outlineThickness: 4,
            outlineColor: palette[4],
            fontUrl: "",
        },
        layer3: {
            text: "",
            x: 0.55,
            y: 0.68,
            size: 100,
            alignment: 'center',
            fill: palette[1],
            extrudeDepth: 12,
            extrudeX: 1.0,
            extrudeY: 1.0,
            extrudeStart: palette[4],
            extrudeEnd: palette[4],
            highlight: palette[3],
            showHighlight: false,
            outlineThickness: 4,
            outlineColor: palette[4],
            fontUrl: "",
        },
        token: token,
        colorSeed: token,
        exportWidth: 1600,
        exportHeight: 2000,
    };
};
