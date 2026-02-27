"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { tokenToSeed } from "@/utils/token";

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
  backgroundImage?: string;
  backgroundScale?: 'cover' | 'contain';

  // Text/Poem
  textContent: string;
  textEnabled: boolean;
  fontSize: number;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  textX: number;
  textY: number;
  lineHeight: number;
  fontFamily: string;
  fontUrl: string;
  customFontFamily: string;
  grainAmount: number;

  // Canvas
  canvasWidth: number;
  canvasHeight: number;

  // Technical
  token: string;
  exportWidth: number; // Deprecated
  exportHeight: number; // Deprecated
  colorSeed?: string;
  isAnimating: boolean;
}

export interface TreeArtworkRef {
  exportImage: () => void;
  exportGif: (duration: number, fps: number) => Promise<void>;
  exportWallpapers: () => void;
  toggleAnimation: () => void;
  regenerate: () => void;
  exportHighRes: (scale?: number) => void;
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

    // Handle custom font loading
    useEffect(() => {
      if (params.fontUrl) {
        const link = document.createElement('link');
        link.href = params.fontUrl;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => {
          document.head.removeChild(link);
        };
      }
    }, [params.fontUrl]);

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

    // Handle token changes to regenerate tree
    useEffect(() => {
      if (sketchRef.current && sketchRef.current.resetSketch) {
        sketchRef.current.resetSketch();
        // Always restart the loop when regenerating, regardless of isAnimating state
        // The isAnimating useEffect will handle stopping it if needed
        sketchRef.current.loop();
      }
    }, [params.token]);

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
        desktopCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tree-desktop-wallpaper-${timestamp}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });

        // iPhone 17 Pro
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
              a.download = `tree-mobile-wallpaper-${timestamp}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          });
        }, 100);
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
      exportHighRes: (scale: number = 4) => {
        if (!sketchRef.current) return;
        const currentCanvas = sketchRef.current.canvas;
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = currentCanvas.width * scale;
        exportCanvas.height = currentCanvas.height * scale;
        const ctx = exportCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(currentCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
          exportCanvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `tree-arte-highres-${Date.now()}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          });
        }
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      let cancelled = false;

      // Clean up any existing p5 instance FIRST
      if (sketchRef.current) {
        sketchRef.current.remove();
        sketchRef.current = null;
      }

      // Then clear any remaining content in the container
      containerRef.current.innerHTML = '';

      // Dynamically import p5
      const loadSketch = async () => {
        const p5Module = await import("p5");
        const p5 = p5Module.default;

        // Check if component was unmounted during async load
        if (cancelled || !containerRef.current) return;

        const sketch = (p: any) => {
          class Pathfinder {
            lastLocation: any;
            location: any;
            velocity: any;
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
            const seed = tokenToSeed(paramsRef.current.token);
            const canvas = p.createCanvas(800, 1000);
            canvas.parent(containerRef.current!);
            p.randomSeed(seed);
            p.noiseSeed(seed);

            resetSketch();

            if (!paramsRef.current.isAnimating) {
              p.noLoop();
            }
          };

          const resetSketch = () => {
            const seed = tokenToSeed(paramsRef.current.token);
            p.randomSeed(seed);
            p.background(paramsRef.current.backgroundColor);
            p.ellipseMode(p.CENTER);
            p.smooth();

            paths = [];
            for (let i = 0; i < paramsRef.current.initialPaths; i++) {
              paths.push(new Pathfinder());
            }

            grainApplied = false; // Reset grain flag
          };

          let grainApplied = false;

          p.draw = () => {
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
              // Apply effects only once when tree is finished
              if (!grainApplied) {
                // Apply paper grain effect if enabled
                if (paramsRef.current.grainAmount > 0) {
                  applyGrain();
                }

                // Render text overlay if enabled
                if (paramsRef.current.textEnabled && paramsRef.current.textContent) {
                  renderText();
                }

                grainApplied = true;
              }
              p.noLoop();
            }
          };

          const renderText = () => {
            p.push();
            p.fill(paramsRef.current.textColor);
            p.textFont(params.customFontFamily || params.fontFamily);
            p.textSize(paramsRef.current.fontSize);
            p.textAlign(
              paramsRef.current.textAlign === 'left' ? p.LEFT :
                paramsRef.current.textAlign === 'right' ? p.RIGHT :
                  p.CENTER
            );

            // Calculate max width for text wrapping based on alignment and margins
            const margin = 40; // Margin from canvas edges
            let maxWidth;
            let textX = paramsRef.current.textX;

            if (paramsRef.current.textAlign === 'left') {
              maxWidth = p.width - textX - margin;
            } else if (paramsRef.current.textAlign === 'right') {
              maxWidth = textX - margin;
            } else { // center
              // Use distance to nearest edge, doubled
              const distToLeft = textX;
              const distToRight = p.width - textX;
              maxWidth = Math.min(distToLeft, distToRight) * 2 - (margin * 2);
            }

            // Ensure maxWidth is reasonable
            maxWidth = Math.max(100, Math.min(maxWidth, p.width - (margin * 2)));

            const startY = paramsRef.current.textY;
            const lineHeightPx = paramsRef.current.fontSize * paramsRef.current.lineHeight;

            // Split by user line breaks first
            const userLines = paramsRef.current.textContent.split('\n');
            const wrappedLines: string[] = [];

            // Wrap each user line if needed
            userLines.forEach(line => {
              if (line.trim() === '') {
                wrappedLines.push(''); // Preserve empty lines
                return;
              }

              const words = line.split(' ');
              let currentLine = '';

              words.forEach((word, idx) => {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const testWidth = p.textWidth(testLine);

                if (testWidth > maxWidth && currentLine !== '') {
                  wrappedLines.push(currentLine);
                  currentLine = word;
                } else {
                  currentLine = testLine;
                }

                // Push last word of line
                if (idx === words.length - 1) {
                  wrappedLines.push(currentLine);
                }
              });
            });

            // Render all wrapped lines
            wrappedLines.forEach((line, index) => {
              p.text(line, textX, startY + (index * lineHeightPx));
            });

            p.pop();
          };

          const applyGrain = () => {
            p.loadPixels();
            for (let i = 0; i < p.pixels.length; i += 4) {
              const noise = p.random(-15, 15);
              p.pixels[i] += noise;     // R
              p.pixels[i + 1] += noise; // G
              p.pixels[i + 2] += noise; // B
            }
            p.updatePixels();
          };

          // Expose resetSketch for external access
          p.resetSketch = resetSketch;
        };

        const p5Instance = new p5(sketch);
        sketchRef.current = p5Instance;
      };

      loadSketch().catch(console.error);

      return () => {
        cancelled = true;
        if (sketchRef.current) {
          sketchRef.current.remove();
          sketchRef.current = null;
        }
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
