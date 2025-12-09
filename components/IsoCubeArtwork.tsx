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
// varying vec4 var_centerGlPosition; // Unused optimization
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
void main() {
  vec3 pos = aPosition;  
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
  var_vertPos      = pos;
  var_vertNormal   =  aNormal;
  var_vertTexCoord = aTexCoord;
}
`;

// FRAGMENT SHADER
const createFragShader = (grainIntensity: number) => `
precision highp float;
uniform vec2 u_resolution;
uniform vec3 u_lightDir;
uniform sampler2D u_tex;
uniform vec3 u_colorOverride; // Main building color mixed
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

void main() {
	vec3 vertNormal = normalize(var_vertNormal); 
	// Lighting: Top-down-ish
    float dotVal = dot(vertNormal, -normalize(u_lightDir));
    dotVal = (dotVal * 0.5) + 0.5;
    
    // Texture Sample
	vec4 texColor = texture2D(u_tex, var_vertTexCoord);
	
	// Mix texture with override color to allow variety using few textures
	// If texture is grayscale/white-ish, we multiply.
	vec3 baseCol = texColor.rgb * u_colorOverride;
	
	// Lighting
	vec3 col = baseCol * dotVal;
	
	// Simple Grain
	float grain = ${grainIntensity.toFixed(4)};
	if (grain > 0.0) {
	    vec2 st = gl_FragCoord.xy / u_resolution.xy;
	    float r = random(st);
	    col -= r * grain;
	}

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
                let COLS: any[] = [];

                // Static Textures (generated once)
                const PRE_GEN_COUNT = 8;
                const preGenTextures: any[] = [];
                const preGenTrim: any = null;

                class Cube {
                    pos: any;
                    size: any;
                    colIndex: number;
                    texIndex: number;

                    constructor(_pos: any, _size: any, _colIndex: number, _texIndex: number) {
                        this.pos = _pos;
                        this.size = _size;
                        this.colIndex = _colIndex;
                        this.texIndex = _texIndex;
                    }

                    display() {
                        // Set color uniform
                        const c = COLS[this.colIndex];
                        // Convert hex to vec3 (0..1) normalized?
                        // p5 color object
                        const pCol = p.color(c);
                        shader.setUniform("u_colorOverride", [p.red(pCol) / 255, p.green(pCol) / 255, p.blue(pCol) / 255]);

                        shader.setUniform("u_tex", preGenTextures[this.texIndex]);

                        p.push();
                        p.translate(this.pos.x, this.pos.y, this.pos.z);
                        p.box(this.size.x, this.size.y, this.size.z);
                        p.pop();
                    }
                }

                const MAX_OBJ = 3000;

                const build = (x: number, z: number, size: number, cellNum: number, groundY: number, rng: () => number, depth: number) => {
                    if (obj.length >= MAX_OBJ) return;
                    if (depth > 6) return;

                    let span = size / cellNum;
                    // Minimum size logic
                    if (span < 20) {
                        // Too small, stop.
                        return;
                    }

                    const startX = x - size / 2 + span / 2;
                    const startZ = z - size / 2 + span / 2;

                    // Loop through grid
                    // Ensure we cover the area
                    // We want "Packed".

                    for (let cx = startX; cx < x + size / 2; cx += span) {
                        for (let cz = startZ; cz < z + size / 2; cz += span) {
                            if (obj.length >= MAX_OBJ) return;

                            // Always fill? Or chance?
                            // User wants "no empty spaces".
                            // Logic: If subdivide, recurse. If not, BUILD.
                            // Never "do nothing".

                            const chance = rng();
                            // If span is large, likely subdivide
                            const mustSubdivide = span > 200;

                            if (mustSubdivide || (chance < 0.6 && span > 40)) {
                                // Subdivide
                                // varied split count 2..4
                                const split = Math.floor(2 + rng() * 2);
                                build(cx, cz, span, split, groundY, rng, depth + 1);
                            } else {
                                // Build Building
                                // Height
                                // Skyline: taller nearby? Or random?
                                const h = span * (0.5 + rng() * 3.0);
                                const y = -h / 2 + groundY; // Grow UP (negative Y) from ground

                                const colIdx = Math.floor(rng() * COLS.length);
                                const texIdx = Math.floor(rng() * preGenTextures.length);

                                // Shrink slightly for gap?
                                const margin = 2;

                                obj.push(new Cube(
                                    p.createVector(cx, y, cz),
                                    p.createVector(span - margin, h, span - margin),
                                    colIdx,
                                    texIdx
                                ));
                            }
                        }
                    }
                };

                p.setup = () => {
                    const can = p.createCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight, p.WEBGL);
                    can.parent(containerRef.current!);

                    // PRE-GENERATE TEXTURES
                    for (let i = 0; i < PRE_GEN_COUNT; i++) {
                        const pg = p.createGraphics(256, 256);
                        pg.background(255); // White base for multiply
                        pg.noStroke();
                        pg.fill(200); // Light grey windows

                        // Make a pattern
                        const rows = Math.floor(p.random(4, 12));
                        const cols = Math.floor(p.random(4, 8));
                        const cellW = 256 / cols;
                        const cellH = 256 / rows;
                        const margin = 4;

                        for (let y = 0; y < rows; y++) {
                            for (let x = 0; x < cols; x++) {
                                if (Math.random() > 0.3) {
                                    pg.rect(x * cellW + margin, y * cellH + margin, cellW - margin * 2, cellH - margin * 2);
                                }
                            }
                        }
                        // Add "cornice" or lines?
                        pg.stroke(150);
                        pg.strokeWeight(2);
                        pg.rect(0, 0, 256, 256);

                        preGenTextures.push(pg);
                    }

                    const dep = Math.max(p.width, p.height);
                    p.ortho(-p.width / 2, p.width / 2, p.height / 2, -p.height / 2, -dep * 3, dep * 3);
                    shader = p.createShader(vertShader, createFragShader(paramsRef.current.grainIntensity));
                    p.shader(shader);
                    p.noLoop();
                };

                p.draw = () => {
                    const rng = createSeededRandom(paramsRef.current.token);
                    COLS = [paramsRef.current.color1, paramsRef.current.color2, paramsRef.current.color3, paramsRef.current.color4];
                    obj = [];

                    shader.setUniform("u_resolution", [p.width, p.height]);
                    // Skyline Lighting: Front-Top-Left
                    shader.setUniform("u_lightDir", [0.5, -0.8, 1.0]);

                    p.background(paramsRef.current.backgroundColor);

                    // Camera: Flatten it for "Skyline"
                    // default rotateX 0 (front). 
                    // We can let user control, but default should be low.
                    p.rotateX(paramsRef.current.rotateX);
                    p.rotateY(paramsRef.current.rotateY);

                    const s = Math.min(p.width, p.height) * 2.5 * (paramsRef.current.fillRatio);
                    const groundY = p.height * 0.2; // Move ground down so buildings rise up

                    // Initial recursive call
                    build(0, 0, s, 1, groundY, rng, 0);

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
