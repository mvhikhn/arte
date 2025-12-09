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

// Fragment shader with lighting and texture
const fragShader = `
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
  col += noise2 * 0.15;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface IsoCubeArtworkParams {
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    gridSize: number;
    cubeWidthMin: number;
    cubeWidthMax: number;
    cubeHeightMin: number;
    cubeHeightMax: number;
    rotateX: number;
    rotateY: number;
    windowDensity: number;
    rectWindowChance: number;
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

            // For WebGL, we need to capture the current frame
            const currentCanvas = p.canvas as HTMLCanvasElement;

            const centerArtwork = (targetWidth: number, targetHeight: number) => {
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = targetWidth;
                exportCanvas.height = targetHeight;
                const ctx = exportCanvas.getContext('2d');
                if (!ctx) return null;

                ctx.fillStyle = '#F5F5F5';
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

            // Desktop 6K
            const desktopCanvas = centerArtwork(6144, 3456);
            if (desktopCanvas) {
                const link = document.createElement('a');
                link.download = `isocube-desktop-wallpaper-${timestamp}.png`;
                link.href = desktopCanvas.toDataURL();
                link.click();
            }

            // iPhone
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
        params.color1,
        params.color2,
        params.color3,
        params.color4,
        params.gridSize,
        params.cubeWidthMin,
        params.cubeWidthMax,
        params.cubeHeightMin,
        params.cubeHeightMax,
        params.rotateX,
        params.rotateY,
        params.windowDensity,
        params.rectWindowChance,
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
                let cubes: any[] = [];

                // Cube class
                class Cube {
                    pos: any;
                    size: any;
                    tex: any;
                    col: string[];
                    spanMult: number;
                    topPos: any;
                    rectWindow: boolean;

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
                        this.spanMult = 1 + rng() * 2;
                        this.topPos = p.createVector(
                            _size.x * (rng() - 0.5) * 0.8,
                            0,
                            _size.z * (rng() - 0.5) * 0.8
                        );
                        this.rectWindow = rng() > (1 - paramsRef.current.rectWindowChance);
                        this.tex = p.createGraphics(_size.x * 2, _size.y * 2);
                    }

                    update(rng: () => number) {
                        this.tex.noStroke();
                        const margine = this.tex.width * 0.1;
                        const span = (this.tex.width - margine * 2) / 9;
                        this.tex.background(this.col[0]);
                        let i = 0;
                        this.tex.fill(this.col[1]);
                        for (let y = this.tex.height - margine * 1.5; y >= margine; y -= span * this.spanMult) {
                            for (let x = margine; x <= this.tex.width - margine; x += span) {
                                if (i % 2 === 0) {
                                    if (this.rectWindow) {
                                        this.tex.rect(x, y, span, span);
                                    } else {
                                        this.tex.ellipse(x, y, span, span);
                                    }
                                }
                                i++;
                            }
                        }
                    }

                    display() {
                        p.noStroke();
                        shader.setUniform("u_tex", this.tex);
                        p.push();
                        p.translate(this.pos);
                        p.box(this.size.x, this.size.y, this.size.z);
                        this.tex.background(this.col[1]);
                        p.translate(0, this.size.y * 0.525, 0);
                        p.box(this.size.x, this.size.y * 0.05, this.size.z);
                        this.tex.background(this.col[0]);
                        p.translate(this.topPos);
                        p.box(this.size.x * 0.1, this.size.y * 0.15, this.size.z * 0.1);
                        p.pop();
                    }
                }

                const initCubes = (rng: () => number, colorRng: () => number) => {
                    cubes = [];
                    const s = Math.min(p.width, p.height) * 0.6;
                    const gridSize = paramsRef.current.gridSize;
                    const span = s / gridSize;

                    const colors = [
                        paramsRef.current.color1,
                        paramsRef.current.color2,
                        paramsRef.current.color3,
                        paramsRef.current.color4,
                    ];

                    for (let x = -s / 2; x <= s / 2; x += span) {
                        for (let z = -s / 2; z <= s / 2; z += span) {
                            const ri = Math.floor(colorRng() * colors.length);
                            const ri2 = (ri + 1 + Math.floor(colorRng() * (colors.length - 1))) % colors.length;

                            const w = span * (paramsRef.current.cubeWidthMin + rng() * (paramsRef.current.cubeWidthMax - paramsRef.current.cubeWidthMin));
                            const h = span * (paramsRef.current.cubeHeightMin + rng() * (paramsRef.current.cubeHeightMax - paramsRef.current.cubeHeightMin));
                            const y = h / 2 - p.height * 0.1;

                            cubes.push(new Cube(
                                p.createVector(x, y, z),
                                p.createVector(w, h, w),
                                colors[ri],
                                colors[ri2],
                                rng
                            ));
                        }
                    }
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

                    shader = p.createShader(vertShader, fragShader);
                    p.shader(shader);
                    shader.setUniform("u_resolution", [p.width, p.height]);
                    shader.setUniform("u_lightDir", [1, -1, -1]);

                    p.noLoop();
                };

                p.draw = () => {
                    const seed = tokenToSeed(paramsRef.current.token);
                    const rng = createSeededRandom(paramsRef.current.token);
                    const colorSeed = paramsRef.current.colorSeed || paramsRef.current.token;
                    const colorRng = createSeededRandom(colorSeed);

                    initCubes(rng, colorRng);

                    p.background(245);
                    p.rotateX(paramsRef.current.rotateX);
                    p.rotateY(paramsRef.current.rotateY);

                    for (const cube of cubes) {
                        cube.update(rng);
                        cube.display();
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
    }, [params.token, params.canvasWidth, params.canvasHeight]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center"
        />
    );
});

IsoCubeArtwork.displayName = "IsoCubeArtwork";

export default IsoCubeArtwork;
