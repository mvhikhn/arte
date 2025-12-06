"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { tokenToSeed } from "@/utils/token";

export interface LambArtworkParams {
    // Grid
    cols: number;
    rows: number;

    // Layout
    wOff: number;
    hOff: number;

    // Physics/Noise
    noiseScale: number;
    lifeStep: number;
    weiRangeMax: number;

    // Animation
    totalFrame: number;

    // Canvas
    canvasWidth: number;
    canvasHeight: number;

    // System
    token: string;
    isAnimating: boolean;
}

export interface LambArtworkRef {
    exportImage: () => void;
    exportHighRes: (scale?: number) => void;
    toggleAnimation: () => void;
    regenerate: () => void;
}

interface LambArtworkProps {
    params: LambArtworkParams;
}

const LambArtwork = forwardRef<LambArtworkRef, LambArtworkProps>(
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

        // Handle regeneration
        useEffect(() => {
            if (sketchRef.current && sketchRef.current.resetSketch) {
                sketchRef.current.resetSketch();
            }
        }, [
            params.token,
            params.cols,
            params.rows,
            params.noiseScale,
            params.weiRangeMax,
            params.canvasWidth,
            params.canvasHeight
        ]);

        useImperativeHandle(ref, () => ({
            exportImage: () => {
                if (!sketchRef.current) return;
                const currentCanvas = sketchRef.current.canvas;
                const link = document.createElement('a');
                link.download = `lamb-${Date.now()}.png`;
                link.href = currentCanvas.toDataURL();
                link.click();
            },
            exportHighRes: (scale: number = 4) => {
                if (!sketchRef.current) return;
                const p = sketchRef.current;
                const currentDensity = p.pixelDensity();
                const wasAnimating = paramsRef.current.isAnimating;

                paramsRef.current.isAnimating = true;
                p.pixelDensity(scale);

                if (p.resetSketch) {
                    p.resetSketch();
                    // Fast forward animation
                    let iterations = 0;
                    while (p.frameCount < paramsRef.current.totalFrame && iterations < 5000) {
                        p.draw();
                        iterations++;
                    }
                }

                p.saveCanvas(`lamb-${Date.now()}-${scale}x`, 'png');

                p.pixelDensity(currentDensity);
                paramsRef.current.isAnimating = wasAnimating;
                if (p.resetSketch) p.resetSketch();
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
                if (sketchRef.current && sketchRef.current.resetSketch) {
                    sketchRef.current.resetSketch();
                }
            }
        }));

        useEffect(() => {
            if (!containerRef.current) return;
            let cancelled = false;

            if (sketchRef.current) {
                sketchRef.current.remove();
                sketchRef.current = null;
            }

            const loadSketch = async () => {
                const p5Module = await import("p5");
                const p5 = p5Module.default;

                if (cancelled || !containerRef.current) return;

                const sketch = (p: any) => {
                    const colors = ["#F00", "#FF0", "#0F0", "#0FF", "#00F", "#000", "#FFF"];
                    let bgColor: any, bloodColor: any;

                    let xoff: number, yoff: number;
                    let nodes: any[][] = [];
                    let maxSide: number;
                    let weiCtrl: number;

                    class Node {
                        x: number;
                        y: number;
                        mx: number;
                        my: number;
                        life: number;

                        constructor(x: number, y: number) {
                            this.x = x;
                            this.y = y;
                            this.mx = x;
                            this.my = y;
                            this.life = p.random(3);
                        }

                        reset() {
                            this.x = this.mx;
                            this.y = this.my;
                            this.life = p.random(3);
                        }
                    }

                    p.setup = () => {
                        const canvas = p.createCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight);
                        canvas.parent(containerRef.current!);

                        resetSketch();
                    };

                    const resetSketch = () => {
                        const seed = tokenToSeed(paramsRef.current.token);
                        p.randomSeed(seed);
                        p.noiseSeed(seed);
                        p.frameCount = 0;

                        const tone = [p.random(225, 255), p.random(225, 255), p.random(225, 255)];
                        bgColor = p.color(...tone);
                        p.background(bgColor);
                        bloodColor = p.color(p.random(colors));
                        p.noFill();

                        maxSide = p.max(p.width, p.height);

                        // Use params instead of random generation where possible, or use params as base
                        const cols = paramsRef.current.cols;
                        const rows = paramsRef.current.rows;

                        xoff = (p.width - paramsRef.current.wOff) / cols;
                        yoff = (p.height - paramsRef.current.hOff) / rows;

                        nodes = Array.from({ length: rows }, () => Array.from({ length: cols }));

                        for (let col = 0; col < cols; col++) {
                            for (let row = 0; row < rows; row++)
                                nodes[row][col] = new Node(col * xoff, row * yoff);
                        }

                        if (!paramsRef.current.isAnimating) {
                            p.noLoop();
                        } else {
                            p.loop();
                        }
                    };

                    p.draw = () => {
                        const t = p.frameCount / paramsRef.current.totalFrame;
                        const noiseScale = paramsRef.current.noiseScale;

                        weiCtrl = p.lerp(p.noise(t, t) * p.width, p.width / 2, t);

                        p.push();
                        p.translate((paramsRef.current.wOff + xoff) / 2, (paramsRef.current.hOff + yoff) / 2);

                        let dotColor = p.lerpColor(p.color(0), bloodColor, 0.5 - 0.5 * p.cos(2 * t));
                        dotColor.setAlpha(50);
                        p.stroke(dotColor);

                        nodeUpdate(static_dots);
                        nodeUpdate(motion_dots);
                        p.pop();

                        p.push();
                        p.stroke(bgColor);
                        p.strokeWeight(25);
                        p.noFill();
                        p.rect(0, 0, p.width, p.height);
                        p.pop();

                        if (p.frameCount >= paramsRef.current.totalFrame) p.noLoop();
                    };

                    function nodeUpdate(display: Function) {
                        let nz = p.frameCount * paramsRef.current.noiseScale;
                        const cols = paramsRef.current.cols;
                        const rows = paramsRef.current.rows;
                        const weiRangeMax = paramsRef.current.weiRangeMax;

                        for (let col = 0; col < cols; col++) {
                            for (let row = 0; row < rows; row++) {
                                const node = nodes[row][col];
                                const nx = node.x * paramsRef.current.noiseScale;
                                const ny = node.y * paramsRef.current.noiseScale;

                                const dx = p.noise(nx + 300, ny + 500, nx + ny + nz) * 2 - 1;
                                const dy = p.noise(nx + 100, ny + 300, nx + ny + nz) * 2 - 1;

                                // Deterministic random range based on position to avoid flickering if re-rendering
                                const range = p.floor(p.random(1, p.random(2, weiRangeMax)));

                                const wei = p.map(weiCtrl, 0, maxSide, -range, range) * (1 - (p.frameCount / paramsRef.current.totalFrame));
                                display(node, dx, dy * (1 - p.abs(wei) / range) * 20, wei);
                            }
                        }
                    }

                    function static_dots(node: Node, dx: number, dy: number, wei: number) {
                        const t = p.frameCount / paramsRef.current.totalFrame;
                        node.mx = node.x + dx * wei * 100 * p.sin(t);
                        node.my = node.y + dy * wei * 210 * p.sin(t);
                        p.point(node.mx, node.my);
                    }

                    function motion_dots(node: Node, dx: number, dy: number, wei: number) {
                        node.x = node.x + dx * wei;
                        node.y = node.y + dy * wei;
                        node.life -= paramsRef.current.lifeStep;
                        if (node.life < 0) node.reset();
                        p.point(node.x, node.y);
                    }

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

LambArtwork.displayName = "LambArtwork";

export default LambArtwork;
