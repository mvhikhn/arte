"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { tokenToSeed, createSeededRandom } from "@/utils/token";

// Standard isometric view matrix values often used in p5, 
// but we control rotation via params. 
// We need a shader that respects the "flat" look.

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
uniform float u_flatShade; // 1.0 for flat shading, 0.0 for smooth

varying vec3 var_vertNormal;
varying vec2 var_vertTexCoord;

// Simple pseudo-random
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  
  // 1. Calculate Lighting
  // We want distinctive sides: Top (brightest), Left/Right (medium/dark)
  // Assuming standard normals.
  vec3 normal = normalize(var_vertNormal);
  vec3 light = normalize(u_lightDir);
  
  // Standard diffuse
  float dot_val = max(dot(normal, light), 0.0);
  
  // Flat / Toon steps
  // We can force 3 tones based on normal direction for that "vector" look
  // Top face usually normal (0,1,0) or varying if rotated
  // We'll trust the dot_val but step it.
  float lightIntensity = 0.5 + 0.5 * dot_val; // Remap -1..1 to 0..1 roughly? No max(0) makes it 0..1
  
  // Quantize light to make it look "flat" if needed, or just use distinctive face colors
  // For StudioYorktown style, usually the colors are flat. 
  // We will rely on the fact that p5 box normals are axis-aligned.
  // We can slightly boost brightness based on Face.
  // Actually, let's just use the texture color multiplied by slight lighting gradient
  
  vec4 texColor = texture2D(u_tex, var_vertTexCoord);
  
  // Apply simple lighting gradient (so it's not 100% flat, but mostly)
  vec3 col = texColor.rgb * (0.8 + 0.2 * dot_val);

  // 2. Grain
  // Only apply if grainIntensity > 0
  if (${grainIntensity.toFixed(4)} > 0.001) {
      float noiseVal = random(st * 999.0); // High freq noise
      // Mix mode: overlay or subtract
      // Let's darken
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
    density: number; // 0-1
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
            // ... (standard export logic, keeping same as before)
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

    useEffect(() => {
        if (sketchRef.current && sketchRef.current.redraw) {
            sketchRef.current.redraw();
        }
    }, [
        params.backgroundColor, params.color1, params.color2, params.color3, params.color4,
        params.gridSize, params.density, params.fillRatio, params.cubeWidthMin, params.cubeWidthMax,
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
                let p5Canvas: any;

                // HELPER: Draw Detailed Windows Texture
                const createBuildingTexture = (
                    w: number, h: number, d: number,
                    colMain: string, colDetail: string,
                    winType: string,
                    rng: () => number
                ) => {
                    // Unify dims for texture mapping
                    // box mapping: UVs wrap around or provided per face?
                    // In p5 WebGL box(), default UVs are 0..1 per face.
                    // So we can just create one square texture and it will appear on all faces. 
                    // OR we want different textures per face? 
                    // Standard p5 box applies same texture to all sides. 
                    // To studioyorktown it, we usually want horizontal striations or grid windows.

                    const texSize = 512;
                    const pg = p.createGraphics(texSize, texSize);

                    pg.background(colMain);

                    // Draw grid
                    // margin
                    const margin = texSize * 0.05;
                    const workingSize = texSize - margin * 2;

                    // Dynamic rows/cols based on aspect ratio of the building?
                    // Since texture is applied to all faces 0..1, a tall building stretches the texture vertically.
                    // A wide building stretches horizontally.
                    // We want CONSISTENT window size regardless of building scale.
                    // So we should pick row/col count based on actual world H/W.

                    // Approximate aspect on face: H / W
                    // Since we can't change UVs easily on p5 box without custom geometry,
                    // we will tune the texture drawing to compensate roughly, or just embrace the stretch (SimCity style).
                    // Let's create a dense grid.

                    const rows = Math.floor(h / 15 * paramsRef.current.windowDensity);
                    const cols = Math.floor(w / 15 * paramsRef.current.windowDensity);

                    // Ensure at least some
                    const rCount = Math.max(3, rows);
                    const cCount = Math.max(2, cols);

                    const cellW = workingSize / cCount;
                    const cellH = workingSize / rCount;

                    pg.noStroke();

                    const isGlassy = rng() < 0.2; // 20% buildings are just "glassy" lines

                    if (isGlassy) {
                        pg.stroke(colDetail);
                        pg.strokeWeight(texSize * 0.01);
                        for (let y = 0; y <= rCount; y++) {
                            pg.line(0, margin + y * cellH, texSize, margin + y * cellH);
                        }
                    } else {
                        for (let y = 0; y < rCount; y++) {
                            for (let x = 0; x < cCount; x++) {
                                // Random "lit" or "dark" or "detail"
                                const r = rng();
                                // 60% window, 40% empty wall
                                if (r < 0.6) {
                                    const cx = margin + x * cellW + cellW * 0.5;
                                    const cy = margin + y * cellH + cellH * 0.5;
                                    const sizeW = cellW * 0.65;
                                    const sizeH = cellH * 0.65;

                                    // Color: Slightly darker or lighter than main
                                    // If "lit" (night mode? maybe just contrast)
                                    pg.fill(colDetail);

                                    // Shape
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
                                        pg.rect(0, 0, sizeW * 0.7, sizeH * 0.7);
                                        pg.pop();
                                    } else {
                                        // Rect default
                                        pg.rectMode(p.CENTER);
                                        pg.rect(cx, cy, sizeW, sizeH);
                                    }
                                }
                            }
                        }
                    }

                    // Roof / Floor lines (cornices)
                    pg.stroke(0, 50); // slight shadow
                    pg.strokeWeight(texSize * 0.005);
                    pg.noFill();
                    pg.rectMode(p.CORNER);
                    pg.rect(0, 0, texSize, texSize);

                    return pg;
                };

                // -------------------------------------------------------------

                class Structure {
                    pos: any; // Vector
                    dims: any; // Vector W, H, D
                    type: string;
                    colors: string[];
                    tex: any;
                    children: Structure[];

                    constructor(pos: any, dims: any, type: string, colors: string[], rng: () => number) {
                        this.pos = pos;
                        this.dims = dims;
                        this.type = type;
                        this.colors = colors;
                        this.children = [];

                        // Main body color
                        const colMain = colors[Math.floor(rng() * colors.length)];
                        const colDetail = colors[Math.floor(rng() * colors.length)]; // contrast?

                        // Improve Texture
                        this.tex = createBuildingTexture(dims.x, dims.y, dims.z, colMain, colDetail, paramsRef.current.windowType, rng);

                        // Add sub-structures (tiers, roof details)
                        this.generateDetails(rng);
                    }

                    generateDetails(rng: () => number) {
                        // 1. Tiers (setbacks)
                        // If structure is tall, maybe add a smaller box on top
                        if (this.dims.y > 150 && rng() < 0.4) {
                            // Add a Tier
                            const tierH = this.dims.y * (0.3 + rng() * 0.3);
                            const tierW = this.dims.x * 0.7;
                            const tierD = this.dims.z * 0.7;

                            // Center on top
                            // Local pos relative to this? No, we'll draw recursively from center?
                            // Let's store relative offset.
                            // Parent box is height H. Top face is at +H/2 (since box is centered).
                            // Child box height h. Center is at +h/2 relative to parent top.
                            // So Offset Y = +H/2 + h/2 = (H+h)/2.

                            const offset = p.createVector(0, -(this.dims.y + tierH) / 2, 0); // -Y is UP in our logic if we flip perspective
                            // Wait, in standard p5, +Y is DOWN. 
                            // My logic for "Ground" should be Y positive.
                            // But typically "Up" into the sky is -Y in 2D coords. In 3D p5, usually +Y is down.
                            // So "Top" of box is -H/2.
                            // Child center should be -H/2 - h/2 = -(H+h)/2.

                            const tier = new Structure(
                                offset,
                                p.createVector(tierW, tierH, tierD),
                                'tier',
                                this.colors,
                                rng
                            );
                            this.children.push(tier);
                        } else if (rng() < paramsRef.current.roofDetailChance) {
                            // Roof Toppers
                            this.addRoofTopper(rng);
                        }
                    }

                    addRoofTopper(rng: () => number) {
                        // Top of current box is -H/2
                        const topY = -this.dims.y / 2;
                        const type = rng();

                        if (type < 0.3) {
                            // AC Units
                            const w = this.dims.x * 0.2;
                            const d = this.dims.z * 0.2;
                            const h = 10;
                            // Random spot on roof
                            const rx = (rng() - 0.5) * (this.dims.x - w);
                            const rz = (rng() - 0.5) * (this.dims.z - d);

                            // Box center y = topY - h/2
                            const offset = p.createVector(rx, topY - h / 2, rz);
                            // Just a simple box, no complex texture needed (or reuse)
                            // Hack: reuse main texture but scaled? Or plain color?
                            // Let's just create a simple Structure for uniform recursion
                            this.children.push(new Structure(offset, p.createVector(w, h, d), 'ac', this.colors, rng));
                        } else if (type < 0.6) {
                            // Water Tank (Cylinder) -> represented as box for now or custom?
                            // We can do box for style.
                            const w = this.dims.x * 0.4;
                            const h = 25;
                            const offset = p.createVector(0, topY - h / 2, 0);
                            this.children.push(new Structure(offset, p.createVector(w, h, w), 'tank', this.colors, rng));
                        } else {
                            // Antenna
                            const h = 60;
                            const w = 5;
                            const offset = p.createVector(0, topY - h / 2, 0);
                            this.children.push(new Structure(offset, p.createVector(w, h, w), 'antenna', this.colors, rng));
                        }
                    }

                    display(parentPos: any) {
                        p.push();
                        p.translate(this.pos.x, this.pos.y, this.pos.z);

                        // Draw Self
                        shader.setUniform("u_tex", this.tex);
                        p.box(this.dims.x, this.dims.y, this.dims.z);

                        // Draw Children
                        // Children pos is relative to Self Center
                        // BUT p5 transform stack accumulates.
                        for (const child of this.children) {
                            child.display(p.createVector(0, 0, 0));
                        }

                        p.pop();
                    }
                }

                let buildings: Structure[] = [];

                const initWorld = (rng: () => number, colorRng: () => number) => {
                    buildings = [];

                    // Setup Palette
                    const palette = [
                        paramsRef.current.color1, paramsRef.current.color2,
                        paramsRef.current.color3, paramsRef.current.color4
                    ];

                    const gridSize = paramsRef.current.gridSize;
                    const s = Math.min(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight); // Canvas Size

                    // We want the city to span decent area.
                    // Isometric scale depends on 's'.
                    // Grid Cell Size
                    const cellSize = (s * 0.8) / gridSize;

                    // Centering
                    const offset = - (gridSize * cellSize) / 2 + cellSize / 2;

                    for (let xi = 0; xi < gridSize; xi++) {
                        for (let zi = 0; zi < gridSize; zi++) {
                            // Chance to spawn
                            if (rng() > paramsRef.current.fillRatio) continue;

                            // Position on Plane (XZ)
                            const x = offset + xi * cellSize;
                            const z = offset + zi * cellSize;

                            // Building Size
                            // Width/Depth: fill most of cell but leave gaps (alleys)
                            const margin = cellSize * (0.1 + rng() * 0.1);
                            const w = cellSize - margin;
                            const d = cellSize - margin;

                            // Height
                            // Skyscr?
                            let h = 0;
                            let bType = 'cube';

                            if (rng() < paramsRef.current.skyscraperChance) {
                                h = cellSize * (3 + rng() * 4); // Very tall
                                bType = 'sky';
                            } else if (rng() < paramsRef.current.towerChance) {
                                h = cellSize * (2 + rng() * 2);
                                bType = 'tower';
                            } else {
                                h = cellSize * (0.5 + rng() * 1.5);
                                bType = 'block';
                            }

                            // GEOMETRY FIX:
                            // We want bottom of building to be at Y = 0 (Ground).
                            // In p5 +Y is down. Ground is 0. UP is -Y.
                            // Building grows UP.
                            // Center of box of height H is at -H/2.
                            const y = -h / 2;

                            const pos = p.createVector(x, y, z);
                            const dims = p.createVector(w, h, d);

                            buildings.push(new Structure(pos, dims, bType, palette, rng));
                        }
                    }

                    // Sort for painter's algorithm if alpha transparency used, 
                    // but with depth test on it usually handles itself.
                    // However, strictly sorting by depth (far to near) is good practice.
                    buildings.sort((a, b) => {
                        // Camera is isometric looking from corner.
                        // Depth is roughly X + Z or similar depending on rotation.
                        return (b.pos.z + b.pos.x) - (a.pos.z + a.pos.x);
                    });
                };

                p.setup = () => {
                    // force square-ish or fit container?
                    p5Canvas = p.createCanvas(
                        paramsRef.current.canvasWidth,
                        paramsRef.current.canvasHeight,
                        p.WEBGL
                    );
                    p5Canvas.parent(containerRef.current!);

                    // Orthographic Projection for ISOMETRIC look
                    // ortho(left, right, bottom, top, near, far)
                    // We need to encompass the whole scene.
                    const camSize = Math.max(p.width, p.height) * 0.8;
                    p.ortho(-p.width / 2, p.width / 2, p.height / 2, -p.height / 2, -5000, 5000);

                    // Shader
                    shader = p.createShader(vertShader, createFragShader(paramsRef.current.grainIntensity));
                    p.shader(shader);

                    p.noLoop();
                };

                p.draw = () => {
                    // Params
                    const rng = createSeededRandom(paramsRef.current.token);
                    const colorSeed = paramsRef.current.colorSeed || paramsRef.current.token;
                    const colorRng = createSeededRandom(colorSeed);

                    // Init
                    initWorld(rng, colorRng);

                    // Update shader
                    shader = p.createShader(vertShader, createFragShader(paramsRef.current.grainIntensity));
                    p.shader(shader);
                    shader.setUniform("u_resolution", [p.width, p.height]);

                    // Light Dir: Standard Isometric (Top-Left-Front)
                    // In view space? normalized.
                    shader.setUniform("u_lightDir", [0.5, 0.8, 0.5]);

                    p.background(paramsRef.current.backgroundColor);

                    // Camera Setup
                    // Isometric is usually: Rotate X ~35.264 (asin(1/sqrt(3))), Rotate Y 45
                    // User controls these now.
                    p.rotateX(paramsRef.current.rotateX);
                    p.rotateY(paramsRef.current.rotateY);

                    // Center the world
                    // Our grid is centered around 0,0,0 (XZ).
                    // Ground is Y=0.
                    // So we should be good.

                    for (const b of buildings) {
                        b.display(p.createVector(0, 0, 0));
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
            if (sketchRef.current) { sketchRef.current.remove(); sketchRef.current = null; }
        };
    }, [params.token, params.canvasWidth, params.canvasHeight, params.grainIntensity]); // Re-run totally if these change

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
    );
});

IsoCubeArtwork.displayName = "IsoCubeArtwork";
export default IsoCubeArtwork;
