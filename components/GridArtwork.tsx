"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { tokenToSeed } from "@/utils/token";

export interface GridArtworkParams {
  backgroundColor: string;
  borderColor: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  animationSpeed: number;
  maxDepth: number;
  minModuleSize: number;
  subdivideChance: number;
  crossSize: number;
  minColumns: number;
  maxColumns: number;
  canvasWidth: number;
  canvasHeight: number;
  isAnimating: boolean;
  token: string;
  exportWidth: number; // Deprecated
  exportHeight: number; // Deprecated
}

export interface GridArtworkRef {
  exportImage: () => void;
  exportGif: (duration: number, fps: number) => void;
  exportWallpapers: () => void;
  toggleAnimation: () => void;
}

interface GridArtworkProps {
  params: GridArtworkParams;
}

const GridArtwork = forwardRef<GridArtworkRef, GridArtworkProps>(({ params }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<any>(null);
  const paramsRef = useRef(params);
  const gridRef = useRef<any>({ columns: 0, rows: 0, moduleSize: 0, seed: 0, depth: 0 });

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (!sketchRef.current) return;
      const currentCanvas = sketchRef.current.canvas;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = params.canvasWidth;
      exportCanvas.height = params.canvasHeight;
      const ctx = exportCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(currentCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
        const link = document.createElement('a');
        link.download = `grid-arte-${Date.now()}.png`;
        link.href = exportCanvas.toDataURL();
        link.click();
      }
    },
    exportWallpapers: () => {
      if (!sketchRef.current) return;
      const currentCanvas = sketchRef.current.canvas;
      const timestamp = Date.now();

      const centerArtwork = (canvas: HTMLCanvasElement, targetWidth: number, targetHeight: number) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        const sourceAspect = currentCanvas.width / currentCanvas.height;
        const targetAspect = targetWidth / targetHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (sourceAspect > targetAspect) {
          drawWidth = targetWidth;
          drawHeight = targetWidth / sourceAspect;
          offsetX = 0;
          offsetY = (targetHeight - drawHeight) / 2;
        } else {
          drawHeight = targetHeight;
          drawWidth = targetHeight * sourceAspect;
          offsetX = (targetWidth - drawWidth) / 2;
          offsetY = 0;
        }

        ctx.drawImage(currentCanvas, offsetX, offsetY, drawWidth, drawHeight);
      };

      // Desktop 6K
      const desktopCanvas = document.createElement('canvas');
      desktopCanvas.width = 6144;
      desktopCanvas.height = 3456;
      centerArtwork(desktopCanvas, 6144, 3456);
      const link = document.createElement('a');
      link.download = `grid-desktop-wallpaper-${timestamp}.png`;
      link.href = desktopCanvas.toDataURL();
      link.click();

      // iPhone 17 Pro
      setTimeout(() => {
        const mobileCanvas = document.createElement('canvas');
        mobileCanvas.width = 1290;
        mobileCanvas.height = 2796;
        centerArtwork(mobileCanvas, 1290, 2796);
        const link = document.createElement('a');
        link.download = `grid-mobile-wallpaper-${timestamp}.png`;
        link.href = mobileCanvas.toDataURL();
        link.click();
      }, 100);
    },
    exportGif: async (duration: number, fps: number) => {
      if (!sketchRef.current) return;
      try {
        const filename = `grid-arte-${Date.now()}.gif`;

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
    toggleAnimation: () => {
      if (sketchRef.current) {
        if (paramsRef.current.isAnimating) {
          sketchRef.current.loop();
        } else {
          sketchRef.current.noLoop();
        }
      }
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const initSketch = async () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
        sketchRef.current = null;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      const p5Module = await import("p5");
      const p5 = p5Module.default;

      if (cancelled || !containerRef.current) return;

      let grid = {
        columns: 0,
        rows: 0,
        moduleSize: 0,
        seed: 0,
        depth: 0
      };

      const sketch = (p: any) => {
        p.setup = () => {
          const canvas = p.createCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight);
          canvas.parent(containerRef.current!);
          p.strokeJoin(p.ROUND);
          p.frameRate(60);

          // Initialize grid
          // Set random seed for reproducible randomness based on token
          const seed = tokenToSeed(paramsRef.current.token);
          p.randomSeed(seed);
          p.noiseSeed(seed);
          grid.columns = p.floor(p.random(paramsRef.current.minColumns, paramsRef.current.maxColumns + 1));
          grid.moduleSize = p.width / grid.columns;
          grid.rows = p.ceil(p.height / grid.moduleSize);
          grid.seed = seed; // Update grid.seed to use the token-derived seed

          if (!paramsRef.current.isAnimating) {
            p.noLoop();
          }
        };

        p.draw = () => {
          p.background(255);
          p.stroke(paramsRef.current.borderColor);
          p.strokeWeight(2);
          const seed = tokenToSeed(paramsRef.current.token);
          p.randomSeed(seed);

          const movement = (p.sin(p.frameCount * paramsRef.current.animationSpeed) + 1) / 2;
          grid.depth = 0;
          drawGrid(p, 0, 0, grid.columns, grid.rows, p.width, movement);
        };

        const drawGrid = (p: any, x: number, y: number, cols: number, rows: number, size: number, movement: number) => {
          const cellSize = size / cols;
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const posX = x + col * cellSize;
              const posY = y + row * cellSize;
              drawCell(p, posX, posY, cellSize, movement);
            }
          }
        };

        const drawCell = (p: any, x: number, y: number, size: number, movement: number) => {
          const palette = [
            paramsRef.current.color1,
            paramsRef.current.color2,
            paramsRef.current.color3,
            paramsRef.current.color4
          ];
          const colorIndex = p.floor(p.random(palette.length));
          const selectedColor = palette[colorIndex];
          p.fill(selectedColor);
          p.rect(x, y, size, size);

          if (shouldSubdivide(p, size)) {
            grid.depth++;
            drawGrid(p, x, y, 2, 2, size, movement);
            grid.depth--;
            return;
          }

          p.fill(palette[(colorIndex + 1) % palette.length]);
          const shapeType = p.floor(p.random(4));
          drawShape(p, shapeType, x, y, size, movement);
        };

        const shouldSubdivide = (p: any, size: number) => {
          return p.random() < paramsRef.current.subdivideChance &&
            grid.depth < paramsRef.current.maxDepth &&
            size > paramsRef.current.minModuleSize;
        };

        const drawShape = (p: any, type: number, x: number, y: number, size: number, movement: number) => {
          const center = { x: x + size / 2, y: y + size / 2 };
          switch (type) {
            case 0:
              drawSpinningCross(p, center, size, movement);
              break;
            case 1:
              const maxRadius = size / 2 * 0.9;
              p.circle(center.x, center.y, maxRadius * 2 * movement);
              break;
            case 2:
              drawCrown(p, x, y, size, movement);
              break;
            case 3:
              drawDiamond(p, x, y, size, movement);
              break;
          }
        };

        const drawSpinningCross = (p: any, center: { x: number, y: number }, size: number, phase: number) => {
          const rotation = phase * p.TWO_PI;
          const armLength = size * paramsRef.current.crossSize / 2;
          const padding = size * 0.1;
          p.push();
          p.translate(center.x, center.y);
          p.rotate(rotation);
          const safeLength = p.min(armLength, (size / 2 - padding));
          p.rectMode(p.CENTER);
          p.rect(0, 0, safeLength * 2, safeLength * 0.2);
          p.rect(0, 0, safeLength * 0.2, safeLength * 2);
          p.pop();
        };

        const drawCrown = (p: any, x: number, y: number, size: number, height: number) => {
          const points = 5;
          const spacing = size / (points - 1);
          const peakHeight = size * height * 0.4;
          p.beginShape();
          for (let i = 0; i < points; i++) {
            p.vertex(x + i * spacing, y + (i % 2 ? peakHeight : 0));
          }
          for (let i = points - 1; i >= 0; i--) {
            p.vertex(x + i * spacing, y + size - (i % 2 ? peakHeight : 0));
          }
          p.endShape(p.CLOSE);
        };

        const drawDiamond = (p: any, x: number, y: number, size: number, scale: number) => {
          const center = size / 2;
          const maxOffset = center * 0.9;
          const offset = maxOffset * scale;
          p.beginShape();
          p.vertex(x + center, y + offset);
          p.vertex(x + size - offset, y + center);
          p.vertex(x + center, y + size - offset);
          p.vertex(x + offset, y + center);
          p.endShape(p.CLOSE);
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
  }, [params.token, params.canvasWidth, params.canvasHeight]);

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

GridArtwork.displayName = "GridArtwork";

export default GridArtwork;
