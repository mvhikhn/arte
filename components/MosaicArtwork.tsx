"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export interface MosaicArtworkParams {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  initialRectMinSize: number;
  initialRectMaxSize: number;
  gridDivisionChance: number;
  recursionChance: number;
  minGridRows: number;
  maxGridRows: number;
  minGridCols: number;
  maxGridCols: number;
  splitRatioMin: number;
  splitRatioMax: number;
  marginMultiplier: number;
  detailGridMin: number;
  detailGridMax: number;
  noiseDensity: number;
  minRecursionSize: number;
  canvasWidth: number;
  canvasHeight: number;
  seed: number;
  exportWidth: number; // Deprecated
  exportHeight: number; // Deprecated
}

export interface MosaicArtworkRef {
  exportImage: () => void;
  exportWallpapers: () => void;
  regenerate: () => void;
}

interface MosaicArtworkProps {
  params: MosaicArtworkParams;
}

const MosaicArtwork = forwardRef<MosaicArtworkRef, MosaicArtworkProps>(({ params }, ref) => {
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
      exportCanvas.width = currentCanvas.width;
      exportCanvas.height = currentCanvas.height;
      const ctx = exportCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(currentCanvas, 0, 0);
        const link = document.createElement('a');
        link.download = `mosaic-arte-${Date.now()}.png`;
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
      link.download = `mosaic-desktop-wallpaper-${timestamp}.png`;
      link.href = desktopCanvas.toDataURL();
      link.click();

      // iPhone 17 Pro
      setTimeout(() => {
        const mobileCanvas = document.createElement('canvas');
        mobileCanvas.width = 1290;
        mobileCanvas.height = 2796;
        centerArtwork(mobileCanvas, 1290, 2796);
        const link = document.createElement('a');
        link.download = `mosaic-mobile-wallpaper-${timestamp}.png`;
        link.href = mobileCanvas.toDataURL();
        link.click();
      }, 100);
    },
    regenerate: () => {
      if (sketchRef.current) {
        sketchRef.current.redraw();
      }
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
    params.initialRectMinSize,
    params.initialRectMaxSize,
    params.gridDivisionChance,
    params.recursionChance,
    params.minGridRows,
    params.maxGridRows,
    params.minGridCols,
    params.maxGridCols,
    params.splitRatioMin,
    params.splitRatioMax,
    params.marginMultiplier,
    params.detailGridMin,
    params.detailGridMax,
    params.noiseDensity,
    params.minRecursionSize,
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
        let COLORS: string[] = [];
        let bgColor: string = '';

        p.setup = () => {
          const canvas = p.createCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight);
          canvas.parent(containerRef.current!);
          p.noStroke();
          p.noLoop();
        };

        p.draw = () => {
          generateArtwork(p);
        };

        const generateArtwork = (p: any) => {
          p.randomSeed(paramsRef.current.seed);
          p.noiseSeed(paramsRef.current.seed);

          COLORS = [
            paramsRef.current.color1,
            paramsRef.current.color2,
            paramsRef.current.color3,
            paramsRef.current.color4
          ];

          p.background(255);
          bgColor = '#ffffff';

          let rectWidth = p.random(
            paramsRef.current.initialRectMinSize,
            paramsRef.current.initialRectMaxSize
          ) * p.width;
          let rectHeight = p.random(
            paramsRef.current.initialRectMinSize,
            paramsRef.current.initialRectMaxSize
          ) * p.height;

          divideRectangle(
            p,
            p.width / 2 - rectWidth / 2,
            p.height / 2 - rectHeight / 2,
            rectWidth,
            rectHeight
          );

          // Add noise texture
          p.fill(255, 50);
          const noiseCount = p.width * p.height * paramsRef.current.noiseDensity;
          for (let i = 0; i < noiseCount; i++) {
            let x = p.random(p.width);
            let y = p.random(p.height);
            let diameter = p.noise(x * 0.01, y * 0.01) * 0.5 + 0.5;
            p.ellipse(x, y, diameter, diameter);
          }
        };

        const divideRectangle = (p: any, x: number, y: number, w: number, h: number) => {
          if (p.random() > paramsRef.current.gridDivisionChance) {
            let rows = p.int(p.random(paramsRef.current.minGridRows, paramsRef.current.maxGridRows + 1));
            let cols = p.int(p.random(paramsRef.current.minGridCols, paramsRef.current.maxGridCols + 1));
            let cellWidth = w / cols;
            let cellHeight = h / rows;

            for (let row = 0; row < rows; row++) {
              for (let col = 0; col < cols; col++) {
                let newX = x + col * cellWidth;
                let newY = y + row * cellHeight;
                createUnit(p, newX, newY, cellWidth, cellHeight);
              }
            }
          } else {
            if (w >= h) {
              let splitWidth = p.random(
                paramsRef.current.splitRatioMin,
                paramsRef.current.splitRatioMax
              ) * w;
              createUnit(p, x, y, splitWidth, h);
              createUnit(p, x + splitWidth, y, w - splitWidth, h);
            } else {
              let splitHeight = p.random(
                paramsRef.current.splitRatioMin,
                paramsRef.current.splitRatioMax
              ) * h;
              createUnit(p, x, y, w, splitHeight);
              createUnit(p, x, y + splitHeight, w, h - splitHeight);
            }
          }
        };

        const createUnit = (p: any, x: number, y: number, w: number, h: number) => {
          let margin = p.random(5, p.min(w, h) * paramsRef.current.marginMultiplier);

          if (p.random() > paramsRef.current.recursionChance &&
            p.min(w, h) > paramsRef.current.minRecursionSize) {
            divideRectangle(p, x, y, w, h);
          } else {
            drawRectangle(p, x + margin / 2, y + margin / 2, w - margin, h - margin);
          }
        };

        const drawRectangle = (p: any, x: number, y: number, w: number, h: number) => {
          let colors = pickColors(p, COLORS, 2);
          p.fill(colors[0]);
          p.rect(x, y, w, h);

          let cols = p.int(p.random(
            paramsRef.current.detailGridMin,
            paramsRef.current.detailGridMax + 1
          ));
          let rows = p.int(p.random(
            paramsRef.current.detailGridMin,
            paramsRef.current.detailGridMax + 1
          ));
          let cellW = w / cols;
          let cellH = h / rows;
          let margin = p.min(cellW, cellH) * 0.1;

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              let cellX = x + col * cellW + margin / 2;
              let cellY = y + row * cellH + margin / 2;
              let cellWAdj = cellW - margin;
              let cellHAdj = cellH - margin;
              drawDetail(p, cellX, cellY, cellWAdj, cellHAdj, colors[1]);
            }
          }
        };

        const drawDetail = (p: any, x: number, y: number, w: number, h: number, color: string) => {
          p.fill(color);
          p.rect(x, y, w, h);

          p.fill(255, 50);
          for (let i = 0; i < (w * h) / 50; i++) {
            let dx = x + p.random(w);
            let dy = y + p.random(h);
            p.ellipse(dx, dy, 1, 1);
          }
        };

        const pickColors = (p: any, palette: string[], num: number) => {
          let shuffled = [...palette].sort(() => p.random() - 0.5);
          return shuffled.slice(0, num);
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
  }, [params.seed, params.canvasWidth, params.canvasHeight]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    />
  );
});

MosaicArtwork.displayName = "MosaicArtwork";

export default MosaicArtwork;
