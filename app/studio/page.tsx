"use client";

import { useState, useRef, useEffect, useTransition, Suspense, MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ARTWORKS } from "@/config/artworks";
import { ExportPopup } from "@/components/ExportPopup";
import { PaymentModal } from "@/components/PaymentModal";
import { EmailVerificationModal } from "@/components/EmailVerificationModal";
import { ArrowLeft, SlidersHorizontal, RefreshCw, Shuffle, Download, Link2, Check } from "lucide-react";
import { hasGifAccess, grantGifAccess } from "@/lib/paymentUtils";
import { validateToken } from "@/utils/token";
import { encodeParams, encodeParamsSecure } from "@/utils/serialization";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function StudioContent() {
  const searchParams = useSearchParams();
  const artworkParam = searchParams.get('artwork');
  const validArtworks = Object.keys(ARTWORKS);

  // Robust initialization
  const initialArtwork = (artworkParam && validArtworks.includes(artworkParam))
    ? artworkParam
    : "flow";

  const [currentArtwork, setCurrentArtwork] = useState<string>(initialArtwork);
  const [controlsVisible, setControlsVisible] = useState(false);

  // Generic ref for the current artwork component
  const artworkRef = useRef<any>(null);

  const [exportStatus, setExportStatus] = useState({ isExporting: false, message: "" });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingGifExport, setPendingGifExport] = useState<{ duration: number; fps: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const isPreview = searchParams.get('preview') === 'true';

  // 3D card tilt state (restored from ee64344)
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [holoX, setHoloX] = useState(50);
  const [holoY, setHoloY] = useState(50);
  const cardRef = useRef<HTMLDivElement>(null);

  // Store params for all artworks to preserve state when switching
  const [artworkStates, setArtworkStates] = useState<Record<string, any>>(() => {
    const initialStates: Record<string, any> = {};
    validArtworks.forEach(key => {
      initialStates[key] = ARTWORKS[key].defaultParams;
    });
    return initialStates;
  });

  const currentParams = artworkStates[currentArtwork];
  const currentDef = ARTWORKS[currentArtwork];

  const [tokenInput, setTokenInput] = useState<string>("");
  const [secureLinkStatus, setSecureLinkStatus] = useState({ loading: false, copied: false });

  const handleGetSecureLink = async () => {
    setSecureLinkStatus({ loading: true, copied: false });
    try {
      const token = await encodeParamsSecure(currentArtwork, currentParams);
      await navigator.clipboard.writeText(token);
      setSecureLinkStatus({ loading: false, copied: true });
      setTimeout(() => {
        setSecureLinkStatus(prev => ({ ...prev, copied: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to generate secure link:", error);
      setSecureLinkStatus({ loading: false, copied: false });
      alert("Failed to generate secure link. Please try again.");
    }
  };

  // Initialize from URL token if provided
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken && validateToken(urlToken)) {
      try {
        const newParams = currentDef.generator(urlToken);
        setArtworkStates(prev => ({
          ...prev,
          [currentArtwork]: newParams
        }));
        setTokenInput(urlToken);
      } catch (error) {
        console.error('Failed to initialize from URL token:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save/Restore state logic (generic)
  const saveArtworkState = () => {
    const state = {
      currentArtwork,
      artworkStates,
      timestamp: Date.now(),
    };
    localStorage.setItem('artworkState', JSON.stringify(state));
  };

  const restoreArtworkState = () => {
    try {
      const saved = localStorage.getItem('artworkState');
      if (saved) {
        const state = JSON.parse(saved);
        if (Date.now() - state.timestamp < 30 * 60 * 1000) {
          setCurrentArtwork(state.currentArtwork);
          setArtworkStates(state.artworkStates);
          localStorage.removeItem('artworkState');
          return true;
        }
        localStorage.removeItem('artworkState');
      }
    } catch (error) {
      console.error('Failed to restore artwork state:', error);
      localStorage.removeItem('artworkState');
    }
    return false;
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Payment/Verification return logic
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isReturningFromPayment = urlParams.get('payment') === 'success';
    const isReturningFromVerification = urlParams.get('verified') === 'true';

    if (isReturningFromPayment || isReturningFromVerification) {
      const restored = restoreArtworkState();
      if (isReturningFromPayment) {
        grantGifAccess();
        setExportStatus({ isExporting: false, message: "Payment successful! GIF exports unlocked!" });
        setTimeout(() => setExportStatus({ isExporting: false, message: "" }), 3000);
      }
      if (isReturningFromVerification) {
        setExportStatus({ isExporting: false, message: restored ? "Welcome back! Your artwork has been restored." : "Email verified!" });
        setTimeout(() => setExportStatus({ isExporting: false, message: "" }), 3000);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }

    const handleShowEmailVerification = () => {
      saveArtworkState();
      setShowEmailVerification(true);
    };
    window.addEventListener('showEmailVerification', handleShowEmailVerification);
    return () => window.removeEventListener('showEmailVerification', handleShowEmailVerification);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generic Handlers
  const handleParamChange = (key: string | number | symbol, value: any) => {
    const paramKey = key as string;
    setArtworkStates(prev => {
      const newParams = { ...prev[currentArtwork], [paramKey]: value };
      const newToken = encodeParams(currentArtwork, newParams);
      setTokenInput(newToken);
      return { ...prev, [currentArtwork]: { ...newParams, token: prev[currentArtwork].token } };
    });
  };

  const handleColorChange = (key: string | number | symbol, value: string) => {
    handleParamChange(key, value);
  };

  const handleTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    setTokenInput(value);
    if (validateToken(trimmedValue, currentArtwork)) {
      const newParams = currentDef.generator(trimmedValue);
      setArtworkStates(prev => ({ ...prev, [currentArtwork]: newParams }));
    }
  };

  const handleRandomize = () => {
    if (currentDef.randomGenerator) {
      const newParams = currentDef.randomGenerator();
      setArtworkStates(prev => ({ ...prev, [currentArtwork]: newParams }));
      setTokenInput(encodeParams(currentArtwork, newParams));
    }
  };

  const handleRegenerate = () => {
    if (currentDef.regenerator) {
      const newParams = currentDef.regenerator(currentParams);
      setArtworkStates(prev => ({ ...prev, [currentArtwork]: newParams }));
      setTokenInput(encodeParams(currentArtwork, newParams));
    } else {
      handleRandomize();
    }
  };

  const handleToggleAnimation = () => {
    if (currentParams.hasOwnProperty('isAnimating')) {
      handleParamChange('isAnimating', !currentParams.isAnimating);
    }
  };

  const handleExportImage = () => {
    setExportStatus({ isExporting: true, message: "Exporting image..." });
    if (currentArtwork === "textdesign" && !hasGifAccess()) {
      saveArtworkState();
      setShowPaymentModal(true);
      return;
    }
    artworkRef.current?.exportImage();
    setTimeout(() => setExportStatus({ isExporting: false, message: "Image exported!" }), 500);
  };

  const handleExportGif = async (duration: number, fps: number) => {
    if (!hasGifAccess()) {
      saveArtworkState();
      setPendingGifExport({ duration, fps });
      setShowPaymentModal(true);
      return;
    }
    executeGifExport(duration, fps);
  };

  const executeGifExport = async (duration: number, fps: number) => {
    setExportStatus({ isExporting: true, message: `Recording ${duration}s GIF...` });
    artworkRef.current?.exportGif?.(duration, fps);
    setTimeout(() => setExportStatus({ isExporting: false, message: "GIF exported!" }), (duration + 1) * 1000);
  };

  const handleExportWallpapers = () => {
    if (!hasGifAccess()) {
      saveArtworkState();
      setShowPaymentModal(true);
      return;
    }
    setExportStatus({ isExporting: true, message: "Exporting wallpapers..." });
    artworkRef.current?.exportWallpapers?.();
    setTimeout(() => setExportStatus({ isExporting: false, message: "Wallpapers exported!" }), 1000);
  };

  // 3D Tilt Logic
  const handleTilt = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateY = ((clientX - centerX) / (rect.width / 2)) * 8;
    const rotateX = -((clientY - centerY) / (rect.height / 2)) * 8;
    const holoXPos = ((clientX - rect.left) / rect.width) * 100;
    const holoYPos = ((clientY - rect.top) / rect.height) * 100;

    setTiltX(rotateX);
    setTiltY(rotateY);
    setHoloX(holoXPos);
    setHoloY(holoYPos);
  };

  const handleCardMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;
    handleTilt(e.clientX, e.clientY);
  };

  const handleCardTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleTilt(touch.clientX, touch.clientY);
    }
  };

  const handleResetTilt = () => {
    setTiltX(0);
    setTiltY(0);
    setHoloX(50);
    setHoloY(50);
  };

  if (!isMounted) return null;

  const ArtworkComponent = currentDef.component;
  const ControlsComponent = currentDef.controls;

  // Calculate aspect ratio
  const aspectRatio = (currentParams.canvasWidth || 630) / (currentParams.canvasHeight || 790);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ExportPopup
        isExporting={exportStatus.isExporting}
        message={exportStatus.message}
        onClose={() => setExportStatus({ isExporting: false, message: "" })}
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => window.location.reload()}
      />
      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* Preview Mode - Only show artwork */}
      {isPreview ? (
        <div className="w-full h-full flex items-center justify-center">
          <ArtworkComponent ref={artworkRef} params={currentParams} />
        </div>
      ) : (
        <>
          {/* Home Button - Top Left */}
          <Link
            href="/"
            className="absolute top-6 left-6 group p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors z-30"
            title="Return Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Buttons - Top Right of Page (outside canvas) */}
          <div className="absolute top-6 right-16 flex gap-2 z-30 mr-12">
            {/* Regenerate Button */}
            {currentDef.regenerator && (
              <button
                onClick={handleRegenerate}
                className="group p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                aria-label="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Randomize Button */}
            <button
              onClick={handleRandomize}
              className="group p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              aria-label="Randomize"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Get Secure Link Button */}
            <button
              onClick={handleGetSecureLink}
              disabled={secureLinkStatus.loading}
              className={`group p-2 rounded-full transition-colors ${secureLinkStatus.copied
                ? "text-green-600 bg-green-50 hover:bg-green-100"
                : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              aria-label="Get Secure Link"
              title="Get Secure Link (Encrypted)"
            >
              {secureLinkStatus.loading ? (
                <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              ) : secureLinkStatus.copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
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
                <ControlsComponent
                  params={currentParams}
                  onParamChange={handleParamChange}
                  onColorChange={handleColorChange}
                  onExportImage={handleExportImage}
                  onExportGif={handleExportGif}
                  onExportWallpapers={handleExportWallpapers}
                  onToggleAnimation={handleToggleAnimation}
                  onRandomize={handleRandomize}
                  onRegenerate={currentDef.regenerator ? handleRegenerate : undefined}
                  tokenInput={tokenInput}
                  onTokenChange={handleTokenChange}
                />
              </div>
            </div>
          )}

          {/* Artwork Display */}
          <div className="flex-1 w-full flex items-center justify-center" style={{ perspective: '1500px' }}>
            <div className="relative flex items-center justify-center">
              {/* 3D Card with Premium Physics, Tight Frame, and Holographic Effect */}
              <div
                ref={cardRef}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleResetTilt}
                onTouchMove={handleCardTouchMove}
                onTouchEnd={handleResetTilt}
                className="relative rounded-lg overflow-hidden transition-transform duration-100 ease-out"
                style={{
                  transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(30px)`,
                  boxShadow: `
                                    0 2px 4px rgba(0, 0, 0, 0.08),
                                    0 4px 8px rgba(0, 0, 0, 0.08),
                                    0 8px 16px rgba(0, 0, 0, 0.08),
                                    0 16px 32px rgba(0, 0, 0, 0.1),
                                    0 32px 64px rgba(0, 0, 0, 0.12),
                                    ${-tiltY * 2}px ${tiltX * 2}px 40px rgba(0, 0, 0, 0.15),
                                    inset 0 0 0 1px rgba(255, 255, 255, 0.1)
                                `,
                  // Dynamic sizing logic
                  width: `min(85vw, 70vh * ${aspectRatio})`,
                  height: `min(70vh, 85vw / ${aspectRatio})`,
                  padding: '4px',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
                }}
              >
                {/* Inner card with tight border */}
                <div
                  className="relative overflow-hidden rounded-md w-full h-full"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Force canvas to scale to container */}
                  <div className="w-full h-full [&>canvas]:!w-full [&>canvas]:!h-full [&>canvas]:!object-contain">
                    <ArtworkComponent ref={artworkRef} params={currentParams} />
                  </div>

                  {/* Holographic Light Reflection Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                      background: `
                                            radial-gradient(
                                                ellipse 80% 50% at ${holoX}% ${holoY}%,
                                                rgba(255, 0, 128, 0.15) 0%,
                                                rgba(255, 128, 0, 0.12) 15%,
                                                rgba(255, 255, 0, 0.1) 30%,
                                                rgba(0, 255, 128, 0.08) 45%,
                                                rgba(0, 128, 255, 0.1) 60%,
                                                rgba(128, 0, 255, 0.12) 75%,
                                                rgba(255, 0, 128, 0.08) 90%,
                                                transparent 100%
                                            )
                                        `,
                      mixBlendMode: 'overlay',
                      opacity: Math.abs(tiltX) + Math.abs(tiltY) > 1 ? 1 : 0.3,
                    }}
                  />

                  {/* Shimmer/Glare Effect */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-200"
                    style={{
                      background: `
                                            linear-gradient(
                                                ${135 + (holoX - 50) * 0.5}deg,
                                                transparent 0%,
                                                transparent ${40 + (holoY - 50) * 0.3}%,
                                                rgba(255, 255, 255, 0.4) ${50 + (holoY - 50) * 0.3}%,
                                                transparent ${60 + (holoY - 50) * 0.3}%,
                                                transparent 100%
                                            )
                                        `,
                      opacity: Math.abs(tiltX) + Math.abs(tiltY) > 2 ? 0.6 : 0.2,
                    }}
                  />

                  {/* Iridescent Edge Highlight */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `
                                            conic-gradient(
                                                from ${(holoX + holoY) * 1.8}deg at ${holoX}% ${holoY}%,
                                                rgba(255, 0, 100, 0.05),
                                                rgba(255, 200, 0, 0.05),
                                                rgba(0, 255, 150, 0.05),
                                                rgba(0, 150, 255, 0.05),
                                                rgba(200, 0, 255, 0.05),
                                                rgba(255, 0, 100, 0.05)
                                            )
                                        `,
                      mixBlendMode: 'color-dodge',
                      opacity: Math.abs(tiltX) + Math.abs(tiltY) > 1 ? 0.8 : 0.3,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
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
