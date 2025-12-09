"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { tokenToSeed, createSeededRandom } from "@/utils/token";

const vertShader = `
precision highp float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

varying vec3 var_vertPos;
varying vec3 var_vertNormal;
varying vec2 var_vertTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

void main() {
  vec3 pos = aPosition;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);

  var_vertPos = pos;
  var_vertNormal = aNormal;
  var_vertTexCoord = aTexCoord;
}
`;

// Fragment shader: Flat shading + Grain + Texture
const createFragShader = (grainIntensity: number) => `
precision highp float;

uniform vec2 u_resolution;
uniform vec3 u_lightDir; // Direction of main light
uniform sampler2D u_tex; // The facade texture

varying vec3 var_vertNormal;
varying vec2 var_vertTexCoord;

// Simple pseudo-random
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  
  // 1. Calculate Lighting
  vec3 normal = normalize(var_vertNormal);
  vec3 light = normalize(u_lightDir);
  
  // Standard diffuse
  float dot_val = max(dot(normal, light), 0.0);
  
  // Boost light slightly for flat look clarity
  float lightIntensity = 0.5 + 0.5 * dot_val;
  
  vec4 texColor = texture2D(u_tex, var_vertTexCoord);
  
  // Lighting
  vec3 col = texColor.rgb * (0.6 + 0.4 * dot_val);

  // 2. Grain
  if (${grainIntensity.toFixed(4)} > 0.001) {
      float noiseVal = random(st * 999.0);
      float grainAmount = ${grainIntensity.toFixed(4)};
      col -= (noiseVal * grainAmount);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

// -----------------------------------------------------

export interface IsoCubeArtworkParams {
    backgroundColor: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    gridSize: number;
    density: number;
    fillRatio: number;
    cubeWidthMin: number;
    cubeWidthMax: number;
    cubeHeightMin: number;
    cubeHeightMax: number;
    skyscraperChance: number;
    towerChance: number;
    windowDensity: number;
    windowType: string;
    grainIntensity: number;
    roofDetailChance: number;
    rotateX: number;
    rotateY: number;
    canvasWidth: number;
    canvasHeight: number;
    token: string;
    colorSeed?: string;
    exportWidth: number;
    exportHeight: number;
}

export interface IsoCubeArtworkRef {
    exportImage: () => void;
    exportWallpapers: () => void;
    regenerate: () => void;
    exportHighRes: (scale?: number) => void;
}

interface IsoCubeArtworkProps {
    params: IsoCubeArtworkParams;
}

const IsoCubeArtwork = forwardRef<IsoCubeArtworkRef, IsoCubeArtworkProps>(({ params }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sketchRef = useRef<any>(null);
    const paramsRef = useRef(params);

    useEffect(() => {
        paramsRef.current = params;
    }, [params]);

    useImperativeHandle(ref, () => ({
        exportImage: () => {
            if (!sketchRef.current) return;
            sketchRef.current.saveCanvas(`isocube-arte-${Date.now()}`, 'png');
        },
        exportWallpapers: () => {
            if (!sketchRef.current) return;
            const p = sketchRef.current;
            const timestamp = Date.now();
            const currentCanvas = p.canvas as HTMLCanvasElement;
            const centerArtwork = (targetWidth: number, targetHeight: number) => {
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = targetWidth; exportCanvas.height = targetHeight;
                const ctx = exportCanvas.getContext('2d');
                if (!ctx) return null;
                ctx.fillStyle = paramsRef.current.backgroundColor;
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                const sourceAspect = currentCanvas.width / currentCanvas.height;
                const targetAspect = targetWidth / targetHeight;
                let drawWidth, drawHeight, offsetX, offsetY;
                if (sourceAspect > targetAspect) {
                    drawWidth = targetWidth; drawHeight = targetWidth / sourceAspect;
                    offsetX = 0; offsetY = (targetHeight - drawHeight) / 2;
                } else {
                    drawHeight = targetHeight; drawWidth = targetHeight * sourceAspect;
                    offsetX = (targetWidth - drawWidth) / 2; offsetY = 0;
                }
                ctx.drawImage(currentCanvas, offsetX, offsetY, drawWidth, drawHeight);
                return exportCanvas;
            };
            const desktopCanvas = centerArtwork(6144, 3456);
            if (desktopCanvas) {
                const link = document.createElement('a');
                link.download = `isocube-desktop-wallpaper-${timestamp}.png`;
                link.href = desktopCanvas.toDataURL();
                link.click();
            }
            setTimeout(() => {
                const mobileCanvas = centerArtwork(1290, 2796);
                if (mobileCanvas) {
                    const link = document.createElement('a');
                    link.download = `isocube-mobile-wallpaper-${timestamp}.png`;
                    link.href = mobileCanvas.toDataURL();
                    link.click();
                }
            }, 100);
        },
        regenerate: () => {
            if (sketchRef.current) sketchRef.current.redraw();
        },
        exportHighRes: (scale: number = 4) => {
            if (!sketchRef.current) return;
            const p = sketchRef.current;
            p.pixelDensity(scale);
            p.redraw();
            setTimeout(() => {
                p.saveCanvas(`isocube-${Date.now()}-${scale}x`, 'png');
                p.pixelDensity(1);
                p.redraw();
            }, 100);
        },
    }));

    // Trigger redraw params
    useEffect(() => {
        if (sketchRef.current && sketchRef.current.redraw) {
            sketchRef.current.redraw();
        }
    }, [
        params.backgroundColor, params.color1, params.color2, params.color3, params.color4,
        params.gridSize, params.fillRatio, params.cubeWidthMin, params.cubeWidthMax,
        params.cubeHeightMin, params.cubeHeightMax, params.skyscraperChance, params.towerChance,
        params.windowDensity, params.windowType, params.grainIntensity, params.roofDetailChance,
        params.rotateX, params.rotateY
    ]);

    useEffect(() => {
        if (!containerRef.current) return;
        let cancelled = false;

        const initSketch = async () => {
            if (sketchRef.current) { sketchRef.current.remove(); sketchRef.current = null; }
            if (containerRef.current) containerRef.current.innerHTML = '';

            const p5Module = await import("p5");
            const p5 = p5Module.default;
            if (cancelled || !containerRef.current) return;

            const sketch = (p: any) => {
                let shader: any;

                // --- TEXTURE CACHE ---
                // Key: "colorMain|colorDetail|widthBucket|heightBucket|winType"
                // We bucket sizes to avoid minimal differences creating new textures
                const textureCache = new Map<string, any>();

                const getCachedTexture = (w: number, h: number, colMain: string, colDetail: string, winType: string, rng: () => number) => {
                    // Bucket dimensions to nearest 50 units ?
                    // Actually, we texture mapped 0..1, but we chose window rows based on H.
                    // Let's bucket rows/cols directly.
                    const rows = Math.max(3, Math.floor(h / 25 * paramsRef.current.windowDensity)); // Increased divider (was 15) for fewer windows
                    const cols = Math.max(2, Math.floor(w / 25 * paramsRef.current.windowDensity));

                    const key = `${colMain}|${colDetail}|${rows}|${cols}|${winType}`;

                    if (textureCache.has(key)) {
                        return textureCache.get(key);
                    }

                    // Create New
                    const texSize = 512;
                    const pg = p.createGraphics(texSize, texSize);
                    pg.background(colMain);

                    const margin = texSize * 0.05;
                    const workingSize = texSize - margin * 2;
                    const cellW = workingSize / cols;
                    const cellH = workingSize / rows;

                    pg.noStroke();

                    // Always generate fresh pattern? No, cache implies same pattern for same key.
                    // If we want random variation per building but caching, we need to include a "variant" in key?
                    // Or just accept all "5-row red buildings" look same? 
                    // Ideally we want some variation. Let's add a random "variantId" (0-4).
                    // But for now, unified look is fine for performance.

                    const isGlassy = winType === 'lines';

                    if (isGlassy) {
                        pg.stroke(colDetail);
                        pg.strokeWeight(texSize * 0.012);
                        for (let y = 0; y <= rows; y++) {
                            pg.line(0, margin + y * cellH, texSize, margin + y * cellH);
                        }
                        // Verticals
                        pg.strokeWeight(texSize * 0.005);
                        for (let x = 0; x <= cols; x += 2) { // sparse verts
                            pg.line(margin + x * cellW, 0, margin + x * cellW, texSize);
                        }
                    } else {
                        // Windows
                        for (let y = 0; y < rows; y++) {
                            for (let x = 0; x < cols; x++) {
                                // Deterministic pattern based on coordinates to look random but stable
                                // Simple hash
                                const pseudoRand = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
                                const r = pseudoRand - Math.floor(pseudoRand);

                                if (r < 0.5) { // 50% lit
                                    const cx = margin + x * cellW + cellW * 0.5;
                                    const cy = margin + y * cellH + cellH * 0.5;
                                    const sizeW = cellW * 0.6;
                                    const sizeH = cellH * 0.6;

                                    pg.fill(colDetail);

                                    if (winType === 'ellipse') {
                                        pg.ellipse(cx, cy, sizeW, sizeH);
                                    } else if (winType === 'arch') {
                                        pg.arc(cx, cy, sizeW, sizeH, p.PI, 0);
                                        pg.rect(cx - sizeW / 2, cy, sizeW, sizeH / 2);
                                    } else if (winType === 'diamond') {
                                        pg.push();
                                        pg.translate(cx, cy);
                                        pg.rotate(p.PI / 4);
                                        pg.rectMode(p.CENTER);
                                        pg.rect(0, 0, sizeW * 0.6, sizeH * 0.6);
                                        pg.pop();
                                    } else {
                                        pg.rectMode(p.CENTER);
                                        pg.rect(cx, cy, sizeW, sizeH);
                                    }
                                }
                            }
                        }
                    }

                    // Cornice
                    pg.stroke(0, 40);
                    pg.strokeWeight(texSize * 0.01);
                    pg.noFill();
                    pg.rectMode(p.CORNER);
                    pg.rect(0, 0, texSize, texSize);

                    textureCache.set(key, pg);
                    return pg;
                };

                class Structure {
                    pos: any;
                    dims: any;
                    tex: any;
                    children: Structure[];

                    constructor(pos: any, dims: any, type: string, colors: string[], rng: () => number) {
                        this.pos = pos;
                        this.dims = dims;
                        this.children = [];

                        const colMain = colors[Math.floor(rng() * colors.length)];
                        const colDetail = colors[Math.floor(rng() * colors.length)];

                        // Use Cache
                        this.tex = getCachedTexture(dims.x, dims.y, colMain, colDetail, paramsRef.current.windowType, rng);

                        this.generateDetails(rng, colors);
                    }

                    generateDetails(rng: () => number, colors: string[]) {
                        // Tiers
                        if (this.dims.y > 150 && rng() < 0.4) {
                            const tierH = this.dims.y * (0.3 + rng() * 0.3);
                            const tierW = this.dims.x * 0.7;
                            const tierD = this.dims.z * 0.7;
                            const offset = p.createVector(0, -(this.dims.y + tierH) / 2, 0);

                            this.children.push(new Structure(offset, p.createVector(tierW, tierH, tierD), 'tier', colors, rng));
                        } else if (rng() < paramsRef.current.roofDetailChance) {
                            this.addRoofTopper(rng, colors);
                        }
                    }

                    addRoofTopper(rng: () => number, colors: string[]) {
                        const topY = -this.dims.y / 2;
                        const type = rng();
                        if (type < 0.3) { // AC
                            const w = this.dims.x * 0.25; const d = this.dims.z * 0.25; const h = 8;
                            const offset = p.createVector((rng() - 0.5) * (this.dims.x - w), topY - h / 2, (rng() - 0.5) * (this.dims.z - d));
                            // Use simple solid texture for AC
                            this.children.push(new Structure(offset, p.createVector(w, h, d), 'ac', colors, rng));
                        } else if (type < 0.5) { // Tank
                            const w = this.dims.x * 0.35; const h = 20;
                            const offset = p.createVector(0, topY - h / 2, 0);
                            this.children.push(new Structure(offset, p.createVector(w, h, w), 'tank', colors, rng));
                        }
                    }

                    display() {
                        p.push();
                        p.translate(this.pos.x, this.pos.y, this.pos.z);

                        // Reuse texture
                        shader.setUniform("u_tex", this.tex);
                        p.box(this.dims.x, this.dims.y, this.dims.z);

                        for (const child of this.children) {
                            child.display();
                        }
                        p.pop();
                    }
                }

                let buildings: Structure[] = [];

                p.setup = () => {
                    p.createCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight, p.WEBGL).parent(containerRef.current!);
                    const camSize = Math.max(p.width, p.height) * 0.8;
                    p.ortho(-p.width / 2, p.width / 2, p.height / 2, -p.height / 2, -5000, 5000); // Standard p5 Y-down ortho

                    shader = p.createShader(vertShader, createFragShader(paramsRef.current.grainIntensity));
                    p.shader(shader);
                    p.noLoop();
                };

                p.draw = () => {
                    // Clear Cache on regenerate/redraw to avoid memory leak if params change drastically
                    textureCache.clear();

                    const rng = createSeededRandom(paramsRef.current.token);
                    const colorRng = createSeededRandom(paramsRef.current.colorSeed || paramsRef.current.token);

                    // Init World
                    buildings = [];
                    const palette = [paramsRef.current.color1, paramsRef.current.color2, paramsRef.current.color3, paramsRef.current.color4];
                    const gridSize = paramsRef.current.gridSize;
                    const s = Math.min(p.width, p.height);
                    const cellSize = (s * 0.9) / gridSize;
                    const offset = - (gridSize * cellSize) / 2 + cellSize / 2;

                    for (let xi = 0; xi < gridSize; xi++) {
                        for (let zi = 0; zi < gridSize; zi++) {
                            if (rng() > paramsRef.current.fillRatio) continue;

                            const x = offset + xi * cellSize;
                            const z = offset + zi * cellSize;

                            const margin = cellSize * 0.15;
                            const w = cellSize - margin;
                            const d = cellSize - margin;

                            let h;
                            if (rng() < paramsRef.current.skyscraperChance) h = cellSize * (4 + rng() * 3);
                            else if (rng() < paramsRef.current.towerChance) h = cellSize * (2.5 + rng() * 2);
                            else h = cellSize * (0.8 + rng() * 1.5);

                            // Bottom at Y=0. Center at -h/2.
                            const y = -h / 2;

                            buildings.push(new Structure(p.createVector(x, y, z), p.createVector(w, h, d), 'block', palette, rng));
                        }
                    }

                    // Painter Sort
                    buildings.sort((a, b) => (b.pos.z + b.pos.x) - (a.pos.z + a.pos.x));

                    // Draw
                    p.background(paramsRef.current.backgroundColor);

                    shader = p.createShader(vertShader, createFragShader(paramsRef.current.grainIntensity));
                    p.shader(shader);
                    shader.setUniform("u_resolution", [p.width, p.height]);
                    // FIX LIGHTING DIRECTION
                    // Old: [0.5, 0.8, 0.5] (Top-Left-Front but Y is down so 0.8 is "down")
                    // New: [0.5, -0.8, 0.5] (Y negative is UP, so light comes from TOP)
                    shader.setUniform("u_lightDir", [0.5, -0.8, 0.5]);

                    p.rotateX(paramsRef.current.rotateX);
                    p.rotateY(paramsRef.current.rotateY);

                    for (const b of buildings) b.display();
                };
            };

            if (!cancelled) sketchRef.current = new p5(sketch);
        };

        initSketch();
        return () => { cancelled = true; if (sketchRef.current) { sketchRef.current.remove(); sketchRef.current = null; } };
    }, [params.token, params.canvasWidth, params.canvasHeight, params.grainIntensity]);

    return <div ref={containerRef} className="w-full h-full flex items-center justify-center" />;
});

IsoCubeArtwork.displayName = "IsoCubeArtwork";
export default IsoCubeArtwork;
