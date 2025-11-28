"use client";

import { useState, useRef, useEffect, useTransition } from "react";
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
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { getRandomColors } from "@/lib/colorPalettes";
import { hasGifAccess, grantGifAccess } from "@/lib/paymentUtils";

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
  paperGrain: false,
  seed: 1000,
  exportWidth: 1600,
  exportHeight: 2000,
  isAnimating: true,
});

// Generate random initial flow params
const generateRandomFlowParams = (): ArtworkParams => {
  const palette = getRandomColors(5);
  return {
    numPoints: Math.floor(randomInRange(150, 300)),
    backgroundFade: Math.floor(randomInRange(10, 30)),
    scaleValue: randomInRange(0.003, 0.01),
    noiseSpeed: randomInRange(0.0003, 0.001),
    movementDistance: randomInRange(5, 15),
    gaussianMean: randomInRange(0.3, 0.7),
    gaussianStd: randomInRange(0.1, 0.2),
    minIterations: Math.floor(randomInRange(8, 15)),
    maxIterations: Math.floor(randomInRange(25, 40)),
    circleSize: Math.floor(randomInRange(8, 15)),
    strokeWeightMin: randomInRange(0.5, 2),
    strokeWeightMax: randomInRange(2, 5),
    angleMultiplier1: randomInRange(5, 12),
    angleMultiplier2: randomInRange(8, 15),
    targetWidth: 800,
    targetHeight: 1000,
    color1: palette.colors[0],
    color2: palette.colors[1],
    color3: palette.colors[2],
    color4: palette.colors[3],
    color5: palette.colors[4],
    exportWidth: 1600,
    exportHeight: 2000,
    isAnimating: true,
    seed: Date.now(),
  };
};

// Generate random initial grid params
const generateRandomGridParams = (): GridArtworkParams => {
  const palette = getRandomColors(4);
  return {
    backgroundColor: "#1d1d1b",
    borderColor: "#f2f2e7",
    color1: palette.colors[0],
    color2: palette.colors[1],
    color3: palette.colors[2],
    color4: palette.colors[3],
    animationSpeed: randomInRange(0.01, 0.05),
    maxDepth: Math.floor(randomInRange(1, 3)),
    minModuleSize: Math.floor(randomInRange(30, 60)),
    subdivideChance: randomInRange(0.3, 0.6),
    crossSize: randomInRange(0.5, 0.9),
    minColumns: Math.floor(randomInRange(4, 6)),
    maxColumns: Math.floor(randomInRange(7, 10)),
    isAnimating: true,
    seed: Date.now(),
    exportWidth: 1600,
    exportHeight: 2000,
  };
};

// Generate random initial mosaic params
const generateRandomMosaicParams = (): MosaicArtworkParams => {
  const palette = getRandomColors(4);
  return {
    color1: palette.colors[0],
    color2: palette.colors[1],
    color3: palette.colors[2],
    color4: palette.colors[3],
    initialRectMinSize: randomInRange(0.2, 0.4),
    initialRectMaxSize: randomInRange(0.8, 0.95),
    gridDivisionChance: randomInRange(0.6, 0.8),
    recursionChance: randomInRange(0.4, 0.7),
    minGridRows: Math.floor(randomInRange(2, 4)),
    maxGridRows: Math.floor(randomInRange(6, 10)),
    minGridCols: Math.floor(randomInRange(2, 4)),
    maxGridCols: Math.floor(randomInRange(6, 10)),
    splitRatioMin: randomInRange(0.15, 0.25),
    splitRatioMax: randomInRange(0.75, 0.85),
    marginMultiplier: randomInRange(0.05, 0.15),
    detailGridMin: Math.floor(randomInRange(2, 3)),
    detailGridMax: Math.floor(randomInRange(4, 6)),
    noiseDensity: randomInRange(0.05, 0.2),
    minRecursionSize: Math.floor(randomInRange(40, 70)),
    seed: Date.now(),
    exportWidth: 1600,
    exportHeight: 2000,
  };
};

// Generate random initial rotated grid params
const generateRandomRotatedGridParams = (): RotatedGridArtworkParams => {
  const palette = getRandomColors(4);
  return {
    color1: palette.colors[0],
    color2: palette.colors[1],
    color3: palette.colors[2],
    color4: palette.colors[3],
    backgroundColor: "#000000",
    offsetRatio: randomInRange(0.03, 0.08),
    marginRatio: randomInRange(0.15, 0.3),
    minCellCount: Math.floor(randomInRange(2, 3)),
    maxCellCount: Math.floor(randomInRange(3, 5)),
    minRecursionSize: randomInRange(0.05, 0.09),
    strokeWeight: randomInRange(0.5, 2),
    seed: Date.now(),
    exportWidth: 1600,
    exportHeight: 2000,
  };
};

// Generate random tree params with darker stems and lighter tips
const generateRandomTreeParams = (): TreeArtworkParams => {
  const stemPalette = getRandomColors(3); // Get darker colors for stems
  const tipPalette = getRandomColors(3);  // Get lighter colors for tips

  // Helper to darken a color
  const darkenColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const factor = 0.6; // Darken by 40%
    return `#${Math.floor(r * factor).toString(16).padStart(2, '0')}${Math.floor(g * factor).toString(16).padStart(2, '0')}${Math.floor(b * factor).toString(16).padStart(2, '0')}`;
  };

  // Helper to lighten a color
  const lightenColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const factor = 1.4; // Lighten by 40%
    return `#${Math.min(255, Math.floor(r * factor)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(g * factor)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(b * factor)).toString(16).padStart(2, '0')}`;
  };

  return {
    initialPaths: Math.floor(randomInRange(1, 3)),
    initialVelocity: randomInRange(8, 15),
    branchProbability: randomInRange(0.15, 0.25),
    diameterShrink: randomInRange(0.6, 0.7),
    minDiameter: randomInRange(0.2, 0.4),
    bumpMultiplier: randomInRange(0.15, 0.3),
    velocityRetention: randomInRange(0.7, 0.85),
    speedMin: randomInRange(4, 6),
    speedMax: randomInRange(9, 12),
    finishedCircleSize: randomInRange(8, 15),
    strokeWeightMultiplier: randomInRange(0.8, 1.5),
    stemColor1: darkenColor(stemPalette.colors[0]),
    stemColor2: darkenColor(stemPalette.colors[1]),
    stemColor3: darkenColor(stemPalette.colors[2]),
    tipColor1: lightenColor(tipPalette.colors[0]),
    tipColor2: lightenColor(tipPalette.colors[1]),
    tipColor3: lightenColor(tipPalette.colors[2]),
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
    paperGrain: false,
    seed: Date.now(),
    exportWidth: 1600,
    exportHeight: 2000,
    isAnimating: true,
  };
};

// Generate random text design params
const generateRandomTextDesignParams = (): TextDesignArtworkParams => {
  return {
    backgroundColor: "#001eff",
    canvasWidth: 850,
    canvasHeight: 850,
    fontUrl: "https://db.onlinewebfonts.com/t/05772fcddb0048a8a7d2279736c5790a.ttf",
    customFontFamily: "",
    layer1: {
      text: "ZOHRAN",
      x: 0.5,
      y: 0.5,
      size: 100,
      alignment: 'center',
      fill: "#FF9900",
      extrudeDepth: 18,
      extrudeX: -1.2,
      extrudeY: 0.8,
      extrudeStart: "#ff0000",
      extrudeEnd: "#ff0000",
      highlight: "#fff4b8",
      showHighlight: false,
      outlineThickness: 0,
      outlineColor: "#D10000",
    },
    layer2: {
      text: "",
      x: 0.3,
      y: 0.68,
      size: 60,
      alignment: 'center',
      fill: "#FF9900",
      extrudeDepth: 12,
      extrudeX: 1.0,
      extrudeY: 1.0,
      extrudeStart: "#D10000",
      extrudeEnd: "#8A0000",
      highlight: "#fff4b8",
      showHighlight: false,
      outlineThickness: 4,
      outlineColor: "#D10000",
    },
    layer3: {
      text: "",
      x: 0.55,
      y: 0.68,
      size: 100,
      alignment: 'center',
      fill: "#FF9900",
      extrudeDepth: 12,
      extrudeX: 1.0,
      extrudeY: 1.0,
      extrudeStart: "#D10000",
      extrudeEnd: "#8A0000",
      highlight: "#fff4b8",
      showHighlight: false,
      outlineThickness: 4,
      outlineColor: "#D10000",
    },
    seed: Date.now(),
    exportWidth: 1600,
    exportHeight: 2000,
  };
};


// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic';

export default function Home() {
  const [currentArtwork, setCurrentArtwork] = useState<ArtworkType>("tree");
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

  const [flowParams, setFlowParams] = useState<ArtworkParams>(() => generateRandomFlowParams());

  const [gridParams, setGridParams] = useState<GridArtworkParams>(() => generateRandomGridParams());

  const [mosaicParams, setMosaicParams] = useState<MosaicArtworkParams>(() => generateRandomMosaicParams());

  const [rotatedGridParams, setRotatedGridParams] = useState<RotatedGridArtworkParams>(() => generateRandomRotatedGridParams());

  const [treeParams, setTreeParams] = useState<TreeArtworkParams>(() => generateRandomTreeParams());

  const [textDesignParams, setTextDesignParams] = useState<TextDesignArtworkParams>(() => generateRandomTextDesignParams());

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
    setFlowParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleFlowColorChange = (param: keyof ArtworkParams, value: string) => {
    setFlowParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleGridParamChange = (param: keyof GridArtworkParams, value: number) => {
    setGridParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleGridColorChange = (param: keyof GridArtworkParams, value: string) => {
    setGridParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleMosaicParamChange = (param: keyof MosaicArtworkParams, value: number) => {
    setMosaicParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleMosaicColorChange = (param: keyof MosaicArtworkParams, value: string) => {
    setMosaicParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleRotatedGridParamChange = (param: keyof RotatedGridArtworkParams, value: number) => {
    setRotatedGridParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleRotatedGridColorChange = (param: keyof RotatedGridArtworkParams, value: string) => {
    setRotatedGridParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleTreeParamChange = (param: keyof TreeArtworkParams, value: number) => {
    setTreeParams((prev) => ({
      ...prev,
      [param]: param === 'textEnabled' || param === 'paperGrain' ? Boolean(value) : value,
    }));
  };

  const handleTreeColorChange = (param: keyof TreeArtworkParams, value: string) => {
    setTreeParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleTextDesignParamChange = (param: keyof TextDesignArtworkParams, value: any) => {
    setTextDesignParams((prev) => ({
      ...prev,
      [param]: value,
    }));
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
    // Get 5 harmonious colors from a curated palette
    const { colors } = getRandomColors(5);

    setFlowParams({
      numPoints: Math.floor(Math.random() * 400) + 100,
      backgroundFade: 15,
      scaleValue: Math.random() * 0.02,
      noiseSpeed: Math.random() * 0.003,
      movementDistance: Math.floor(Math.random() * 15) + 3,
      gaussianMean: Math.random() * 0.4 + 0.3,
      gaussianStd: Math.random() * 0.25 + 0.05,
      minIterations: Math.floor(Math.random() * 20) + 5,
      maxIterations: Math.floor(Math.random() * 40) + 20,
      circleSize: Math.floor(Math.random() * 30) + 5,
      strokeWeightMin: Math.random() * 2 + 0.5,
      strokeWeightMax: Math.random() * 4 + 2,
      angleMultiplier1: Math.floor(Math.random() * 25) + 3,
      angleMultiplier2: Math.floor(Math.random() * 25) + 5,
      targetWidth: 800,
      targetHeight: 1000,
      color1: colors[0],
      color2: colors[1],
      color3: colors[2],
      color4: colors[3],
      color5: colors[4],
      exportWidth: 1600,
      exportHeight: 2000,
      isAnimating: flowParams.isAnimating,
      seed: Date.now(),
    });
  };

  const handleGridRandomize = () => {
    // Get 6 harmonious colors from a curated palette (4 for shapes + background + border)
    const { colors, background } = getRandomColors(6);

    setGridParams({
      backgroundColor: background || colors[0] || "#1d1d1b",
      borderColor: colors[1] || "#f2f2e7",
      color1: colors[2] || "#4793AF",
      color2: colors[3] || "#FFC470",
      color3: colors[4] || "#DD5746",
      color4: colors[5] || "#8B322C",
      animationSpeed: Math.random() * 0.1 + 0.01,
      maxDepth: Math.floor(Math.random() * 3) + 1,
      minModuleSize: Math.floor(Math.random() * 50) + 20,
      subdivideChance: Math.random() * 0.6 + 0.2,
      crossSize: Math.random() * 0.5 + 0.5,
      minColumns: Math.floor(Math.random() * 3) + 4,
      maxColumns: Math.floor(Math.random() * 4) + 7,
      isAnimating: gridParams.isAnimating,
      seed: Date.now(),
      exportWidth: 1600,
      exportHeight: 2000,
    });
  };

  const handleMosaicRandomize = () => {
    // Get 4 harmonious colors from a curated palette
    const { colors } = getRandomColors(4);

    setMosaicParams({
      color1: colors[0],
      color2: colors[1],
      color3: colors[2],
      color4: colors[3],
      initialRectMinSize: Math.random() * 0.4 + 0.2,
      initialRectMaxSize: Math.random() * 0.3 + 0.6,
      gridDivisionChance: Math.random() * 0.6 + 0.3,
      recursionChance: Math.random() * 0.6 + 0.2,
      minGridRows: Math.floor(Math.random() * 3) + 2,
      maxGridRows: Math.floor(Math.random() * 5) + 4,
      minGridCols: Math.floor(Math.random() * 3) + 2,
      maxGridCols: Math.floor(Math.random() * 5) + 4,
      splitRatioMin: Math.random() * 0.2 + 0.1,
      splitRatioMax: Math.random() * 0.2 + 0.7,
      marginMultiplier: Math.random() * 0.15 + 0.05,
      detailGridMin: Math.floor(Math.random() * 2) + 2,
      detailGridMax: Math.floor(Math.random() * 2) + 4,
      noiseDensity: Math.random() * 0.2,
      minRecursionSize: Math.floor(Math.random() * 40) + 30,
      seed: Date.now(),
      exportWidth: 1600,
      exportHeight: 2000,
    });
  };

  const handleMosaicRegenerate = () => {
    setMosaicParams((prev) => ({
      ...prev,
      seed: Date.now(),
    }));
  };

  const handleRotatedGridRandomize = () => {
    // Get 5 harmonious colors from a curated palette (4 for cells + background)
    const { colors, background } = getRandomColors(5);

    setRotatedGridParams({
      color1: colors[0],
      color2: colors[1],
      color3: colors[2],
      color4: colors[3],
      backgroundColor: background || colors[4],
      offsetRatio: Math.random() * 0.1 + 0.02,
      marginRatio: Math.random() * 0.3 + 0.1,
      minCellCount: Math.floor(Math.random() * 2) + 2,
      maxCellCount: Math.floor(Math.random() * 3) + 3,
      minRecursionSize: Math.random() * 0.08 + 0.04,
      strokeWeight: Math.random() * 3 + 0.5,
      seed: Date.now(),
      exportWidth: 1600,
      exportHeight: 2000,
    });
  };

  const handleRotatedGridRegenerate = () => {
    setRotatedGridParams((prev) => ({
      ...prev,
      seed: Date.now(),
    }));
  };

  const handleTreeRandomize = () => {
    setTreeParams(generateRandomTreeParams());
  };

  const handleTreeRegenerate = () => {
    setTreeParams((prev) => ({
      ...prev,
      seed: Date.now(),
    }));
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
          <div className="w-full h-full flex items-center justify-center">
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

      {/* Next Artwork Button - Minimal Circle */}
      <button
        onClick={handleNextArtwork}
        className="fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg transition-all hover:shadow-xl z-40"
        aria-label="Next artwork"
      >
        <ArrowRight className="w-6 h-6" />
      </button>

      {/* Controls Toggle Button - Always Visible */}
      {!controlsVisible && (
        <button
          onClick={() => setControlsVisible(true)}
          className="fixed top-6 right-6 w-12 h-12 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg transition-all hover:shadow-xl z-40"
          aria-label="Open controls"
        >
          <SlidersHorizontal className="w-6 h-6" />
        </button>
      )}

      {/* Controls Dropdown Panel - Floating below button */}
      <div
        className={`fixed top-20 right-6 w-[300px] max-h-[calc(100vh-6rem)] overflow-y-auto bg-white/90 backdrop-blur-md border border-zinc-200 shadow-2xl rounded-2xl transition-all duration-300 z-50 origin-top-right no-scrollbar ${controlsVisible
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}
      >
        {/* Controls Header - Minimal */}
        <button
          onClick={() => setControlsVisible(!controlsVisible)}
          className="w-full px-6 py-4 border-b border-zinc-200 transition-colors flex items-center justify-between bg-white hover:bg-zinc-50 text-zinc-700 sticky top-0 z-10"
          aria-label="Toggle controls"
        >
          <span className="text-sm font-semibold">Controls</span>
          <svg className={`w-5 h-5 transition-transform ${controlsVisible ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Controls Content - Scrollable */}
        <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 73px)' }}>
          {currentArtwork === "flow" ? (
            <Controls
              params={flowParams}
              onParamChange={handleFlowParamChange}
              onColorChange={handleFlowColorChange}
              onExportImage={handleExportImage}
              onExportGif={handleExportGif}
              onExportWallpapers={handleExportWallpapers}
              onToggleAnimation={handleToggleAnimation}
              onRandomize={handleFlowRandomize}
            />
          ) : currentArtwork === "grid" ? (
            <GridControls
              params={gridParams}
              onParamChange={handleGridParamChange}
              onColorChange={handleGridColorChange}
              onExportImage={handleExportImage}
              onExportGif={handleExportGif}
              onExportWallpapers={handleExportWallpapers}
              onToggleAnimation={handleToggleAnimation}
              onRandomize={handleGridRandomize}
            />
          ) : currentArtwork === "mosaic" ? (
            <MosaicControls
              params={mosaicParams}
              onParamChange={handleMosaicParamChange}
              onColorChange={handleMosaicColorChange}
              onExportImage={handleExportImage}
              onExportWallpapers={handleExportWallpapers}
              onRandomize={handleMosaicRandomize}
              onRegenerate={handleMosaicRegenerate}
            />
          ) : currentArtwork === "rotated" ? (
            <RotatedGridControls
              params={rotatedGridParams}
              onParamChange={handleRotatedGridParamChange}
              onColorChange={handleRotatedGridColorChange}
              onExportImage={handleExportImage}
              onExportWallpapers={handleExportWallpapers}
              onRandomize={handleRotatedGridRandomize}
              onRegenerate={handleRotatedGridRegenerate}
            />
          ) : currentArtwork === "tree" ? (
            <TreeControls
              params={treeParams}
              onParamChange={handleTreeParamChange}
              onColorChange={handleTreeColorChange}
              onExportImage={handleExportImage}
              onExportGif={handleExportGif}
              onExportWallpapers={handleExportWallpapers}
              onToggleAnimation={handleToggleAnimation}
              onRandomize={handleTreeRandomize}
              onRegenerate={handleTreeRegenerate}
            />
          ) : (
            <TextDesignControls
              params={textDesignParams}
              onParamChange={handleTextDesignParamChange}
              onExportImage={handleExportImage}
              onExportWallpapers={handleExportWallpapers}
            />
          )}
        </div>
      </div>

      {/* Backdrop */}
      {controlsVisible && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setControlsVisible(false)}
        />
      )}
    </div>
  );
}
