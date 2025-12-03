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
import { encodeParams } from "@/utils/serialization";

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

import {
  generateFlowParamsFromToken,
  generateGridParamsFromToken,
  generateMosaicParamsFromToken,
  generateRotatedGridParamsFromToken,
  generateTreeParamsFromToken,
  generateTextDesignParamsFromToken
} from "@/utils/artworkGenerator";

// Generate random initial flow params (creates new token)
const generateRandomFlowParams = (): ArtworkParams => {
  const newToken = generateToken('flow');
  return generateFlowParamsFromToken(newToken);
};

// Generate random initial grid params


// Generate random initial grid params
const generateRandomGridParams = (): GridArtworkParams => {
  const newToken = generateToken('grid');
  return generateGridParamsFromToken(newToken);
};

// Generate random initial mosaic params


// Generate random initial mosaic params
const generateRandomMosaicParams = (): MosaicArtworkParams => {
  const newToken = generateToken('mosaic');
  return generateMosaicParamsFromToken(newToken);
};

// Generate random initial rotated grid params


// Generate random initial rotated grid params
const generateRandomRotatedGridParams = (): RotatedGridArtworkParams => {
  const newToken = generateToken('rotated');
  return generateRotatedGridParamsFromToken(newToken);
};

// Generate random tree params with darker stems and lighter tips


// Generate random tree params
const generateRandomTreeParams = (): TreeArtworkParams => {
  const newToken = generateToken('tree');
  return generateTreeParamsFromToken(newToken);
};

// Generate random text design params


// Generate random text design params
const generateRandomTextDesignParams = (): TextDesignArtworkParams => {
  const newToken = generateToken('text');
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

  // Initialize from URL token if provided
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken && validateToken(urlToken)) {
      // Token is in URL, use it to initialize the artwork
      const type = currentArtwork === 'textdesign' ? 'text' : currentArtwork;

      try {
        switch (type) {
          case 'flow':
            setFlowParams(generateFlowParamsFromToken(urlToken));
            break;
          case 'grid':
            setGridParams(generateGridParamsFromToken(urlToken));
            break;
          case 'mosaic':
            setMosaicParams(generateMosaicParamsFromToken(urlToken));
            break;
          case 'rotated':
            setRotatedGridParams(generateRotatedGridParamsFromToken(urlToken));
            break;
          case 'tree':
            setTreeParams(generateTreeParamsFromToken(urlToken));
            break;
          case 'text':
            setTextDesignParams(generateTextDesignParamsFromToken(urlToken));
            break;
        }
        setTokenInput(urlToken);
      } catch (error) {
        console.error('Failed to initialize from URL token:', error);
      }
    }
    // Only run on mount or when URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const newToken = encodeParams('flow', newParams);
      setTokenInput(newToken); // Update URL with v1 token

      return {
        ...newParams,
        token: prev.token, // Keep original seed for stable layout
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
      const newToken = encodeParams('flow', newParams);
      setTokenInput(newToken); // Update URL with v1 token

      return {
        ...newParams,
        token: prev.token, // Keep original seed
      };
    });
  };

  const handleFlowTokenChange = (value: string) => {
    // Trim whitespace
    const trimmedValue = value.trim();

    // Always update the input field (with untrimmed value for UX)
    setTokenInput(value);

    // Only update if the token is valid - regenerate ALL params from the token
    if (validateToken(trimmedValue, 'flow')) {
      const newParams = generateFlowParamsFromToken(trimmedValue);
      setFlowParams(newParams);
    }
  };

  const handleGridParamChange = (param: keyof GridArtworkParams, value: number) => {
    setGridParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = encodeParams('grid', newParams);
      setTokenInput(newToken); // Update URL with v1 token
      return { ...newParams, token: prev.token }; // Keep original seed for stable layout
    });
  };

  const handleGridColorChange = (param: keyof GridArtworkParams, value: string) => {
    setGridParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = encodeParams('grid', newParams);
      setTokenInput(newToken); // Update URL with v1 token
      return { ...newParams, token: prev.token }; // Keep original seed
    });
  };

  const handleGridTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue, 'grid')) {
      const newParams = generateGridParamsFromToken(trimmedValue);
      setGridParams(newParams);
    }
  };

  const handleMosaicParamChange = (param: keyof MosaicArtworkParams, value: number) => {
    setMosaicParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = encodeParams('mosaic', newParams);
      setTokenInput(newToken);
      return { ...newParams, token: prev.token };
    });
  };

  const handleMosaicColorChange = (param: keyof MosaicArtworkParams, value: string) => {
    setMosaicParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = encodeParams('mosaic', newParams);
      setTokenInput(newToken);
      return { ...newParams, token: prev.token };
    });
  };

  const handleMosaicTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue, 'mosaic')) {
      const newParams = generateMosaicParamsFromToken(trimmedValue);
      setMosaicParams(newParams);
    }
  };

  const handleRotatedGridParamChange = (param: keyof RotatedGridArtworkParams, value: number) => {
    setRotatedGridParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = encodeParams('rotated', newParams);
      setTokenInput(newToken);
      return { ...newParams, token: prev.token };
    });
  };

  const handleRotatedGridColorChange = (param: keyof RotatedGridArtworkParams, value: string) => {
    setRotatedGridParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = encodeParams('rotated', newParams);
      setTokenInput(newToken);
      return { ...newParams, token: prev.token };
    });
  };

  const handleRotatedGridTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue, 'rotated')) {
      const newParams = generateRotatedGridParamsFromToken(trimmedValue);
      setRotatedGridParams(newParams);
    }
  };

  const handleTreeParamChange = (param: keyof TreeArtworkParams, value: number) => {
    setTreeParams((prev) => {
      const newParams = { ...prev, [param]: param === 'textEnabled' ? Boolean(value) : value };
      const newToken = encodeParams('tree', newParams);
      setTokenInput(newToken);
      return { ...newParams, token: prev.token };
    });
  };

  const handleTreeColorChange = (param: keyof TreeArtworkParams, value: string) => {
    setTreeParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = encodeParams('tree', newParams);
      setTokenInput(newToken);
      return { ...newParams, token: prev.token };
    });
  };

  const handleTreeTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue, 'tree')) {
      const newParams = generateTreeParamsFromToken(trimmedValue);
      setTreeParams(newParams);
    }
  };

  const handleTextDesignParamChange = (param: keyof TextDesignArtworkParams, value: any) => {
    setTextDesignParams((prev) => {
      const newParams = { ...prev, [param]: value };
      const newToken = encodeParams('text', newParams);
      setTokenInput(newToken);
      return { ...newParams, token: prev.token };
    });
  };

  const handleTextDesignTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue, 'text')) {
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
    const newToken = generateToken('mosaic');
    const newParams = generateMosaicParamsFromToken(newToken);
    setMosaicParams(newParams);
  };

  const handleRotatedGridRandomize = () => {
    const newParams = generateRandomRotatedGridParams();
    setRotatedGridParams(newParams);
  };

  const handleRotatedGridRegenerate = () => {
    const newToken = generateToken('rotated');
    const newParams = generateRotatedGridParamsFromToken(newToken);
    setRotatedGridParams(newParams);
  };

  const handleTreeRandomize = () => {
    setTreeParams(prev => ({
      ...generateRandomTreeParams(),
      canvasWidth: prev.canvasWidth,
      canvasHeight: prev.canvasHeight
    }));
  };

  const handleTreeRegenerate = () => {
    const newToken = generateToken('tree');
    const newParams = generateTreeParamsFromToken(newToken);
    // Preserve canvas dimensions if needed, or let generator handle it
    // The generator handles responsive sizing, but let's preserve current size for consistency with randomize
    setTreeParams(prev => ({
      ...newParams,
      canvasWidth: prev.canvasWidth,
      canvasHeight: prev.canvasHeight
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
