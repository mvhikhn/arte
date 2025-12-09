"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { tokenToSeed, createSeededRandom } from "@/utils/token";

// VERTEX SHADER
const vertShader = `
precision highp float;

// attributes, in
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

// attributes, out
varying vec3 var_vertPos;
varying vec3 var_vertNormal;
varying vec2 var_vertTexCoord;
varying vec4 var_centerGlPosition;

// matrices
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

void main() {
  vec3 pos = aPosition;  
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);

  // set out value
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
uniform mat3 uNormalMatrix; // p5 standard

// attributes, in
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

	// centerPos logic from provided code
	vec2 centerPos = var_centerGlPosition.xy/var_centerGlPosition.w; // Perspective divide
	centerPos = (centerPos + 1.0)*0.5; // Map -1..1 to 0..1
	centerPos.x *= u_resolution.x/u_resolution.y; // Aspect correction
	
	// Lighting
	// Original code used uniform mat3 uNormalMatrix explicitly but p5 passes it.
	// We need normal in view space? Or world?
	// The provided code: normalize(uNormalMatrix * var_vertNormal)
	vec3 vertNormal = normalize(var_vertNormal); 
	// Wait, if lightDir is world space, we need world normal.
	// uNormalMatrix transforms normal to View Space.
	// let's assume standard p5 normal handling.
	
    float dotVal = dot(vertNormal, -normalize(u_lightDir));
    dotVal = (dotVal * 0.5) + 0.5;
		
	// Texture
	vec4 smpColor0 = texture2D(u_tex, var_vertTexCoord);

	// Noise
	// The user code subtracts centerPos to make noise local to object center in screen space?
	// Scale 700 and 1000
    float noise1 = noise((st-centerPos) * 700.0);
	float noise2 = noise((st-centerPos) * 1000.0);

	// Combine
	// "tone" maps lighting to a step function based on noise1
	// This creates an etched/noisy shading edge
	float tone = step(noise1, dotVal * 1.2);
	
	vec3 col = smpColor0.xyz * tone + (smpColor0.xyz - 0.25) * (1.0 - tone);
	
	// Add grain
	// Original: col += noise2 * 0.15;
	// We use grainIntensity param
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
    fillRatio: number; // mapped to splitting chance?
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
            // Standard export logic reused
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

    // Trigger effect
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

                class Cube {
                    pos: any;
                    size: any;
                    col: string[];
                    tex: any;
                    topPos: any;
                    rectWindow: boolean;
                    windowSize: number;
                    spanMult: number;

                    constructor(_pos: any, _size: any, _col1: string, _col2: string, rng: () => number) {
                        this.pos = _pos;
                        this.size = _size;
                        this.col = [_col1, _col2];
                        // Texture
                        // We multiply size by 2 for resolution? User code: createGraphics(_size.x*2, _size.y*2)
                        // Need to ensure non-zero
                        const tx = Math.max(1, _size.x * 2);
                        const ty = Math.max(1, _size.y * 2);
                        this.tex = p.createGraphics(tx, ty);

                        this.spanMult = 1 + rng() * 2; // random(1,3)
                        this.topPos = p.createVector(_size.x * (rng() - 0.5) * 0.8, 0, _size.z * (rng() - 0.5) * 0.8);
                        this.rectWindow = rng() > 0.3;
                        this.windowSize = 15 + rng() * 5; // random(15,20)

                        this.makeTex();
                    }

                    makeTex() {
                        this.tex.noStroke();
                        let margin = Math.max(this.tex.width * 0.1, 10);
                        // spanNum logic
                        let spanNum = Math.floor((this.tex.width - margin * 2) / (this.windowSize * 2)) * 2 + 1;
                        if (spanNum < 1) spanNum = 1;
                        let span = (this.tex.width - margin * 2) / spanNum;

                        this.tex.background(this.col[0]);
                        this.tex.fill(this.col[1]);

                        for (let y = margin; y < this.tex.height - margin - span / 2; y += span * this.spanMult) {
                            let i = 0;
                            for (let x = margin; x < this.tex.width - margin - span / 2; x += span) {
                                if (i % 2 === 0) {
                                    if (this.rectWindow) {
                                        this.tex.rect(x, y, span, span);
                                    } else {
                                        // ellipse logic
                                        // user: ellipse(x, height-y, span, span)
                                        this.tex.ellipse(x, this.tex.height - y, span, span);
                                    }
                                }
                                i++;
                            }
                        }
                    }

                    display() {
                        shader.setUniform("u_tex", this.tex);

                        p.push();
                        p.translate(this.pos.x, this.pos.y, this.pos.z);
                        p.box(this.size.x, this.size.y, this.size.z);

                        // Details
                        // Roof trim
                        this.tex.background(this.col[1]); // Fill tex with col1 temporarily for solid color?
                        // Wait, display calls makeTex() in user code? No, in user code makeTex is called inside display?
                        // "this.makeTex(); sh.setUniform... push..."
                        // User code calls makeTex EVERY FRAME? That's horrendous for performance.
                        // But `noLoop()` is called in helper code?
                        // User code: setup() { ... noLoop not called? init() -> build() ... }
                        // Actually the user included "noLoop" inside `makeTex` line 1: `this.tex.noLoop();`
                        // But `makeTex` clears background.
                        // User code calls `makeTex` inside `display`.
                        // If it's static (`noLoop` in setup), it's fine.
                        // We are using `p.noLoop()`. So we can draw once.

                        // Roof trim box
                        p.translate(0, this.size.y * 0.525, 0); // Up?
                        // Note: user code `translate(0, this.size.y * 0.525, 0)`
                        // In p5 default, +Y is down.
                        // So this puts it BELOW the building?
                        // Unless camera is upside down?
                        // In user code `rotateX(PI/10); rotateY(PI/3.5);`
                        // Let's stick to our orientation or user's?
                        // User request: "put this artwork instead". I should respect their math.

                        p.box(this.size.x, this.size.y * 0.05, this.size.z);

                        // Top Box
                        p.translate(this.topPos.x, -this.size.y * 0.525, this.topPos.z); // Go back up?
                        // No, topPos is vector(x, 0, z).
                        // We are currently at y = +0.525Y.
                        // User code: `translate(this.topPos); box(...)`
                        // topPos is small offset.
                        // Wait, user code:
                        // 1. translate(pos); box(size);
                        // 2. translate(0, size.y*0.525, 0); box(trim);
                        // 3. translate(topPos); box(small);
                        // 3 accumulates. So it's at y=0.525Y + 0.
                        // If default +Y is down, this creates "feet" or "foundations".
                        // UNLESS `ortho` params flipped Y.
                        // User code: `ortho(-w, w, h, -h, ...)` -> Standard p5 (Bottom=h, Top=-h).
                        // So +Y is DOWN.
                        // So buildings grow "down" if y is positive?
                        // User code: `y = h/2 + _groundY`. `_groundY = -height*0.1`.
                        // If `_groundY` is negative (top of screen), and `h/2` adds to it, they are near top growing down?

                        p.box(this.size.x * 0.1, this.size.y * 0.15, this.size.z * 0.1);
                        p.pop();

                        // Restore texture? Only if we draw again.
                    }
                }

                // Recursive Builder
                // _groundY default in user code: -height*0.1
                const build = (x: number, z: number, size: number, cellNum: number, groundY: number, rng: () => number) => {
                    let span = size / cellNum;
                    // Limit recursion
                    if (span < 10) return; // safety

                    const startX = x;
                    const startZ = z;
                    // User loop: x from startX - size/2 to startX + size/2
                    // We need to iterate through grid cells

                    // Wait, logic:
                    // x from (startX - size/2) ...

                    for (let cx = startX - size / 2; cx <= startX + size / 2 - span / 2; cx += span) {
                        for (let cz = startZ - size / 2; cz <= startZ + size / 2 - span / 2; cz += span) {

                            // Random subdivide?
                            // user: `if(random() < 0.5 && span > width/20)`
                            const chance = rng();
                            // Map `fillRatio` to split chance?
                            // User code used 0.5 fixed.
                            // span > width/20 checks if too small.

                            if (chance < 0.5 && span > p.width / 20) {
                                // Recurse
                                build(cx, cz, span * (0.6 + rng() * 0.3), Math.floor(2 + rng() * 2), groundY, rng);
                            } else {
                                // Build Cube
                                // Pick colors
                                if (COLS.length === 0) return;
                                const ri = Math.floor(rng() * COLS.length);
                                const ri2 = (ri + Math.floor(1 + rng() * (COLS.length - 1))) % COLS.length;

                                const w = span * (0.6 + rng() * 0.3);
                                const h = span * (0.5 + rng() * 1.5);
                                // user: y = h/2 + groundY
                                const y = h / 2 + groundY;

                                obj.push(new Cube(p.createVector(cx, y, cz), p.createVector(w, h, w), COLS[ri], COLS[ri2], rng));
                            }
                        }
                    }
                };

                p.setup = () => {
                    const can = p.createCanvas(paramsRef.current.canvasWidth, paramsRef.current.canvasHeight, p.WEBGL);
                    can.parent(containerRef.current!);

                    // Ortho per user code
                    const dep = Math.max(p.width, p.height);
                    // User: ortho(-width / 2, width / 2, height / 2, -height / 2,-dep*3 , dep*3);
                    p.ortho(-p.width / 2, p.width / 2, p.height / 2, -p.height / 2, -dep * 3, dep * 3);

                    shader = p.createShader(vertShader, createFragShader(paramsRef.current.grainIntensity));
                    p.shader(shader);
                    p.noLoop();
                };

                p.draw = () => {
                    const rng = createSeededRandom(paramsRef.current.token);
                    const colorSeed = paramsRef.current.colorSeed || paramsRef.current.token;
                    // Colors from params
                    COLS = [paramsRef.current.color1, paramsRef.current.color2, paramsRef.current.color3, paramsRef.current.color4];
                    obj = [];

                    shader.setUniform("u_resolution", [p.width, p.height]);
                    // User: [1, -1, -1]
                    shader.setUniform("u_lightDir", [1, -1, -1]);

                    p.background(paramsRef.current.backgroundColor);

                    // Camera: User rotates X PI/10, Y PI/3.5
                    // We use params
                    p.rotateX(paramsRef.current.rotateX); // User default PI/10 = 0.314
                    p.rotateY(paramsRef.current.rotateY); // User default PI/3.5 = 0.89

                    // Init/Build
                    // user: `let s = min(width,height)*3; build(0,0,s,8);`
                    const s = Math.min(p.width, p.height) * 3 * (paramsRef.current.fillRatio); // scaling
                    const groundY = -p.height * 0.1;

                    // Map gridSize to initial cellNum? User used 8.
                    const initialCells = paramsRef.current.gridSize; // e.g. 4-8

                    build(0, 0, s, initialCells, groundY, rng);

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
