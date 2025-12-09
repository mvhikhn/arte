"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { tokenToSeed, createSeededRandom } from "@/utils/token";

// Vertex shader for 3D cube rendering
const vertShader = `
precision highp float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

varying vec3 var_vertPos;
varying vec3 var_vertNormal;
varying vec2 var_vertTexCoord;
varying vec4 var_centerGlPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

void main() {
  vec3 pos = aPosition;  
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);

  var_vertPos = pos;
  var_vertNormal = aNormal;
  var_vertTexCoord = aTexCoord;
  var_centerGlPosition = uProjectionMatrix * uModelViewMatrix * vec4(0., 0., 0., 1.0);
}
`;

// Fragment shader with lighting, texture and grain
const createFragShader = (grainIntensity: number) => `
precision highp float;

uniform vec2 u_resolution;
uniform vec3 u_lightDir;
uniform mat3 uNormalMatrix;
uniform sampler2D u_tex;

varying vec4 var_centerGlPosition;
varying vec3 var_vertNormal;
varying vec2 var_vertTexCoord;

float random(in vec2 st) {
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt = dot(st.xy, vec2(a, b));
  highp float sn = mod(dt, 3.14);
  return fract(sin(sn) * c);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(random(i + vec2(0.0, 0.0)), random(i + vec2(1.0, 0.0)), u.x),
    mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st.x *= u_resolution.x / u_resolution.y;

  vec2 centerPos = var_centerGlPosition.xy / var_centerGlPosition.w;
  centerPos = (centerPos + 1.0) * 0.5;
  centerPos.x *= u_resolution.x / u_resolution.y;

  vec3 vertNormal = normalize(uNormalMatrix * var_vertNormal);
  float dot_val = dot(vertNormal, -normalize(u_lightDir));
  dot_val = (dot_val * 0.5) + 0.5;

  vec4 smpColor0 = texture2D(u_tex, var_vertTexCoord);

  float noise1 = noise((st - centerPos) * 700.0);
  float noise2 = noise((st - centerPos) * 1000.0);

  float tone = step(noise1, dot_val * 1.2);
  vec3 col = smpColor0.xyz * tone + (smpColor0.xyz - 0.25) * (1.0 - tone);
  col += noise2 * ${grainIntensity.toFixed(2)};

  gl_FragColor = vec4(col, 1.0);
}
`;

// Building types
type BuildingType = 'cube' | 'skyscraper' | 'tower' | 'wide';
// Window types
type WindowType = 'rect' | 'ellipse' | 'arch' | 'cross' | 'diamond';

export interface IsoCubeArtworkParams {
    // Colors (studioyorktown style)
    backgroundColor: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    // Density & Layout
    gridSize: number;
    density: number; // 0-1, how packed the buildings are
    fillRatio: number; // % of grid cells that have buildings
    // Building properties
    cubeWidthMin: number;
    cubeWidthMax: number;
    cubeHeightMin: number;
    cubeHeightMax: number;
    skyscraperChance: number; // 0-1
    towerChance: number; // 0-1
    // Visual details
    windowDensity: number;
    windowType: string; // 'mixed', 'rect', 'ellipse', 'arch', 'cross', 'diamond'
    grainIntensity: number; // 0-0.3
    roofDetailChance: number; // 0-1
    // Camera
    rotateX: number;
    rotateY: number;
    // Canvas
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
            const p = sketchRef.current;
            p.saveCanvas(`isocube-arte-${Date.now()}`, 'png');
        },
        exportWallpapers: () => {
            if (!sketchRef.current) return;
            const p = sketchRef.current;
            const timestamp = Date.now();
            const currentCanvas = p.canvas as HTMLCanvasElement;

            const centerArtwork = (targetWidth: number, targetHeight: number) => {
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = targetWidth;
                exportCanvas.height = targetHeight;
                const ctx = exportCanvas.getContext('2d');
                if (!ctx) return null;

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
            if (sketchRef.current) {
                sketchRef.current.redraw();
            }
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

    // Trigger redraw when params change
    useEffect(() => {
        if (sketchRef.current && sketchRef.current.redraw) {
            sketchRef.current.redraw();
        }
    }, [
        params.backgroundColor,
        params.color1,
        params.color2,
        params.color3,
        params.color4,
        params.gridSize,
        params.density,
        params.fillRatio,
        params.cubeWidthMin,
        params.cubeWidthMax,
        params.cubeHeightMin,
        params.cubeHeightMax,
        params.skyscraperChance,
        params.towerChance,
        params.windowDensity,
        params.windowType,
        params.grainIntensity,
        params.roofDetailChance,
        params.rotateX,
        params.rotateY,
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
                let shader: any;
                let buildings: any[] = [];

                // Determine building type based on probabilities
                const getBuildingType = (rng: () => number): BuildingType => {
                    const r = rng();
                    if (r < paramsRef.current.skyscraperChance) return 'skyscraper';
                    if (r < paramsRef.current.skyscraperChance + paramsRef.current.towerChance) return 'tower';
                    if (r < paramsRef.current.skyscraperChance + paramsRef.current.towerChance + 0.1) return 'wide';
                    return 'cube';
                };

                // Get window type for this building
                const getWindowType = (rng: () => number): WindowType => {
                    const wt = paramsRef.current.windowType;
                    if (wt === 'rect') return 'rect';
                    if (wt === 'ellipse') return 'ellipse';
                    if (wt === 'arch') return 'arch';
                    if (wt === 'cross') return 'cross';
                    if (wt === 'diamond') return 'diamond';
                    // Mixed - pick randomly
                    const types: WindowType[] = ['rect', 'ellipse', 'arch', 'cross', 'diamond'];
                    return types[Math.floor(rng() * types.length)];
                };

                // Building class with multiple types
                class Building {
                    pos: any;
                    size: any;
                    tex: any;
                    col: string[];
                    type: BuildingType;
                    windowType: WindowType;
                    windowSpacing: number;
                    hasRoofDetail: boolean;
                    roofPos: any;

                    constructor(
                        _pos: any,
                        _size: any,
                        _col1: string,
                        _col2: string,
                        rng: () => number
                    ) {
                        this.pos = _pos;
                        this.size = _size;
                        this.col = [_col1, _col2];
                        this.type = getBuildingType(rng);
                        this.windowType = getWindowType(rng);
                        this.windowSpacing = 1 + rng() * 2;
                        this.hasRoofDetail = rng() < paramsRef.current.roofDetailChance;
                        this.roofPos = p.createVector(
                            _size.x * (rng() - 0.5) * 0.6,
                            0,
                            _size.z * (rng() - 0.5) * 0.6
                        );

                        // Adjust size based on building type
                        if (this.type === 'skyscraper') {
                            this.size = p.createVector(_size.x * 0.6, _size.y * 2.5, _size.z * 0.6);
                        } else if (this.type === 'tower') {
                            this.size = p.createVector(_size.x * 0.4, _size.y * 3, _size.z * 0.4);
                        } else if (this.type === 'wide') {
                            this.size = p.createVector(_size.x * 1.5, _size.y * 0.5, _size.z * 1.5);
                        }

                        this.tex = p.createGraphics(this.size.x * 2, this.size.y * 2);
                    }

                    drawWindow(tex: any, x: number, y: number, size: number) {
                        switch (this.windowType) {
                            case 'rect':
                                tex.rect(x - size / 2, y - size / 2, size, size);
                                break;
                            case 'ellipse':
                                tex.ellipse(x, y, size, size);
                                break;
                            case 'arch':
                                tex.rect(x - size / 2, y, size, size * 0.6);
                                tex.arc(x, y, size, size, p.PI, 0);
                                break;
                            case 'cross':
                                tex.rect(x - size / 6, y - size / 2, size / 3, size);
                                tex.rect(x - size / 2, y - size / 6, size, size / 3);
                                break;
                            case 'diamond':
                                tex.push();
                                tex.translate(x, y);
                                tex.rotate(p.PI / 4);
                                tex.rect(-size / 3, -size / 3, size * 0.66, size * 0.66);
                                tex.pop();
                                break;
                        }
                    }

                    update() {
                        this.tex.noStroke();
                        const margin = this.tex.width * 0.08;
                        const windowSize = (this.tex.width - margin * 2) / (paramsRef.current.windowDensity + 2);

                        this.tex.background(this.col[0]);
                        this.tex.fill(this.col[1]);

                        let i = 0;
                        for (let y = this.tex.height - margin * 1.5; y >= margin; y -= windowSize * this.windowSpacing) {
                            for (let x = margin + windowSize / 2; x <= this.tex.width - margin; x += windowSize * 1.2) {
                                if (i % 2 === 0) {
                                    this.drawWindow(this.tex, x, y, windowSize * 0.8);
                                }
                                i++;
                            }
                        }

                        // Add subtle horizontal lines for floors (studioyorktown style)
                        this.tex.stroke(this.col[1]);
                        this.tex.strokeWeight(0.5);
                        for (let y = margin; y < this.tex.height - margin; y += windowSize * this.windowSpacing * 0.5) {
                            this.tex.line(margin * 0.5, y, this.tex.width - margin * 0.5, y);
                        }
                        this.tex.noStroke();
                    }

                    display() {
                        p.noStroke();
                        shader.setUniform("u_tex", this.tex);
                        p.push();
                        p.translate(this.pos);

                        // Main building body
                        p.box(this.size.x, this.size.y, this.size.z);

                        // Roof cap
                        this.tex.background(this.col[1]);
                        p.translate(0, this.size.y * 0.51, 0);
                        p.box(this.size.x * 1.02, this.size.y * 0.02, this.size.z * 1.02);

                        // Roof detail (antenna, AC unit, etc.)
                        if (this.hasRoofDetail) {
                            this.tex.background(this.col[0]);
                            p.translate(this.roofPos);

                            if (this.type === 'skyscraper' || this.type === 'tower') {
                                // Antenna
                                p.box(this.size.x * 0.03, this.size.y * 0.25, this.size.z * 0.03);
                            } else {
                                // AC or water tank
                                p.box(this.size.x * 0.15, this.size.y * 0.1, this.size.z * 0.15);
                            }
                        }

                        p.pop();
                    }
                }

                const initBuildings = (rng: () => number, colorRng: () => number) => {
                    buildings = [];
                    const s = Math.min(p.width, p.height) * (0.5 + paramsRef.current.density * 0.3);
                    const gridSize = paramsRef.current.gridSize;
                    const span = s / gridSize;

                    const colors = [
                        paramsRef.current.color1,
                        paramsRef.current.color2,
                        paramsRef.current.color3,
                        paramsRef.current.color4,
                    ];

                    // Create denser grid with some random offset
                    for (let gx = 0; gx <= gridSize; gx++) {
                        for (let gz = 0; gz <= gridSize; gz++) {
                            // Skip some cells based on fillRatio
                            if (rng() > paramsRef.current.fillRatio) continue;

                            const x = -s / 2 + gx * span + (rng() - 0.5) * span * 0.3;
                            const z = -s / 2 + gz * span + (rng() - 0.5) * span * 0.3;

                            const ri = Math.floor(colorRng() * colors.length);
                            const ri2 = (ri + 1 + Math.floor(colorRng() * (colors.length - 1))) % colors.length;

                            const w = span * (paramsRef.current.cubeWidthMin + rng() * (paramsRef.current.cubeWidthMax - paramsRef.current.cubeWidthMin));
                            const h = span * (paramsRef.current.cubeHeightMin + rng() * (paramsRef.current.cubeHeightMax - paramsRef.current.cubeHeightMin));
                            const y = h / 2 - p.height * 0.08;

                            buildings.push(new Building(
                                p.createVector(x, y, z),
                                p.createVector(w, h, w),
                                colors[ri],
                                colors[ri2],
                                rng
                            ));
                        }
                    }

                    // Sort buildings by distance for proper depth rendering
                    buildings.sort((a: any, b: any) => {
                        return (b.pos.x + b.pos.z) - (a.pos.x + a.pos.z);
                    });
                };

                p.setup = () => {
                    const canvas = p.createCanvas(
                        paramsRef.current.canvasWidth,
                        paramsRef.current.canvasHeight,
                        p.WEBGL
                    );
                    canvas.parent(containerRef.current!);

                    const dep = Math.max(p.width, p.height);
                    p.ortho(-p.width / 2, p.width / 2, p.height / 2, -p.height / 2, -dep * 2, dep * 2);

                    shader = p.createShader(vertShader, createFragShader(paramsRef.current.grainIntensity));
                    p.shader(shader);
                    shader.setUniform("u_resolution", [p.width, p.height]);
                    shader.setUniform("u_lightDir", [1, -1, -1]);

                    p.noLoop();
                };

                p.draw = () => {
                    const rng = createSeededRandom(paramsRef.current.token);
                    const colorSeed = paramsRef.current.colorSeed || paramsRef.current.token;
                    const colorRng = createSeededRandom(colorSeed);

                    // Update shader with current grain
                    shader = p.createShader(vertShader, createFragShader(paramsRef.current.grainIntensity));
                    p.shader(shader);
                    shader.setUniform("u_resolution", [p.width, p.height]);
                    shader.setUniform("u_lightDir", [1, -1, -1]);

                    initBuildings(rng, colorRng);

                    // Dark background for studioyorktown style
                    const bgColor = p.color(paramsRef.current.backgroundColor);
                    p.background(bgColor);

                    p.rotateX(paramsRef.current.rotateX);
                    p.rotateY(paramsRef.current.rotateY);

                    for (const building of buildings) {
                        building.update();
                        building.display();
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
    }, [params.token, params.canvasWidth, params.canvasHeight, params.grainIntensity]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center"
        />
    );
});

IsoCubeArtwork.displayName = "IsoCubeArtwork";

export default IsoCubeArtwork;
