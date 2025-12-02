"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { tokenToSeed } from "@/utils/token";

export interface ArtworkParams {
  numPoints: number;
  backgroundFade: number;
  scaleValue: number;
  noiseSpeed: number;
  movementDistance: number;
  gaussianMean: number;
  gaussianStd: number;
  minIterations: number;
  maxIterations: number;
  circleSize: number;
  strokeWeightMin: number;
  strokeWeightMax: number;
  angleMultiplier1: number;
  angleMultiplier2: number;
  canvasWidth: number;
  canvasHeight: number;
  targetWidth: number; // Deprecated, use canvasWidth
  targetHeight: number; // Deprecated, use canvasHeight
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  exportWidth: number; // Deprecated, WYSIWYG export uses canvas dimensions
  exportHeight: number; // Deprecated, WYSIWYG export uses canvas dimensions
  isAnimating: boolean;
  token: string; // Unique token for deterministic rendering
}

export interface ArtworkRef {
  exportImage: () => void;
  exportGif: (duration: number, fps: number) => void;
  exportWallpapers: () => void;
  toggleAnimation: () => void;
}

interface ArtworkProps {
  params: ArtworkParams;
}

const Artwork = forwardRef<ArtworkRef, ArtworkProps>(({ params }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const paramsRef = useRef(params);

  // Update params ref whenever params change
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (!sketchRef.current) return;

      // WYSIWYG - Export at current canvas resolution
      const currentCanvas = sketchRef.current.canvas;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = params.canvasWidth;
      exportCanvas.height = params.canvasHeight;
      const ctx = exportCanvas.getContext('2d');

      if (ctx) {
        // Draw the current canvas at its actual size (no scaling)
        ctx.drawImage(currentCanvas, 0, 0, exportCanvas.width, exportCanvas.height);

        // Trigger download
        exportCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `arte-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    },
    exportGif: async (duration: number, fps: number) => {
      if (!sketchRef.current) return;

      try {
        const filename = `arte-${Date.now()}.gif`;

        // Use p5's saveGif with proper options
        await sketchRef.current.saveGif(filename, duration, {
          units: 'seconds',
          silent: true,
          delay: Math.round(1000 / fps), // Set frame delay based on FPS
          download: filename // Explicitly set download filename
        });
      } catch (error) {
        console.error('GIF export error:', error);
      }
    },
    exportWallpapers: () => {
      if (!sketchRef.current) return;

      const currentCanvas = sketchRef.current.canvas;
      const timestamp = Date.now();

      // Helper function to center and fit artwork
      const centerArtwork = (canvas: HTMLCanvasElement, targetWidth: number, targetHeight: number) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Calculate scaling to fit artwork while maintaining aspect ratio
        const sourceAspect = currentCanvas.width / currentCanvas.height;
        const targetAspect = targetWidth / targetHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (sourceAspect > targetAspect) {
          // Source is wider - fit to width
          drawWidth = targetWidth;
          drawHeight = targetWidth / sourceAspect;
          offsetX = 0;
          offsetY = (targetHeight - drawHeight) / 2;
        } else {
          // Source is taller - fit to height
          drawHeight = targetHeight;
          drawWidth = targetHeight * sourceAspect;
          offsetX = (targetWidth - drawWidth) / 2;
          offsetY = 0;
        }

        // Draw artwork centered
        ctx.drawImage(currentCanvas, offsetX, offsetY, drawWidth, drawHeight);
      };

      // Desktop wallpaper - 6K (6144x3456)
      const desktopCanvas = document.createElement('canvas');
      desktopCanvas.width = 6144;
      desktopCanvas.height = 3456;
      centerArtwork(desktopCanvas, 6144, 3456);

      desktopCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `arte-desktop-wallpaper-${timestamp}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });

      // Mobile wallpaper - iPhone 17 Pro (1290x2796)
      setTimeout(() => {
        const mobileCanvas = document.createElement('canvas');
        mobileCanvas.width = 1290;
        mobileCanvas.height = 2796;
        centerArtwork(mobileCanvas, 1290, 2796);

        mobileCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `arte-mobile-wallpaper-${timestamp}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }, 100);
    },
    toggleAnimation: () => {
      if (sketchRef.current) {
        if (sketchRef.current.isLooping()) {
          sketchRef.current.noLoop();
        } else {
          sketchRef.current.loop();
        }
      }
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const initSketch = async () => {
      // Clean up any existing sketch
      if (sketchRef.current) {
        sketchRef.current.remove();
        sketchRef.current = null;
      }

      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      // Import p5
      const p5Module = await import("p5");
      const p5 = p5Module.default;

      if (cancelled || !containerRef.current) return;

      let points: any[] = [];
      let fallPalette: any[];

      const sketch = (p: any) => {
        p.setup = () => {
          const canvas = p.createCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight);
          canvas.parent(containerRef.current!);
          p.rectMode(p.CENTER);
          p.clear();
          p.stroke(255);
          p.colorMode(p.RGB);

          // Set random seed for reproducible randomness based on token
          const seed = tokenToSeed(paramsRef.current.token);
          p.randomSeed(seed);
          p.noiseSeed(seed);

          generatePoints();

          // Set initial animation state
          if (!paramsRef.current.isAnimating) {
            p.noLoop();
          }
        };

        p.draw = () => {
          p.background(0); // Black background for elegant look
          p.strokeWeight(1);
          for (let pt of points) {
            sweety(pt);
          }
        };

        const sweety = (pt: any) => {
          let { x, y, c, scl, rnd } = pt;

          // Generate color palette dynamically from current params
          const currentPalette = [
            p.color(paramsRef.current.color1),
            p.color(paramsRef.current.color2),
            p.color(paramsRef.current.color3),
            p.color(paramsRef.current.color4),
            p.color(paramsRef.current.color5),
          ];
          let col = p.random(currentPalette);
          p.stroke(col);
          p.noFill();
          p.beginShape();

          if (rnd === 0) {
            for (let i = 0; i < c; i++) {
              let n = p.noise(x * scl, y * scl, p.frameCount * paramsRef.current.noiseSpeed);
              let angle = p.int(n * paramsRef.current.angleMultiplier1) * (p.TAU / 4);
              p.vertex(x, y);
              x += p.cos(angle) * paramsRef.current.movementDistance;
              y += p.sin(angle) * paramsRef.current.movementDistance;
            }
          } else if (rnd === 1) {
            for (let i = 0; i < c; i++) {
              let n = p.noise(x * scl, y * scl, p.frameCount * paramsRef.current.noiseSpeed);
              let angle = paramsRef.current.angleMultiplier1 * n;
              p.vertex(x, y);
              x += p.cos(angle) * paramsRef.current.movementDistance;
              y += p.sin(angle) * paramsRef.current.movementDistance;
            }
          } else if (rnd === 2) {
            for (let i = 0; i < c; i++) {
              let n = p.noise(x * scl, y * scl, p.frameCount * paramsRef.current.noiseSpeed);
              let angle = p.int(n * paramsRef.current.angleMultiplier2) * (p.TAU / 4);
              p.strokeWeight(p.random(paramsRef.current.strokeWeightMin, paramsRef.current.strokeWeightMax));
              p.circle(x, y, p.random(paramsRef.current.circleSize));
              x += p.cos(angle) * paramsRef.current.movementDistance;
              y += p.sin(angle) * paramsRef.current.movementDistance;
            }
          } else if (rnd === 3) {
            for (let i = 0; i < c; i++) {
              let n = p.noise(x * scl, y * scl, p.frameCount * paramsRef.current.noiseSpeed);
              let angle = paramsRef.current.angleMultiplier2 * n;
              p.strokeWeight(p.random(paramsRef.current.strokeWeightMin, paramsRef.current.strokeWeightMax));
              p.circle(x, y, p.random(paramsRef.current.circleSize));
              x += p.cos(angle) * paramsRef.current.movementDistance;
              y += p.sin(angle) * paramsRef.current.movementDistance;
            }
          }
          p.endShape();
        };

        const generatePoints = () => {
          points = [];
          for (let i = 0; i < paramsRef.current.numPoints; i++) {
            let x = p.randomGaussian(paramsRef.current.gaussianMean, paramsRef.current.gaussianStd) * p.width;
            let y = p.randomGaussian(paramsRef.current.gaussianMean, paramsRef.current.gaussianStd) * p.height;
            points.push({
              x,
              y,
              c: p.int(p.random(paramsRef.current.minIterations, paramsRef.current.maxIterations)),
              scl: paramsRef.current.scaleValue,
              rnd: p.int(p.random(4)),
            });
          }
        };
      };

      if (!cancelled) {
        sketchRef.current = new p5(sketch);
      }
    };

    initSketch();

    return () => {
      cancelled = true;
      if (sketchRef.current) {
        sketchRef.current.remove();
        sketchRef.current = null;
      }
    };
  }, [params.token, params.canvasWidth, params.canvasHeight]); // Recreate when token or dimensions change

  // Control animation loop based on isAnimating parameter
  useEffect(() => {
    if (sketchRef.current) {
      if (params.isAnimating) {
        sketchRef.current.loop();
      } else {
        sketchRef.current.noLoop();
      }
    }
  }, [params.isAnimating]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    />
  );
});

Artwork.displayName = "Artwork";

export default Artwork;
