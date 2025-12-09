"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { tokenToSeed, createSeededRandom } from "@/utils/token";

// VERTEX SHADER
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
  var_vertPos      = pos;
  var_vertNormal   =  aNormal;
  var_vertTexCoord = aTexCoord;
  var_centerGlPosition = uProjectionMatrix * uModelViewMatrix * vec4(0., 0., 0., 1.0);
}
`;

// FRAGMENT SHADER
const createFragShader = (grainIntensity: number) => `
precision highp float;
uniform vec2 u_resolution;
uniform vec3 u_lightDir;
uniform sampler2D u_tex;
uniform mat3 uNormalMatrix; 
varying vec4 var_centerGlPosition;
varying vec3 var_vertNormal;
varying vec2 var_vertTexCoord;
float random (in vec2 st) {
   	highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(st.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}
float noise(vec2 st) {
    vec2 i = vec2(0.);
	i = floor(st);
    vec2 f = vec2(0.);
	f = fract(st);
    vec2 u =  vec2(0.);
	u = f*f*(3.0-2.0*f);
    return mix( mix( random( i + vec2(0.0,0.0) ),
                     random( i + vec2(1.0,0.0) ), u.x),
                mix( random( i + vec2(0.0,1.0) ),
                     random( i + vec2(1.0,1.0) ), u.x), u.y);
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
	st.x *= u_resolution.x/u_resolution.y;
	vec2 centerPos = var_centerGlPosition.xy/var_centerGlPosition.w; 
	centerPos = (centerPos + 1.0)*0.5; 
	centerPos.x *= u_resolution.x/u_resolution.y; 
	vec3 vertNormal = normalize(var_vertNormal); 
    float dotVal = dot(vertNormal, -normalize(u_lightDir));
    dotVal = (dotVal * 0.5) + 0.5;
	vec4 smpColor0 = texture2D(u_tex, var_vertTexCoord);
    float noise1 = noise((st-centerPos) * 700.0);
	float noise2 = noise((st-centerPos) * 1000.0);
	float tone = step(noise1, dotVal * 1.2);
	vec3 col = smpColor0.xyz * tone + (smpColor0.xyz - 0.25) * (1.0 - tone);
	float grain = ${grainIntensity.toFixed(4)};
	col += noise2 * grain;
	gl_FragColor = vec4(col, 1.0);
}
`;

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

    useEffect(() => { paramsRef.current = params; }, [params]);

    useImperativeHandle(ref, () => ({
        exportImage: () => { if (sketchRef.current) sketchRef.current.saveCanvas(`isocube-${Date.now()}`, 'png'); },
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
                const link = document.createElement('a'); link.download = `isocube-desktop-${timestamp}.png`;
                link.href = desktopCanvas.toDataURL(); link.click();
            }
        },
        regenerate: () => { if (sketchRef.current) sketchRef.current.redraw(); },
        exportHighRes: (scale: number = 4) => {
            if (!sketchRef.current) return;
            const p = sketchRef.current;
            p.pixelDensity(scale);
            p.redraw();
            setTimeout(() => { p.saveCanvas(`isocube-high-${Date.now()}`, 'png'); p.pixelDensity(1); p.redraw(); }, 100);
        }
    }));

    useEffect(() => {
        if (sketchRef.current && sketchRef.current.redraw) sketchRef.current.redraw();
    }, [
        params.backgroundColor, params.color1, params.color2, params.color3, params.color4,
        params.gridSize, params.fillRatio, params.grainIntensity, params.rotateX, params.rotateY
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
                let obj: Cube[] = [];
                let COLS: string[] = [];
                const textureCache = new Map<string, any>(); // Cache

                // Helper: Get Cached Texture
                const getTexture = (w: number, h: number, col1: string, col2: string, rectWin: boolean, winSize: number, spanMult: number) => {
                    // Quantize w, h to reduce unique keys
                    const qW = Math.ceil(w / 20) * 20;
                    const qH = Math.ceil(h / 20) * 20;
                    const qWin = Math.ceil(winSize / 5) * 5;
                    const qSpan = spanMult.toFixed(1);

                    const key = `${qW}-${qH}-${col1}-${col2}-${rectWin}-${qWin}-${qSpan}`;

                    if (textureCache.has(key)) return textureCache.get(key);

                    // Create
                    const tx = Math.max(1, qW * 2);
                    const ty = Math.max(1, qH * 2);
                    const pg = p.createGraphics(tx, ty);

                    pg.noStroke();
                    let margin = Math.max(pg.width * 0.1, 10);
                    let spanNum = Math.floor((pg.width - margin * 2) / (qWin * 2)) * 2 + 1;
                    if (spanNum < 1) spanNum = 1;
                    let span = (pg.width - margin * 2) / spanNum;

                    pg.background(col1);
                    pg.fill(col2);

                    for (let y = margin; y < pg.height - margin - span / 2; y += span * parseFloat(qSpan)) {
                        let i = 0;
                        for (let x = margin; x < pg.width - margin - span / 2; x += span) {
                            if (i % 2 === 0) {
                                if (rectWin) pg.rect(x, y, span, span);
                                else pg.ellipse(x, pg.height - y, span, span);
                            }
                            i++;
                        }
                    }

                    textureCache.set(key, pg);
                    return pg;
                }

                class Cube {
                    pos: any;
                    size: any;
                    col: string[];
                    tex: any;
                    topPos: any;

                    constructor(_pos: any, _size: any, _col1: string, _col2: string, rng: () => number) {
                        this.pos = _pos;
                        this.size = _size;
                        this.col = [_col1, _col2];

                        const spanMult = 1 + rng() * 2;
                        const rectWindow = rng() > 0.3;
                        const windowSize = 15 + rng() * 5;

                        this.tex = getTexture(_size.x, _size.y, _col1, _col2, rectWindow, windowSize, spanMult);

                        // Top pos for detail
                        this.topPos = p.createVector(_size.x * (rng() - 0.5) * 0.8, 0, _size.z * (rng() - 0.5) * 0.8);
                    }

                    display() {
                        shader.setUniform("u_tex", this.tex);
                        p.push();
                        p.translate(this.pos.x, this.pos.y, this.pos.z);
                        p.box(this.size.x, this.size.y, this.size.z);

                        // Roof trim
                        this.tex.background(this.col[1]); // This pollutes cache? 
                        // Wait. `this.tex` is shared. modifying it modifies ALL buildings sharing it.
                        // WE CANNOT MODIFY SHARED TEXTURE.
                        // User code: `this.tex.background(this.col[1])` to use it as solid color?
                        // That effectively erases the window pattern for the trim.
                        // WE NEED A SEPARATE SOLID TEXTURE or just unbind texture?
                        // Shader uses u_tex. If we unbind, what happens?
                        // Or create a simple 1x1 solid pixel graphic for trims?
                        // Let's create a generic "solid" texture cache too.

                        // Actually, for the trim box, we can just use `fill()` if shader ignores it? 
                        // But shader `gl_FragColor` uses `texture2D`.
                        // So we MUST provide a texture.
                        // Let's assume we want a solid color texture.

                        // FIX: Don't modify `this.tex`. Use a solid texture.
                        // But `this.col[1]` varies.
                        // We'll create small solid textures on fly?
                        // Or just use `this.tex` but assume UVs map to a solid part? 
                        // No, UVs are 0..1.
                        // Safest: Create a 2x2 solid texture for the color 2.
                        // Can we just create them once per Color?
                        // We have a limited palette. Cache solids by color string.

                        const solidTex = getSolidTexture(this.col[1]);
                        shader.setUniform("u_tex", solidTex);

                        p.translate(0, this.size.y * 0.525, 0);
                        p.box(this.size.x, this.size.y * 0.05, this.size.z);

                        // Top Box - use col0 solid
                        const solidTex0 = getSolidTexture(this.col[0]);
                        shader.setUniform("u_tex", solidTex0);

                        p.translate(this.topPos.x, -this.size.y * 0.525, this.topPos.z);
                        p.box(this.size.x * 0.1, this.size.y * 0.15, this.size.z * 0.1);

                        p.pop();
                    }
                }

                const solidCache = new Map<string, any>();
                const getSolidTexture = (col: string) => {
                    if (solidCache.has(col)) return solidCache.get(col);
                    const pg = p.createGraphics(2, 2);
                    pg.background(col);
                    solidCache.set(col, pg);
                    return pg;
                };

                const MAX_OBJ = 2500; // Safety Cap

                const build = (x: number, z: number, size: number, cellNum: number, groundY: number, rng: () => number, depth: number) => {
                    if (obj.length >= MAX_OBJ) return;
                    if (depth > 6) return; // Recursion limit
                    let span = size / cellNum;
                    if (span < 10) return;

                    const startX = x;
                    const startZ = z;

                    for (let cx = startX - size / 2; cx <= startX + size / 2 - span / 2; cx += span) {
                        for (let cz = startZ - size / 2; cz <= startZ + size / 2 - span / 2; cz += span) {
                            if (obj.length >= MAX_OBJ) return;

                            const chance = rng();
                            if (chance < 0.5 && span > p.width / 20) {
                                build(cx, cz, span * (0.6 + rng() * 0.3), Math.floor(2 + rng() * 2), groundY, rng, depth + 1);
                            } else {
                                if (COLS.length === 0) return;
                                const ri = Math.floor(rng() * COLS.length);
                                const ri2 = (ri + Math.floor(1 + rng() * (COLS.length - 1))) % COLS.length;
                                const w = span * (0.6 + rng() * 0.3);
                                const h = span * (0.5 + rng() * 1.5);
                                const y = h / 2 + groundY;
                                obj.push(new Cube(p.createVector(cx, y, cz), p.createVector(w, h, w), COLS[ri], COLS[ri2], rng));
                            }
                        }
                    }
                };

                p.setup = () => {
                    const can = p.createCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight, p.WEBGL);
                    can.parent(containerRef.current!);
                    const dep = Math.max(p.width, p.height);
                    p.ortho(-p.width / 2, p.width / 2, p.height / 2, -p.height / 2, -dep * 3, dep * 3);
                    shader = p.createShader(vertShader, createFragShader(paramsRef.current.grainIntensity));
                    p.shader(shader);
                    p.noLoop();
                };

                p.draw = () => {
                    // Clear caches
                    textureCache.clear();
                    solidCache.clear();

                    const rng = createSeededRandom(paramsRef.current.token);
                    const colorSeed = paramsRef.current.colorSeed || paramsRef.current.token;
                    COLS = [paramsRef.current.color1, paramsRef.current.color2, paramsRef.current.color3, paramsRef.current.color4];
                    obj = [];

                    shader.setUniform("u_resolution", [p.width, p.height]);
                    shader.setUniform("u_lightDir", [1, -1, -1]);

                    p.background(paramsRef.current.backgroundColor);
                    p.rotateX(paramsRef.current.rotateX);
                    p.rotateY(paramsRef.current.rotateY);

                    const s = Math.min(p.width, p.height) * 3 * (paramsRef.current.fillRatio);
                    const groundY = -p.height * 0.1;
                    const initialCells = paramsRef.current.gridSize;

                    build(0, 0, s, initialCells, groundY, rng, 0);

                    for (let item of obj) {
                        item.display();
                    }
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
