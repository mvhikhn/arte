"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

// Text layer configuration
interface TextLayer {
    text: string;
    x: number; // 0.0 to 1.0
    y: number; // 0.0 to 1.0
    size: number;
    alignment: 'left' | 'center' | 'right';
    fill: string;
    extrudeDepth: number;
    extrudeX: number;
    extrudeY: number;
    extrudeStart: string;
    extrudeEnd: string;
    highlight: string;
    showHighlight: boolean;
    outlineThickness: number;
    outlineColor: string;
}

export interface TextDesignArtworkParams {
    // Global settings
    backgroundColor: string;
    canvasWidth: number;
    canvasHeight: number;

    // Font
    fontUrl: string;
    customFontFamily: string;

    // Layers
    layer1: TextLayer;
    layer2: TextLayer;
    layer3: TextLayer;

    // Technical
    seed: number;
    exportWidth: number;
    exportHeight: number;
}

export interface TextDesignArtworkRef {
    exportImage: () => void;
    exportWallpapers: () => void;
}

interface TextDesignArtworkProps {
    params: TextDesignArtworkParams;
}

const TextDesignArtwork = forwardRef<TextDesignArtworkRef, TextDesignArtworkProps>(
    ({ params }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const sketchRef = useRef<any>(null);
        const paramsRef = useRef(params);
        const customFontRef = useRef<any>(null);

        useEffect(() => {
            paramsRef.current = params;
        }, [params]);

        // Handle custom font loading
        useEffect(() => {
            if (params.fontUrl && params.fontUrl.toLowerCase().endsWith('.ttf')) {
                // Load font via p5 if sketch is ready
                if (sketchRef.current && sketchRef.current.loadFont) {
                    sketchRef.current.loadFont(
                        params.fontUrl,
                        (font: any) => {
                            customFontRef.current = font;
                            console.log("Custom font loaded successfully");
                        },
                        (err: any) => {
                            console.error("Failed to load font:", err);
                        }
                    );
                }
            }
        }, [params.fontUrl]);

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
                            a.download = `text-design-arte-${Date.now()}.png`;
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

                    ctx.fillStyle = paramsRef.current.backgroundColor;
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

                // Desktop wallpaper
                const desktopCanvas = document.createElement('canvas');
                desktopCanvas.width = 2560;
                desktopCanvas.height = 1440;
                centerArtwork(desktopCanvas, 2560, 1440);
                desktopCanvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `text-design-desktop-wallpaper-${timestamp}.png`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                });

                // Mobile wallpaper
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
                            a.download = `text-design-mobile-wallpaper-${timestamp}.png`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }
                    });
                }, 100);
            },
        }));

        // Initialize p5 sketch
        useEffect(() => {
            if (!containerRef.current) return;

            let cancelled = false;

            // Clean up any existing p5 instance
            if (sketchRef.current) {
                sketchRef.current.remove();
                sketchRef.current = null;
            }

            containerRef.current.innerHTML = '';

            const loadSketch = async () => {
                const p5Module = await import("p5");
                const p5 = p5Module.default;

                if (cancelled || !containerRef.current) return;

                const sketch = (p: any) => {
                    const drawTextLayer = (layer: TextLayer) => {
                        if (!layer.text) return;

                        p.push();

                        // Font
                        if (customFontRef.current) {
                            p.textFont(customFontRef.current);
                        } else if (params.customFontFamily) {
                            p.textFont(params.customFontFamily);
                        } else {
                            p.textFont("Noto Sans Bengali");
                        }

                        p.textSize(layer.size);

                        // Alignment
                        let p5Align = p.CENTER;
                        if (layer.alignment === "left") p5Align = p.LEFT;
                        else if (layer.alignment === "right") p5Align = p.RIGHT;
                        p.textAlign(p5Align, p.CENTER);

                        const xCenter = p.width * layer.x;
                        const yCenter = p.height * layer.y;

                        // 1. Extrusion (3D depth effect)
                        const c1 = p.color(layer.extrudeEnd);
                        const c2 = p.color(layer.extrudeStart);
                        p.noStroke();
                        for (let i = layer.extrudeDepth; i > 0; i--) {
                            const t = i / layer.extrudeDepth;
                            p.fill(p.lerpColor(c1, c2, t));
                            p.text(
                                layer.text,
                                xCenter + Math.round(layer.extrudeX * i),
                                yCenter + Math.round(layer.extrudeY * i)
                            );
                        }

                        // 2. Outline (fake stroke for Bangla)
                        p.fill(layer.outlineColor);
                        const outline = layer.outlineThickness;
                        for (let ox = -outline; ox <= outline; ox++) {
                            for (let oy = -outline; oy <= outline; oy++) {
                                if (ox * ox + oy * oy <= outline * outline) {
                                    p.text(layer.text, xCenter + ox, yCenter + oy);
                                }
                            }
                        }

                        // 3. Main face
                        p.fill(layer.fill);
                        p.text(layer.text, xCenter, yCenter);

                        // 4. Highlight
                        if (layer.showHighlight) {
                            p.push();
                            p.blendMode(p.ADD);
                            p.fill(layer.highlight);
                            p.text(layer.text, xCenter - 2, yCenter - 2);
                            p.pop();
                        }

                        p.pop();
                    };

                    p.setup = () => {
                        p.pixelDensity(2); // For crisp text rendering
                        const canvas = p.createCanvas(
                            paramsRef.current.canvasWidth,
                            paramsRef.current.canvasHeight
                        );
                        canvas.parent(containerRef.current!);
                        p.smooth();
                    };

                    p.draw = () => {
                        p.background(paramsRef.current.backgroundColor);

                        // Draw all layers
                        drawTextLayer(paramsRef.current.layer1);
                        drawTextLayer(paramsRef.current.layer2);
                        drawTextLayer(paramsRef.current.layer3);

                        p.noLoop(); // Static artwork
                    };

                    // Expose functions for external control
                    (p as any).redraw = () => {
                        p.loop();
                        p.redraw();
                        p.noLoop();
                    };

                    (p as any).updateSize = (w: number, h: number) => {
                        p.resizeCanvas(w, h);
                        p.redraw();
                    };
                };

                if (!cancelled && containerRef.current) {
                    sketchRef.current = new p5(sketch);
                }
            };

            loadSketch().catch(console.error);

            return () => {
                cancelled = true;
                if (sketchRef.current) {
                    sketchRef.current.remove();
                    sketchRef.current = null;
                }
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // Trigger redraw when params change
        useEffect(() => {
            if (sketchRef.current && sketchRef.current.redraw) {
                // Update canvas size if changed
                if (
                    sketchRef.current.width !== params.canvasWidth ||
                    sketchRef.current.height !== params.canvasHeight
                ) {
                    sketchRef.current.updateSize(params.canvasWidth, params.canvasHeight);
                } else {
                    sketchRef.current.redraw();
                }
            }
        }, [params]);

        return (
            <div
                ref={containerRef}
                className="flex items-center justify-center w-full h-full"
            />
        );
    }
);

TextDesignArtwork.displayName = "TextDesignArtwork";

export default TextDesignArtwork;
