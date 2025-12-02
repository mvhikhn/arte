"use client";

import { useState, useRef, useEffect, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Artwork, { ArtworkParams, ArtworkRef } from "@/components/Artwork";
import GridArtwork, { GridArtworkParams, GridArtworkRef } from "@/components/GridArtwork";
import MosaicArtwork, { MosaicArtworkParams, MosaicArtworkRef } from "@/components/MosaicArtwork";
import RotatedGridArtwork, { RotatedGridArtworkParams, RotatedGridArtworkRef } from "@/components/RotatedGridArtwork";
import TreeArtwork, { TreeArtworkParams, TreeArtworkRef } from "@/components/TreeArtwork";
import TextDesignArtwork, { TextDesignArtworkParams, TextDesignArtworkRef } from "@/components/TextDesignArtwork";
import Controls from "@/components/Controls";
import GridControls from "@/components/GridControls";
import MosaicControls from "@/components/MosaicControls";
import RotatedGridControls from "@/components/RotatedGridControls";
import TreeControls from "@/components/TreeControls";
import TextDesignControls from "@/components/TextDesignControls";
import { ExportPopup } from "@/components/ExportPopup";
import { PaymentModal } from "@/components/PaymentModal";
import { EmailVerificationModal } from "@/components/EmailVerificationModal";
import { ArrowRight, ArrowLeft, SlidersHorizontal, RefreshCw, Shuffle, Download } from "lucide-react";
import { getRandomColors } from "@/lib/colorPalettes";
import { hasGifAccess, grantGifAccess } from "@/lib/paymentUtils";
import { generateToken, validateToken } from "@/utils/token";

type ArtworkType = "flow" | "grid" | "mosaic" | "rotated" | "tree" | "textdesign";

// Helper to generate random value within range
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Fixed default params for SSR/hydration consistency
const getDefaultTreeParams = (): TreeArtworkParams => ({
  initialPaths: 2,
  initialVelocity: 10,
  branchProbability: 0.2,
  diameterShrink: 0.65,
  minDiameter: 0.3,
  bumpMultiplier: 0.2,
  velocityRetention: 0.77,
  speedMin: 5,
  speedMax: 10,
  finishedCircleSize: 12,
  strokeWeightMultiplier: 1.1,
  stemColor1: "#3d2817",
  stemColor2: "#4a3319",
  stemColor3: "#5c3d1f",
  tipColor1: "#e8c4a0",
  tipColor2: "#f0d4b8",
  tipColor3: "#d9b89a",
  backgroundColor: "#fafafa",
  textContent: "",
  textEnabled: false,
  fontSize: 24,
  textColor: "#333333",
  textAlign: 'center' as 'left' | 'center' | 'right',
  textX: 400,
  textY: 50,
  lineHeight: 1.5,
  fontFamily: 'Georgia, serif',
  fontUrl: '',
  customFontFamily: '',
  grainAmount: 0,
  canvasWidth: 400,
  canvasHeight: 400,

  token: "fx-default-tree-token",
  exportWidth: 1600,
  exportHeight: 2000,
  isAnimating: true,
});

// Generate flow params from a token (deterministic)
const generateFlowParamsFromToken = (token: string): ArtworkParams => {
  // Detect if mobile (screen width < 768px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Import the seeded random function
  const { createSeededRandom } = require('@/utils/token');
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
  };
};

// Generate random initial flow params (creates new token)
const generateRandomFlowParams = (): ArtworkParams => {
  const newToken = generateToken();
  return generateFlowParamsFromToken(newToken);
};

// Generate random initial grid params
// Generate grid params from token
const generateGridParamsFromToken = (token: string): GridArtworkParams => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const { createSeededRandom } = require('@/utils/token');
  const rand = createSeededRandom(token);

  // Palette generation (simplified for now, can be expanded)
  const palettes = [
    ["#1B4332", "#52B788", "#2D6A4F", "#95D5B2", "#40916C", "#74C69D"],
    ["#001219", "#005f73", "#0a9396", "#94d2bd", "#e9d8a6", "#ee9b00"],
    ["#2b2d42", "#8d99ae", "#edf2f4", "#ef233c", "#d90429", "#2b2d42"],
  ];
  const palette = palettes[Math.floor(rand() * palettes.length)];

  return {
    backgroundColor: palette[0],
    borderColor: palette[1],
    color1: palette[2],
    color2: palette[3],
    color3: palette[4],
    color4: palette[5],
    animationSpeed: rand() * 0.1 + 0.02,
    maxDepth: Math.floor(rand() * 3) + 1,
    minModuleSize: Math.floor(rand() * 30) + 20,
    subdivideChance: rand() * 0.5 + 0.3,
    crossSize: rand() * 0.5 + 0.4,
    minColumns: Math.floor(rand() * 4) + 3,
    maxColumns: Math.floor(rand() * 8) + 6,
    canvasWidth: isMobile ? 400 : 630,
    canvasHeight: isMobile ? 500 : 790,
    isAnimating: true,
    token: token,
    exportWidth: 1600,
    exportHeight: 2000,
  };
};

// Generate random initial grid params
const generateRandomGridParams = (): GridArtworkParams => {
  const newToken = generateToken();
  return generateGridParamsFromToken(newToken);
};

// Generate random initial mosaic params
// Generate mosaic params from token
const generateMosaicParamsFromToken = (token: string): MosaicArtworkParams => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const { createSeededRandom } = require('@/utils/token');
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
    exportWidth: 1600,
    exportHeight: 2000,
  };
};

// Generate random initial mosaic params
const generateRandomMosaicParams = (): MosaicArtworkParams => {
  const newToken = generateToken();
  return generateMosaicParamsFromToken(newToken);
};

// Generate random initial rotated grid params
// Generate rotated grid params from token
const generateRotatedGridParamsFromToken = (token: string): RotatedGridArtworkParams => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const { createSeededRandom } = require('@/utils/token');
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
    exportWidth: 1600,
    exportHeight: 2000,
  };
};

// Generate random initial rotated grid params
const generateRandomRotatedGridParams = (): RotatedGridArtworkParams => {
  const newToken = generateToken();
  return generateRotatedGridParamsFromToken(newToken);
};

// Generate random tree params with darker stems and lighter tips
// Generate tree params from token
const generateTreeParamsFromToken = (token: string): TreeArtworkParams => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const { createSeededRandom } = require('@/utils/token');
  const rand = createSeededRandom(token);

  const palettes = [
    ["#8B4513", "#A0522D", "#CD853F", "#FF69B4", "#FFB6C1", "#FFC0CB", "#000000"],
    ["#2f3e46", "#354f52", "#52796f", "#84a98c", "#cad2c5", "#f0f3bd", "#2f3e46"],
    ["#5f0f40", "#9a031e", "#fb8b24", "#e36414", "#0f4c5c", "#5f0f40", "#000000"],
  ];
  const palette = palettes[Math.floor(rand() * palettes.length)];

  return {
    initialPaths: Math.floor(rand() * 3) + 1,
    initialVelocity: isMobile ? 10 : rand() * 5 + 10,
    branchProbability: rand() * 0.15 + 0.1,
    diameterShrink: rand() * 0.1 + 0.6,
    minDiameter: rand() * 0.2 + 0.1,
    bumpMultiplier: rand() * 0.2 + 0.1,
    velocityRetention: rand() * 0.2 + 0.7,
    speedMin: rand() * 3 + 3,
    speedMax: rand() * 5 + 8,
    finishedCircleSize: rand() * 8 + 6,
    strokeWeightMultiplier: rand() * 0.5 + 1,
    stemColor1: palette[0],
    stemColor2: palette[1],
    stemColor3: palette[2],
    tipColor1: palette[3],
    tipColor2: palette[4],
    tipColor3: palette[5],
    backgroundColor: palette[6],
    textContent: "",
    textEnabled: true,
    fontSize: 24,
    textColor: "#ff1f1f",
    textAlign: 'center' as 'left' | 'center' | 'right',
    textX: isMobile ? 200 : 311,
    textY: 50,
    lineHeight: 1.5,
    fontFamily: 'Georgia',
    fontUrl: 'https://fonts.googleapis.com/css2?family=...',
    customFontFamily: '',
    grainAmount: Math.floor(rand() * 50) + 20,
    canvasWidth: isMobile ? 400 : 630,
    canvasHeight: isMobile ? 500 : 790,
    token: token,
    exportWidth: 1600,
    exportHeight: 2000,
    isAnimating: true,
  };
};

// Generate random tree params
const generateRandomTreeParams = (): TreeArtworkParams => {
  const newToken = generateToken();
  return generateTreeParamsFromToken(newToken);
};

// Generate random text design params
// Generate text design params from token
const generateTextDesignParamsFromToken = (token: string): TextDesignArtworkParams => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const { createSeededRandom } = require('@/utils/token');
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
    exportWidth: 1600,
    exportHeight: 2000,
  };
};

// Generate random text design params
const generateRandomTextDesignParams = (): TextDesignArtworkParams => {
  const newToken = generateToken();
  return generateTextDesignParamsFromToken(newToken);
};


// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic';

function StudioContent() {
  const searchParams = useSearchParams();
  const artworkParam = searchParams.get('artwork');
  const validArtworks: ArtworkType[] = ["flow", "grid", "mosaic", "rotated", "tree", "textdesign"];
  const initialArtwork = validArtworks.includes(artworkParam as ArtworkType)
    ? (artworkParam as ArtworkType)
    : "flow";

  const [currentArtwork, setCurrentArtwork] = useState<ArtworkType>(initialArtwork);
  const [controlsVisible, setControlsVisible] = useState(false);
  const flowArtworkRef = useRef<ArtworkRef>(null);
  const gridArtworkRef = useRef<GridArtworkRef>(null);
  const mosaicArtworkRef = useRef<MosaicArtworkRef>(null);
  const rotatedGridArtworkRef = useRef<RotatedGridArtworkRef>(null);
  const treeArtworkRef = useRef<TreeArtworkRef>(null);
  const textDesignArtworkRef = useRef<TextDesignArtworkRef>(null);
  const [exportStatus, setExportStatus] = useState({ isExporting: false, message: "" });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingGifExport, setPendingGifExport] = useState<{ duration: number; fps: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const isPreview = searchParams.get('preview') === 'true';

  const [flowParams, setFlowParams] = useState<ArtworkParams>(() => generateRandomFlowParams());

  const [gridParams, setGridParams] = useState<GridArtworkParams>(() => generateRandomGridParams());

  const [mosaicParams, setMosaicParams] = useState<MosaicArtworkParams>(() => generateRandomMosaicParams());

  const [rotatedGridParams, setRotatedGridParams] = useState<RotatedGridArtworkParams>(() => generateRandomRotatedGridParams());

  const [treeParams, setTreeParams] = useState<TreeArtworkParams>(() => generateRandomTreeParams());

  const [textDesignParams, setTextDesignParams] = useState<TextDesignArtworkParams>(() => generateRandomTextDesignParams());

  // Separate state for token input to allow free editing
  const [tokenInput, setTokenInput] = useState<string>("");

  // Initialize token input when flowParams changes
  // Initialize token input when params change
  useEffect(() => {
    if (currentArtwork === 'flow') setTokenInput(flowParams.token);
    else if (currentArtwork === 'grid') setTokenInput(gridParams.token);
    else if (currentArtwork === 'mosaic') setTokenInput(mosaicParams.token);
    else if (currentArtwork === 'rotated') setTokenInput(rotatedGridParams.token);
    else if (currentArtwork === 'tree') setTokenInput(treeParams.token);
    else if (currentArtwork === 'textdesign') setTokenInput(textDesignParams.token);
  }, [currentArtwork, flowParams.token, gridParams.token, mosaicParams.token, rotatedGridParams.token, treeParams.token, textDesignParams.token]);

  // Save current artwork state to localStorage
  const saveArtworkState = () => {
    const state = {
      currentArtwork,
      flowParams,
      gridParams,
      mosaicParams,
      rotatedGridParams,
      treeParams,
      textDesignParams,
      timestamp: Date.now(),
    };
    localStorage.setItem('artworkState', JSON.stringify(state));
  };

  // Restore artwork state from localStorage
  const restoreArtworkState = () => {
    try {
      const saved = localStorage.getItem('artworkState');
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if saved within last 30 minutes
        if (Date.now() - state.timestamp < 30 * 60 * 1000) {
          setCurrentArtwork(state.currentArtwork);
          setFlowParams(state.flowParams);
          setGridParams(state.gridParams);
          setMosaicParams(state.mosaicParams);
          setRotatedGridParams(state.rotatedGridParams);
          setTreeParams(state.treeParams);
          setTextDesignParams(state.textDesignParams);
          localStorage.removeItem('artworkState'); // Clear after restore
          return true;
        }
        localStorage.removeItem('artworkState'); // Clear old state
      }
    } catch (error) {
      console.error('Failed to restore artwork state:', error);
      localStorage.removeItem('artworkState');
    }
    return false;
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if returning from successful payment or email verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isReturningFromPayment = urlParams.get('payment') === 'success';
    const isReturningFromVerification = urlParams.get('verified') === 'true';

    // Restore artwork state if returning from payment or verification
    if (isReturningFromPayment || isReturningFromVerification) {
      const restored = restoreArtworkState();

      if (isReturningFromPayment) {
        // Grant local access (for immediate use on this device)
        grantGifAccess();

        // Show success message
        setExportStatus({ isExporting: false, message: "Payment successful! GIF exports unlocked!" });
        setTimeout(() => {
          setExportStatus({ isExporting: false, message: "" });
        }, 3000);
      }

      if (isReturningFromVerification) {
        setExportStatus({ isExporting: false, message: restored ? "Welcome back! Your artwork has been restored." : "Email verified!" });
        setTimeout(() => {
          setExportStatus({ isExporting: false, message: "" });
        }, 3000);
      }

      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Listen for email verification modal trigger
    const handleShowEmailVerification = () => {
      saveArtworkState(); // Save state before showing verification modal
      setShowEmailVerification(true);
    };

    window.addEventListener('showEmailVerification', handleShowEmailVerification);

    return () => {
      window.removeEventListener('showEmailVerification', handleShowEmailVerification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleFlowParamChange = (param: keyof ArtworkParams, value: number) => {
    setFlowParams((prev) => {
      // Create new params with the changed value
      const newParams = {
        ...prev,
        [param]: value,
      };

      // Generate a new token to represent this state
      const newToken = generateToken();

      return {
        ...newParams,
        token: newToken,
      };
    });
  };

  const handleFlowColorChange = (param: keyof ArtworkParams, value: string) => {
    setFlowParams((prev) => {
      // Create new params with the changed color
      const newParams = {
        ...prev,
        [param]: value,
      };

      // Generate a new token to represent this state
      const newToken = generateToken();

      return {
        ...newParams,
        token: newToken,
      };
    });
  };

  const handleFlowTokenChange = (value: string) => {
    // Trim whitespace
    const trimmedValue = value.trim();

    // Always update the input field (with untrimmed value for UX)
    setTokenInput(value);

    // Only update if the token is valid - regenerate ALL params from the token
    if (validateToken(trimmedValue)) {
      const newParams = generateFlowParamsFromToken(trimmedValue);
      setFlowParams(newParams);
    }
  };

  const handleGridParamChange = (param: keyof GridArtworkParams, value: number) => {
    setGridParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = generateToken();
      return { ...newParams, token: newToken };
    });
  };

  const handleGridColorChange = (param: keyof GridArtworkParams, value: string) => {
    setGridParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = generateToken();
      return { ...newParams, token: newToken };
    });
  };

  const handleGridTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue)) {
      const newParams = generateGridParamsFromToken(trimmedValue);
      setGridParams(newParams);
    }
  };

  const handleMosaicParamChange = (param: keyof MosaicArtworkParams, value: number) => {
    setMosaicParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = generateToken();
      return { ...newParams, token: newToken };
    });
  };

  const handleMosaicColorChange = (param: keyof MosaicArtworkParams, value: string) => {
    setMosaicParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = generateToken();
      return { ...newParams, token: newToken };
    });
  };

  const handleMosaicTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue)) {
      const newParams = generateMosaicParamsFromToken(trimmedValue);
      setMosaicParams(newParams);
    }
  };

  const handleRotatedGridParamChange = (param: keyof RotatedGridArtworkParams, value: number) => {
    setRotatedGridParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = generateToken();
      return { ...newParams, token: newToken };
    });
  };

  const handleRotatedGridColorChange = (param: keyof RotatedGridArtworkParams, value: string) => {
    setRotatedGridParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = generateToken();
      return { ...newParams, token: newToken };
    });
  };

  const handleRotatedGridTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue)) {
      const newParams = generateRotatedGridParamsFromToken(trimmedValue);
      setRotatedGridParams(newParams);
    }
  };

  const handleTreeParamChange = (param: keyof TreeArtworkParams, value: number) => {
    setTreeParams((prev) => {
      const newParams = { ...prev, [param]: param === 'textEnabled' ? Boolean(value) : value };
      const newToken = generateToken();
      return { ...newParams, token: newToken };
    });
  };

  const handleTreeColorChange = (param: keyof TreeArtworkParams, value: string) => {
    setTreeParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = generateToken();
      return { ...newParams, token: newToken };
    });
  };

  const handleTreeTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue)) {
      const newParams = generateTreeParamsFromToken(trimmedValue);
      setTreeParams(newParams);
    }
  };

  const handleTextDesignParamChange = (param: keyof TextDesignArtworkParams, value: any) => {
    setTextDesignParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = generateToken();
      return { ...newParams, token: newToken };
    });
  };

  const handleTextDesignTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue)) {
      const newParams = generateTextDesignParamsFromToken(trimmedValue);
      setTextDesignParams(newParams);
    }
  };

  const handleExportImage = () => {
    setExportStatus({ isExporting: true, message: "Exporting image..." });
    if (currentArtwork === "flow") {
      flowArtworkRef.current?.exportImage();
    } else if (currentArtwork === "grid") {
      gridArtworkRef.current?.exportImage();
    } else if (currentArtwork === "mosaic") {
      mosaicArtworkRef.current?.exportImage();
    } else if (currentArtwork === "rotated") {
      rotatedGridArtworkRef.current?.exportImage();
    } else if (currentArtwork === "tree") {
      treeArtworkRef.current?.exportImage();
    } else if (currentArtwork === "textdesign") {
      // Check paywall for textdesign
      if (!hasGifAccess()) {
        saveArtworkState();
        setShowPaymentModal(true);
        return;
      }
      textDesignArtworkRef.current?.exportImage();
    }
    setTimeout(() => {
      setExportStatus({ isExporting: false, message: "Image exported!" });
    }, 500);
  };

  const handleExportGif = async (duration: number, fps: number) => {
    // Check if user has paid for GIF export
    if (!hasGifAccess()) {
      // Save current artwork state before payment
      saveArtworkState();
      // Store the pending export and show payment modal
      setPendingGifExport({ duration, fps });
      setShowPaymentModal(true);
      return;
    }

    // User has access, proceed with export
    executeGifExport(duration, fps);
  };

  const executeGifExport = async (duration: number, fps: number) => {
    setExportStatus({ isExporting: true, message: `Recording ${duration}s GIF...` });
    if (currentArtwork === "flow") {
      flowArtworkRef.current?.exportGif(duration, fps);
    } else if (currentArtwork === "grid") {
      gridArtworkRef.current?.exportGif(duration, fps);
    } else if (currentArtwork === "tree") {
      treeArtworkRef.current?.exportGif(duration, fps);
    }
    setTimeout(() => {
      setExportStatus({ isExporting: false, message: "GIF exported!" });
    }, (duration + 1) * 1000);
  };

  const handleExportWallpapers = () => {
    // Check if user has paid for wallpaper export (same access as GIF)
    if (!hasGifAccess()) {
      // Save current artwork state before payment
      saveArtworkState();
      // Show payment modal
      setShowPaymentModal(true);
      return;
    }

    // User has access, proceed with export
    setExportStatus({ isExporting: true, message: "Exporting wallpapers..." });
    if (currentArtwork === "flow") {
      flowArtworkRef.current?.exportWallpapers();
    } else if (currentArtwork === "grid") {
      gridArtworkRef.current?.exportWallpapers();
    } else if (currentArtwork === "mosaic") {
      mosaicArtworkRef.current?.exportWallpapers();
    } else if (currentArtwork === "rotated") {
      rotatedGridArtworkRef.current?.exportWallpapers();
    } else if (currentArtwork === "tree") {
      treeArtworkRef.current?.exportWallpapers();
    } else if (currentArtwork === "textdesign") {
      textDesignArtworkRef.current?.exportWallpapers();
    }
    setTimeout(() => {
      setExportStatus({ isExporting: false, message: "Wallpapers exported!" });
    }, 1000);
  };

  const handlePaymentSuccess = () => {
    // Grant access
    grantGifAccess();

    // Execute the pending export if exists
    if (pendingGifExport) {
      executeGifExport(pendingGifExport.duration, pendingGifExport.fps);
      setPendingGifExport(null);
    }
  };

  const handleToggleAnimation = () => {
    if (currentArtwork === "flow") {
      setFlowParams((prev) => ({
        ...prev,
        isAnimating: !prev.isAnimating,
      }));
    } else if (currentArtwork === "grid") {
      setGridParams((prev) => ({
        ...prev,
        isAnimating: !prev.isAnimating,
      }));
    } else if (currentArtwork === "tree") {
      setTreeParams((prev) => ({
        ...prev,
        isAnimating: !prev.isAnimating,
      }));
    }
  };

  const handleFlowRandomize = () => {
    // Generate new params with new token
    const newParams = generateRandomFlowParams();
    setFlowParams(newParams);
  };

  const handleGridRandomize = () => {
    const newParams = generateRandomGridParams();
    setGridParams(newParams);
  };

  const handleMosaicRandomize = () => {
    const newParams = generateRandomMosaicParams();
    setMosaicParams(newParams);
  };

  const handleMosaicRegenerate = () => {
    setMosaicParams((prev) => {
      const newToken = generateToken();
      return { ...prev, token: newToken };
    });
  };

  const handleRotatedGridRandomize = () => {
    const newParams = generateRandomRotatedGridParams();
    setRotatedGridParams(newParams);
  };

  const handleRotatedGridRegenerate = () => {
    setRotatedGridParams((prev) => {
      const newToken = generateToken();
      return { ...prev, token: newToken };
    });
  };

  const handleTreeRandomize = () => {
    setTreeParams(prev => ({
      ...generateRandomTreeParams(),
      canvasWidth: prev.canvasWidth,
      canvasHeight: prev.canvasHeight
    }));
  };

  const handleTreeRegenerate = () => {
    setTreeParams((prev) => {
      const newToken = generateToken();
      return { ...prev, token: newToken };
    });
  };

  const handleNextArtwork = () => {
    startTransition(() => {
      setCurrentArtwork((prev) => {
        if (prev === "flow") return "grid";
        if (prev === "grid") return "mosaic";
        if (prev === "mosaic") return "rotated";
        if (prev === "rotated") return "tree";
        if (prev === "tree") return "textdesign";
        return "flow";
      });
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      <ExportPopup
        isExporting={exportStatus.isExporting}
        message={exportStatus.message}
        onClose={() => setExportStatus({ isExporting: false, message: "" })}
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          // Payment successful, refresh to update status
          window.location.reload();
        }}
      />
      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        onSuccess={() => {
          // Access has been granted, refresh the page or update state
          window.location.reload();
        }}
      />
      <main className="h-screen w-screen overflow-hidden bg-white">
        {/* Artwork Section - Full Screen */}
        <div className="h-full w-full flex items-center justify-center md:w-1/2 md:h-full md:items-center md:justify-center relative bg-white">
          {/* Artwork wrapper - fills container */}
          <div className="w-full h-full flex items-center justify-center relative">
            {currentArtwork === "flow" ? (
              <Artwork ref={flowArtworkRef} params={flowParams} />
            ) : currentArtwork === "grid" ? (
              <GridArtwork ref={gridArtworkRef} params={gridParams} />
            ) : currentArtwork === "mosaic" ? (
              <MosaicArtwork ref={mosaicArtworkRef} params={mosaicParams} />
            ) : currentArtwork === "rotated" ? (
              <RotatedGridArtwork ref={rotatedGridArtworkRef} params={rotatedGridParams} />
            ) : currentArtwork === "tree" ? (
              <TreeArtwork ref={treeArtworkRef} params={treeParams} />
            ) : (
              <TextDesignArtwork ref={textDesignArtworkRef} params={textDesignParams} />
            )}
          </div>
        </div>
      </main>

      {/* Only show controls/buttons when NOT in preview mode */}
      {!isPreview && (
        <>
          {/* Home Button - Top Left */}
          {/* Home Button - Minimal */}
          <Link
            href="/"
            className="group fixed top-6 left-6 flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors z-50"
            aria-label="Return to home"
          >
            <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0">Home</span>
          </Link>

          {/* Next Artwork Button - Minimal */}
          <button
            onClick={handleNextArtwork}
            className="group fixed bottom-6 right-6 flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors z-50"
            aria-label="Next artwork"
          >
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -mr-2 group-hover:mr-0">Next</span>
            <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Action Icons - Regenerate, Randomize, Export */}
          <div className="fixed top-6 right-32 flex items-center gap-2 z-50">
            {/* Regenerate Button - only for artworks that have regenerate */}
            {(currentArtwork === "mosaic" || currentArtwork === "rotated" || currentArtwork === "tree") && (
              <button
                onClick={() => {
                  if (currentArtwork === "mosaic") handleMosaicRegenerate();
                  if (currentArtwork === "rotated") handleRotatedGridRegenerate();
                  if (currentArtwork === "tree") handleTreeRegenerate();
                }}
                className="group p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                aria-label="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Randomize Button */}
            <button
              onClick={() => {
                if (currentArtwork === "flow") handleFlowRandomize();
                if (currentArtwork === "grid") handleGridRandomize();
                if (currentArtwork === "mosaic") handleMosaicRandomize();
                if (currentArtwork === "rotated") handleRotatedGridRandomize();
                if (currentArtwork === "tree") handleTreeRandomize();
              }}
              className="group p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              aria-label="Randomize"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportImage}
              className="group p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              aria-label="Export"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Controls Toggle Button */}
          <button
            onClick={() => setControlsVisible(!controlsVisible)}
            className="group fixed top-6 right-6 flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors z-50"
            aria-label="Toggle controls"
          >
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -mr-2 group-hover:mr-0">Controls</span>
            <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </button>

          {/* Controls Dropdown Panel */}
          {controlsVisible && (
            <div
              className="fixed top-16 right-6 w-[300px] max-h-[calc(100vh-8rem)] overflow-y-auto bg-white/90 backdrop-blur-md border border-zinc-200 shadow-2xl rounded-2xl z-40 no-scrollbar"
            >
              <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 73px)' }}>
                {currentArtwork === "flow" && (
                  <Controls
                    params={flowParams}
                    tokenInput={tokenInput}
                    onParamChange={handleFlowParamChange}
                    onColorChange={handleFlowColorChange}
                    onTokenChange={handleFlowTokenChange}
                    onExportImage={handleExportImage}
                    onExportGif={handleExportGif}
                    onExportWallpapers={handleExportWallpapers}
                    onToggleAnimation={handleToggleAnimation}
                    onRandomize={handleFlowRandomize}
                  />
                )}
                {currentArtwork === "grid" && (
                  <GridControls
                    params={gridParams}
                    onParamChange={handleGridParamChange}
                    onColorChange={handleGridColorChange}
                    onExportImage={handleExportImage}
                    onExportGif={handleExportGif}
                    onExportWallpapers={handleExportWallpapers}
                    onToggleAnimation={handleToggleAnimation}
                    tokenInput={tokenInput}
                    onTokenChange={handleGridTokenChange}
                    onRandomize={handleGridRandomize}
                  />
                )}
                {currentArtwork === "mosaic" && (
                  <MosaicControls
                    params={mosaicParams}
                    onParamChange={handleMosaicParamChange}
                    onColorChange={handleMosaicColorChange}
                    tokenInput={tokenInput}
                    onTokenChange={handleMosaicTokenChange}
                    onExportImage={handleExportImage}
                    onExportWallpapers={handleExportWallpapers}
                    onRandomize={handleMosaicRandomize}
                    onRegenerate={handleMosaicRegenerate}
                  />
                )}
                {currentArtwork === "rotated" && (
                  <RotatedGridControls
                    params={rotatedGridParams}
                    onParamChange={handleRotatedGridParamChange}
                    onColorChange={handleRotatedGridColorChange}
                    tokenInput={tokenInput}
                    onTokenChange={handleRotatedGridTokenChange}
                    onExportImage={handleExportImage}
                    onExportWallpapers={handleExportWallpapers}
                    onRandomize={handleRotatedGridRandomize}
                    onRegenerate={handleRotatedGridRegenerate}
                  />
                )}
                {currentArtwork === "tree" && (
                  <TreeControls
                    params={treeParams}
                    onParamChange={handleTreeParamChange}
                    onColorChange={handleTreeColorChange}
                    tokenInput={tokenInput}
                    onTokenChange={handleTreeTokenChange}
                    onExportImage={handleExportImage}
                    onExportGif={handleExportGif}
                    onExportWallpapers={handleExportWallpapers}
                    onToggleAnimation={handleToggleAnimation}
                    onRandomize={handleTreeRandomize}
                    onRegenerate={handleTreeRegenerate}
                  />
                )}
                {currentArtwork === "textdesign" && (
                  <TextDesignControls
                    params={textDesignParams}
                    onParamChange={handleTextDesignParamChange}
                    tokenInput={tokenInput}
                    onTokenChange={handleTextDesignTokenChange}
                    onExportImage={handleExportImage}
                    onExportWallpapers={handleExportWallpapers}
                  />
                )}
              </div>
            </div>
          )}
          {/* End of preview mode conditional */}
        </>
      )}
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    }>
      <StudioContent />
    </Suspense>
  );
}
