"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { tokenToSeed } from "@/utils/token";

export interface RotatedGridArtworkParams {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  backgroundColor: string;
  offsetRatio: number;
  marginRatio: number;
  minCellCount: number;
  maxCellCount: number;
  minRecursionSize: number;
  strokeWeight: number;
  canvasWidth: number;
  canvasHeight: number;
  token: string;
  colorSeed?: string;
  exportWidth: number; // Deprecated
  exportHeight: number; // Deprecated
}

export interface RotatedGridArtworkRef {
  exportImage: () => void;
  exportWallpapers: () => void;
  regenerate: () => void;
  exportHighRes: (scale?: number) => void;
}

interface RotatedGridArtworkProps {
  params: RotatedGridArtworkParams;
}

const RotatedGridArtwork = forwardRef<RotatedGridArtworkRef, RotatedGridArtworkProps>(({ params }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<any>(null);
  const paramsRef = useRef(params);

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
        link.download = `rotated-grid-arte-${Date.now()}.png`;
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
      link.download = `rotated-desktop-wallpaper-${timestamp}.png`;
      link.href = desktopCanvas.toDataURL();
      link.click();

      // iPhone 17 Pro
      setTimeout(() => {
        const mobileCanvas = document.createElement('canvas');
        mobileCanvas.width = 1290;
        mobileCanvas.height = 2796;
        centerArtwork(mobileCanvas, 1290, 2796);
        const link = document.createElement('a');
        link.download = `rotated-mobile-wallpaper-${timestamp}.png`;
        link.href = mobileCanvas.toDataURL();
        link.click();
      }, 100);
    },
    regenerate: () => {
      if (sketchRef.current) {
        sketchRef.current.redraw();
      }
    },
    exportHighRes: (scale: number = 4) => {
      if (!sketchRef.current) return;

      const currentDensity = sketchRef.current.pixelDensity();
      const p = sketchRef.current;

      p.pixelDensity(scale);
      p.resizeCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight);
      p.redraw();

      setTimeout(() => {
        p.saveCanvas(`rotated-grid-${Date.now()}-${scale}x`, 'png');

        p.pixelDensity(currentDensity);
        p.resizeCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight);
        p.redraw();
      }, 100);
    },
  }));

  // Trigger redraw when params change (except seed which recreates)
  useEffect(() => {
    if (sketchRef.current && sketchRef.current.redraw) {
      sketchRef.current.redraw();
    }
  }, [
    params.color1,
    params.color2,
    params.color3,
    params.color4,
    params.backgroundColor,
    params.offsetRatio,
    params.marginRatio,
    params.minCellCount,
    params.maxCellCount,
    params.minRecursionSize,
    params.strokeWeight,
  ]);

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

      const sketch = (p: any) => {
        p.setup = () => {
          const canvas = p.createCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight);
          canvas.parent(containerRef.current!);
          p.colorMode(p.RGB);
          p.angleMode(p.DEGREES);
          p.noSmooth();
          p.noLoop();
        };

        p.draw = () => {
          generateArtwork(p);
        };

        const generateArtwork = (p: any) => {
          const seed = tokenToSeed(paramsRef.current.token);
          p.randomSeed(seed);

          p.background(255);
          const offset = p.width * paramsRef.current.offsetRatio;
          const margin = offset * paramsRef.current.marginRatio;
          const cellCount = p.int(p.random(paramsRef.current.minCellCount, paramsRef.current.maxCellCount + 1));

          drawGrid(
            p,
            offset,
            offset,
            p.width - offset * 2,
            p.height - offset * 2,
            cellCount,
            margin
          );
        };

        const drawGrid = (p: any, x: number, y: number, w: number, h: number, cellCount: number, margin: number) => {
          let cellWidth, cellHeight;
          const rotation = p.int(p.random(4)) * 90;

          if (rotation % 180 === 0) {
            cellWidth = w;
            cellHeight = h;
          } else {
            cellWidth = h;
            cellHeight = w;
          }

          p.push();
          p.translate(x + w / 2, y + h / 2);
          p.rotate(rotation);
          p.translate(-cellWidth / 2, -cellHeight / 2);

          const cellW = (cellWidth - margin * (cellCount - 1)) / cellCount;
          const cellH = (cellHeight - margin * (cellCount - 1)) / cellCount;

          for (let j = 0; j < cellCount; j++) {
            for (let i = 0; i < cellCount; i++) {
              const cx = i * (cellW + margin);
              const cy = j * (cellH + margin);
              if (p.min(cellW, cellH) > p.width * paramsRef.current.minRecursionSize) {
                drawGrid(p, cx, cy, cellW, cellH, p.int(p.random(paramsRef.current.minCellCount, paramsRef.current.maxCellCount + 1)), margin / 2);
              } else {
                drawCell(p, cx, cy, cellW, cellH);
              }
            }
          }

          p.pop();
        };

        const drawCell = (p: any, x: number, y: number, w: number, h: number) => {
          const palette = [
            paramsRef.current.color1,
            paramsRef.current.color2,
            paramsRef.current.color3,
            paramsRef.current.color4,
          ];
          p.fill(p.random(palette));
          p.stroke(p.random(palette));
          p.strokeWeight(paramsRef.current.strokeWeight);
          p.rect(x, y, w, h);
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

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    />
  );
});

RotatedGridArtwork.displayName = "RotatedGridArtwork";

export default RotatedGridArtwork;
