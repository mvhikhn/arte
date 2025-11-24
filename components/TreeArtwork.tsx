"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import p5 from "p5";

export interface TreeArtworkParams {
  // Tree Structure
  initialPaths: number;
  initialVelocity: number;
  branchProbability: number;
  diameterShrink: number;
  minDiameter: number;
  
  // Movement
  bumpMultiplier: number;
  velocityRetention: number;
  speedMin: number;
  speedMax: number;
  
  // Visual
  finishedCircleSize: number;
  strokeWeightMultiplier: number;
  
  // Colors - darker for stems, lighter for tips
  stemColor1: string;
  stemColor2: string;
  stemColor3: string;
  tipColor1: string;
  tipColor2: string;
  tipColor3: string;
  backgroundColor: string;
  
  // Technical
  seed: number;
  exportWidth: number;
  exportHeight: number;
  isAnimating: boolean;
}

export interface TreeArtworkRef {
  exportImage: () => void;
  exportGif: (duration: number, fps: number) => Promise<void>;
  toggleAnimation: () => void;
  regenerate: () => void;
}

interface TreeArtworkProps {
  params: TreeArtworkParams;
}

const TreeArtwork = forwardRef<TreeArtworkRef, TreeArtworkProps>(
  ({ params }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sketchRef = useRef<any>(null);
    const paramsRef = useRef(params);

    useEffect(() => {
      paramsRef.current = params;
    }, [params]);

    // Handle animation state changes
    useEffect(() => {
      if (sketchRef.current) {
        if (params.isAnimating) {
          sketchRef.current.loop();
        } else {
          sketchRef.current.noLoop();
        }
      }
    }, [params.isAnimating]);

    useImperativeHandle(ref, () => ({
      exportImage: () => {
        if (!sketchRef.current) return;
        const currentCanvas = sketchRef.current.canvas;
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = params.exportWidth;
        exportCanvas.height = params.exportHeight;
        const ctx = exportCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(currentCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
          exportCanvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `tree-arte-${Date.now()}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          });
        }
      },
      exportGif: async (duration: number, fps: number) => {
        if (!sketchRef.current) return;
        try {
          const filename = `tree-arte-${Date.now()}.gif`;
          await sketchRef.current.saveGif(filename, duration, {
            units: "seconds",
            silent: true,
            delay: Math.round(1000 / fps),
            download: filename,
          });
        } catch (error) {
          console.error("GIF export error:", error);
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
      regenerate: () => {
        if (sketchRef.current) {
          sketchRef.current.loop();
        }
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const sketch = (p: any) => {
        class Pathfinder {
          lastLocation: p5.Vector;
          location: p5.Vector;
          velocity: p5.Vector;
          diameter: number;
          isFinished: boolean;
          age: number;

          constructor(parent?: Pathfinder) {
            if (parent) {
              this.location = parent.location.copy();
              this.lastLocation = parent.lastLocation.copy();
              this.velocity = parent.velocity.copy();
              this.diameter = parent.diameter * paramsRef.current.diameterShrink;
              this.isFinished = parent.isFinished;
              this.age = parent.age;
              parent.diameter = this.diameter;
            } else {
              this.location = p.createVector(p.width / 2, p.height);
              this.lastLocation = p.createVector(this.location.x, this.location.y);
              this.velocity = p.createVector(0, -paramsRef.current.initialVelocity);
              this.diameter = p.random(10, 20);
              this.isFinished = false;
              this.age = 0;
            }
          }

          update() {
            if (
              this.location.x > -10 &&
              this.location.x < p.width + 10 &&
              this.location.y > -10 &&
              this.location.y < p.height + 10
            ) {
              this.lastLocation.set(this.location.x, this.location.y);
              if (this.diameter > paramsRef.current.minDiameter) {
                this.age++;
                const bump = p.createVector(p.random(-1, 1), p.random(-1, 1));
                this.velocity.normalize();
                bump.mult(paramsRef.current.bumpMultiplier);
                this.velocity.mult(paramsRef.current.velocityRetention);
                this.velocity.add(bump);
                this.velocity.mult(
                  p.random(paramsRef.current.speedMin, paramsRef.current.speedMax)
                );
                this.location.add(this.velocity);

                if (p.random(0, 1) < paramsRef.current.branchProbability) {
                  return new Pathfinder(this);
                }
              } else {
                if (!this.isFinished) {
                  this.isFinished = true;
                  p.noStroke();
                  // Use lighter tip colors
                  const tipColors = [
                    paramsRef.current.tipColor1,
                    paramsRef.current.tipColor2,
                    paramsRef.current.tipColor3,
                  ];
                  p.fill(p.color(p.random(tipColors)));
                  p.ellipse(
                    this.location.x,
                    this.location.y,
                    paramsRef.current.finishedCircleSize,
                    paramsRef.current.finishedCircleSize
                  );
                }
              }
            }
            return null;
          }

          draw() {
            const loc = this.location;
            const lastLoc = this.lastLocation;
            
            // Calculate color based on diameter - darker for thicker (stems), lighter for thinner
            const diameterRatio = this.diameter / 20; // Normalize
            
            let lineColor;
            if (diameterRatio > 0.5) {
              // Use stem colors for thicker branches
              const stemColors = [
                paramsRef.current.stemColor1,
                paramsRef.current.stemColor2,
                paramsRef.current.stemColor3,
              ];
              lineColor = p.color(p.random(stemColors));
            } else {
              // Blend between stem and tip colors for medium branches
              const allColors = [
                paramsRef.current.stemColor1,
                paramsRef.current.stemColor2,
                paramsRef.current.stemColor3,
                paramsRef.current.tipColor1,
                paramsRef.current.tipColor2,
              ];
              lineColor = p.color(p.random(allColors));
            }
            
            p.stroke(lineColor);
            p.strokeWeight(this.diameter * paramsRef.current.strokeWeightMultiplier);
            p.line(lastLoc.x, lastLoc.y, loc.x, loc.y);
          }
        }

        let paths: Pathfinder[] = [];

        p.setup = () => {
          p.pixelDensity(1);
          const canvas = p.createCanvas(800, 1000);
          canvas.parent(containerRef.current!);
          p.randomSeed(paramsRef.current.seed);
          p.noiseSeed(paramsRef.current.seed);
          
          resetSketch();
          
          if (!paramsRef.current.isAnimating) {
            p.noLoop();
          }
        };

        const resetSketch = () => {
          p.randomSeed(paramsRef.current.seed);
          p.background(paramsRef.current.backgroundColor);
          p.ellipseMode(p.CENTER);
          p.smooth();
          
          paths = [];
          for (let i = 0; i < paramsRef.current.initialPaths; i++) {
            paths.push(new Pathfinder());
          }
        };

        let lastSeed = paramsRef.current.seed;
        
        p.draw = () => {
          // Watch for seed changes to regenerate
          if (paramsRef.current.seed !== lastSeed) {
            lastSeed = paramsRef.current.seed;
            resetSketch();
            p.loop();
            return;
          }
          
          // Don't clear background - let tree build up
          for (let i = paths.length - 1; i >= 0; i--) {
            paths[i].draw();
            const newPath = paths[i].update();
            if (newPath) {
              paths.push(newPath);
            }
          }
          
          // Check if all paths are finished
          const allFinished = paths.every(path => path.isFinished || path.diameter <= paramsRef.current.minDiameter);
          if (allFinished && paths.length > 0) {
            p.noLoop();
          }
        };
      };

      const p5Instance = new p5(sketch);
      sketchRef.current = p5Instance;

      return () => {
        p5Instance.remove();
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center w-full h-full"
      />
    );
  }
);

TreeArtwork.displayName = "TreeArtwork";

export default TreeArtwork;
