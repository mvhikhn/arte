"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

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
  targetWidth: number;
  targetHeight: number;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  exportWidth: number;
  exportHeight: number;
  isAnimating: boolean;
  seed: number; // Controls when to regenerate random points
}

export interface ArtworkRef {
  exportImage: () => void;
  exportGif: (duration: number, fps: number) => void;
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
      
      // WYSIWYG - Export exactly what's on the current canvas
      // Scale to export resolution
      const currentCanvas = sketchRef.current.canvas;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = params.exportWidth;
      exportCanvas.height = params.exportHeight;
      const ctx = exportCanvas.getContext('2d');
      
      if (ctx) {
        // Draw the current canvas scaled to export resolution
        ctx.drawImage(currentCanvas, 0, 0, params.exportWidth, params.exportHeight);
        
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
        // Use p5's saveGif with silent mode to suppress console logs
        await sketchRef.current.saveGif(`arte-${Date.now()}.gif`, duration, {
          units: 'seconds',
          silent: true
        });
      } catch (error) {
        console.error('GIF export error:', error);
      }
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
          const canvas = p.createCanvas(paramsRef.current.targetWidth, paramsRef.current.targetHeight);
          canvas.parent(containerRef.current!);
          p.rectMode(p.CENTER);
          p.clear();
          p.stroke(255);
          p.colorMode(p.RGB);
          
          // Set random seed for reproducible randomness
          p.randomSeed(paramsRef.current.seed);
          p.noiseSeed(paramsRef.current.seed);
          
          generatePoints();
          
          // Set initial animation state
          if (!paramsRef.current.isAnimating) {
            p.noLoop();
          }
        };

        p.draw = () => {
          p.background(255); // White background for trails
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
  }, [params.seed]); // Only recreate when seed changes (all other params accessed via paramsRef)

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
