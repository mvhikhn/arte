"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export interface BlueMoodArtworkParams {
  // Color palettes
  color1_1: string;
  color1_2: string;
  color1_3: string;
  color1_4: string;
  color1_5: string;
  color2_1: string;
  color2_2: string;
  color2_3: string;
  color2_4: string;
  color2_5: string;
  colorBg1: string;
  colorBg2: string;
  colorBg3: string;
  
  // Wave parameters
  ranges: number;
  strokeWeight: number;
  animationSpeed: number;
  waveHeight: number;
  waveAmplitude: number;
  noiseScale: number;
  
  // Pattern parameters
  patternDepth: number;
  patternDivisions: number;
  shadowBlur: number;
  shadowOffset: number;
  
  // Frame parameters
  margin: number;
  
  // Technical
  seed: number;
  exportWidth: number;
  exportHeight: number;
  isAnimating: boolean;
}

export interface BlueMoodArtworkRef {
  exportImage: () => void;
  exportGif: (duration: number, fps: number) => Promise<void>;
  toggleAnimation: () => void;
  regenerate: () => void;
}

interface BlueMoodArtworkProps {
  params: BlueMoodArtworkParams;
}

const BlueMoodArtwork = forwardRef<BlueMoodArtworkRef, BlueMoodArtworkProps>(
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
              a.download = `blue-mood-arte-${Date.now()}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          });
        }
      },
      exportGif: async (duration: number, fps: number) => {
        if (!sketchRef.current) return;
        try {
          const filename = `blue-mood-arte-${Date.now()}.gif`;
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
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      let cancelled = false;

      const initSketch = async () => {
        if (sketchRef.current) {
          sketchRef.current.remove();
          sketchRef.current = null;
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        const p5Module = await import("p5");
        const p5 = p5Module.default;

        if (cancelled || !containerRef.current) return;

        // Shader code
        const frag_functions_default = `
  #define PI 3.141592653589793
  #define TAU 6.283185307179586
	
	float rand(vec2 c){
		return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
	}

	mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
	}

	mat2 scale2d(vec2 _scale){
			return mat2(_scale.x,0.0,
									0.0,_scale.y);
	}

	vec2 tile (vec2 _st, float _zoom) {
			_st *= _zoom;
			return fract(_st);
	}

	//	Classic Perlin 3D Noise 
	//	by Stefan Gustavson

	vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
	vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
	vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

	float cnoise(vec3 P){
		vec3 Pi0 = floor(P); // Integer part for indexing
		vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
		Pi0 = mod(Pi0, 289.0);
		Pi1 = mod(Pi1, 289.0);
		vec3 Pf0 = fract(P); // Fractional part for interpolation
		vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
		vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
		vec4 iy = vec4(Pi0.yy, Pi1.yy);
		vec4 iz0 = Pi0.zzzz;
		vec4 iz1 = Pi1.zzzz;

		vec4 ixy = permute(permute(ix) + iy);
		vec4 ixy0 = permute(ixy + iz0);
		vec4 ixy1 = permute(ixy + iz1);

		vec4 gx0 = ixy0 / 7.0;
		vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
		gx0 = fract(gx0);
		vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
		vec4 sz0 = step(gz0, vec4(0.0));
		gx0 -= sz0 * (step(0.0, gx0) - 0.5);
		gy0 -= sz0 * (step(0.0, gy0) - 0.5);

		vec4 gx1 = ixy1 / 7.0;
		vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
		gx1 = fract(gx1);
		vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
		vec4 sz1 = step(gz1, vec4(0.0));
		gx1 -= sz1 * (step(0.0, gx1) - 0.5);
		gy1 -= sz1 * (step(0.0, gy1) - 0.5);

		vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
		vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
		vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
		vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
		vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
		vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
		vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
		vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

		vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
		g000 *= norm0.x;
		g010 *= norm0.y;
		g100 *= norm0.z;
		g110 *= norm0.w;
		vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
		g001 *= norm1.x;
		g011 *= norm1.y;
		g101 *= norm1.z;
		g111 *= norm1.w;

		float n000 = dot(g000, Pf0);
		float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
		float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
		float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
		float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
		float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
		float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
		float n111 = dot(g111, Pf1);

		vec3 fade_xyz = fade(Pf0);
		vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
		vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
		float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
		return 2.2 * n_xyz;
	}
	
	
float noise(vec2 p, float freq ){
	float unit = 1./freq;
	vec2 ij = floor(p/unit);
	vec2 xy = mod(p,unit)/unit;
	//xy = 3.*xy*xy-2.*xy*xy*xy;
	xy = .5*(1.-cos(PI*xy));
	float a = rand((ij+vec2(0.,0.)));
	float b = rand((ij+vec2(1.,0.)));
	float c = rand((ij+vec2(0.,1.)));
	float d = rand((ij+vec2(1.,1.)));
	float x1 = mix(a, b, xy.x);
	float x2 = mix(c, d, xy.x);
	return mix(x1, x2, xy.y);
}

	
	float pNoise(vec2 p, int res){
		// p+=u_noise_pan;
		float persistance = .5;
		float n = 0.;
		float normK = 0.;
		float f = 4.;
		float amp = 1.;
		int iCount = 0;
		//noprotect
		for (int i = 0; i<50; i++){
			n+=amp*noise(p, f);
			f*=2.;
			normK+=amp;
			amp*=persistance;
			if (iCount == res) break;
			iCount++;
		}
		float nf = n/normK;
		return nf*nf*nf*nf;
	}

	vec2 random2( vec2 p ) {
			return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
	}

`;

        const vert = `
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
		uniform float u_time;


    void main() {
      vec3 pos = aPosition;
			vec4 posOut = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
      gl_Position = posOut;

      // set out value
      var_vertPos      = pos;
      var_vertNormal   =  aNormal;
      var_vertTexCoord = aTexCoord;
			var_centerGlPosition = uProjectionMatrix * uModelViewMatrix * vec4(0., 0., 0.,1.0);
    }
`;

        const frag = `
	precision highp float;

	uniform vec2 u_resolution;
	uniform vec2 u_mouse;
	uniform float u_time;
	uniform vec3 u_lightDir;
	uniform vec3 u_col;
	uniform mat3 uNormalMatrix;
	uniform float u_pixelDensity;
	uniform sampler2D u_tex;

	//attributes, in
	varying vec4 var_centerGlPosition;
	varying vec3 var_vertNormal;
	varying vec2 var_vertTexCoord;

	${frag_functions_default}

	void main(){
		vec2 st = var_vertTexCoord.xy / u_resolution; 

    st.x += cnoise( vec3(st*2., 1.) )/50.0;  
    st.y += cnoise( vec3(st*5., 1.) )/50.0;  
		
		st.x += pNoise( st, 5 );
		st.y += pNoise( st, 5 );
			
		vec3 color = vec3(0.);
		vec4 texColor = texture2D(u_tex, st);
		
		
		
		gl_FragColor= vec4(color,1.0)+texColor;
	}
`;

        const sketch = (p: any) => {
          let mySize: number;
          let plus: number;
          let colors1: string[];
          let colors2: string[];
          let colorsbg: string[];
          let colorselet: string[];
          let webGLCanvas: any;
          let originalGraphics: any;
          let theShader: any;
          let overAllTexture: any;
          let hasLooped = false;

          p.preload = () => {
            // Shader will be created in setup
          };

          p.setup = () => {
            p.pixelDensity(1);
            p.randomSeed(paramsRef.current.seed);
            p.noiseSeed(paramsRef.current.seed);
            
            mySize = 800; // Fixed size for consistency
            const canvas = p.createCanvas(800, 1000);
            canvas.parent(containerRef.current!);
            
            webGLCanvas = p.createGraphics(p.width, p.height, p.WEBGL);
            originalGraphics = p.createGraphics(p.width, p.height);
            
            // Create shader
            theShader = webGLCanvas.createShader(vert, frag);

            plus = 0;
            hasLooped = false;
            
            // Setup colors from params
            colors1 = [
              paramsRef.current.color1_1,
              paramsRef.current.color1_2,
              paramsRef.current.color1_3,
              paramsRef.current.color1_4,
              paramsRef.current.color1_5,
            ];
            
            colors2 = [
              paramsRef.current.color2_1,
              paramsRef.current.color2_2,
              paramsRef.current.color2_3,
              paramsRef.current.color2_4,
              paramsRef.current.color2_5,
            ];
            
            colorsbg = [
              paramsRef.current.colorBg1,
              paramsRef.current.colorBg2,
              paramsRef.current.colorBg3,
            ];
            
            colorselet = [
              p.random(colors2),
              p.random(colors2),
              p.random(colors1),
              p.random(colors2),
              p.random(colors2),
            ];
            
            p.background(p.random(colorsbg));
            makeFilter(p);
            
            if (!paramsRef.current.isAnimating) {
              p.noLoop();
            }
          };

          p.draw = () => {
            p.randomSeed(paramsRef.current.seed);
            p.noiseSeed(paramsRef.current.seed);

            webGLCanvas.shader(theShader);
            theShader.setUniform("u_resolution", [1.0, 1.0]);
            theShader.setUniform("u_time", p.millis() / 1000);
            theShader.setUniform("u_mouse", [p.mouseX / p.width, p.mouseY / p.height]);
            theShader.setUniform("u_tex", originalGraphics);
            webGLCanvas.clear();

            webGLCanvas.rect(-p.width / 2, -p.height / 2, p.width, p.height);
            
            let H = 1 * p.random(0.25, 0.75) * paramsRef.current.waveHeight;
            let aa = 1 * p.random(1, 0.8) * paramsRef.current.waveAmplitude;
            let res = p.random(1, 5) * paramsRef.current.animationSpeed;

            originalGraphics.noFill();
            originalGraphics.strokeWeight(paramsRef.current.strokeWeight);

            for (let j = 0; j < 4; j++) {
              originalGraphics.push();
              originalGraphics.translate(0, -p.height + j * (p.height / 3));
              p.randomSeed(paramsRef.current.seed * (j + 1));
              p.noiseSeed(paramsRef.current.seed * (j + 1));
              
              for (let i = 0; i < paramsRef.current.ranges; i++) {
                originalGraphics.stroke(p.random(colorselet));
                originalGraphics.drawingContext.shadowColor = p.random(colors2);
                originalGraphics.drawingContext.shadowOffsetX = paramsRef.current.shadowOffset;
                originalGraphics.drawingContext.shadowOffsetY = paramsRef.current.shadowOffset;
                originalGraphics.drawingContext.shadowBlur = paramsRef.current.shadowBlur;

                originalGraphics.beginShape();

                for (let x = -p.width * 1; x < p.width * 2; x += 10) {
                  let n = p.noise(x * paramsRef.current.noiseScale, i * 0.01, p.frameCount * res);
                  let y = p.map(n, 0, 1, p.height * aa, p.height * H);
                  originalGraphics.curveVertex(x + 1 * (plus - 5), y - plus);
                }
                originalGraphics.endShape();
              }
              originalGraphics.pop();
            }

            p.image(webGLCanvas, 0, 0);
            
            if (plus > -p.height / 2) {
              plus -= 10 * p.random(0.05, 0.15);
              p.image(overAllTexture, 0, 0);
            } else {
              if (!hasLooped) {
                originalGraphics.strokeWeight(p.random(0.1, 0.05));
                originalGraphics.stroke(p.random(colors2) + "1a");
                originalGraphics.noFill();
                originalGraphics.drawingContext.setLineDash([1, 1, 1, 1]);
                drawOverPattern(p);
                
                // Frame
                p.noFill();
                p.stroke("#202020");
                p.strokeWeight(paramsRef.current.margin);
                p.rect(0, 0, p.width, p.height);
                
                hasLooped = true;
                p.noLoop(); // Stop after animation completes
              }
            }
          };

          const makeFilter = (p: any) => {
            p.randomSeed(paramsRef.current.seed);
            p.colorMode(p.HSB, 360, 100, 100, 100);
            overAllTexture = p.createGraphics(p.width, p.height);
            overAllTexture.loadPixels();
            for (let i = 0; i < p.width; i++) {
              for (let j = 0; j < p.height; j++) {
                overAllTexture.set(
                  i,
                  j,
                  p.color(0, 10, 70, p.noise(i / 3, j / 3, (i * j) / 50) * p.random(10, 25))
                );
              }
            }
            overAllTexture.updatePixels();
            p.colorMode(p.RGB, 255, 255, 255, 255);
          };

          const drawOverPattern = (p: any) => {
            p.push();
            p.translate(p.width / 2, p.height / 2);
            p.rotate(-p.PI / 2);

            let s = (mySize / 2) * p.sqrt(3) - 2;
            let n = paramsRef.current.patternDepth;

            for (let theta = 0; theta < p.TWO_PI; theta += p.TWO_PI / paramsRef.current.patternDivisions) {
              divideOP(
                p,
                0,
                0,
                s * p.cos(theta),
                s * p.sin(theta),
                s * p.cos(theta + p.TWO_PI / paramsRef.current.patternDivisions),
                s * p.sin(theta + p.TWO_PI / paramsRef.current.patternDivisions),
                n
              );
            }
            p.pop();
          };

          const prop = (x1: number, y1: number, x2: number, y2: number, k: number) => {
            let x3 = (1 - k) * x1 + k * x2;
            let y3 = (1 - k) * y1 + k * y2;
            return [x3, y3];
          };

          const divideOP = (
            p: any,
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            x3: number,
            y3: number,
            n: number
          ) => {
            if (n > 1) {
              let [xA, yA] = prop(x1, y1, x2, y2, 1 / 3);
              let [xB, yB] = prop(x1, y1, x2, y2, 2 / 3);
              let [xC, yC] = prop(x2, y2, x3, y3, 1 / 3);
              let [xD, yD] = prop(x2, y2, x3, y3, 2 / 3);
              let [xE, yE] = prop(x3, y3, x1, y1, 1 / 3);
              let [xF, yF] = prop(x3, y3, x1, y1, 2 / 3);
              let [xG, yG] = prop(xF, yF, xC, yC, 1 / 2);
              divideOP(p, x1, y1, xA, yA, xF, yF, n - 1);
              divideOP(p, xA, yA, xB, yB, xG, yG, n - 1);
              divideOP(p, xB, yB, x2, y2, xC, yC, n - 1);
              divideOP(p, xG, yG, xF, yF, xA, yA, n - 1);
              divideOP(p, xC, yC, xG, yG, xB, yB, n - 1);
              divideOP(p, xF, yF, xG, yG, xE, yE, n - 1);
              divideOP(p, xG, yG, xC, yC, xD, yD, n - 1);
              divideOP(p, xD, yD, xE, yE, xG, yG, n - 1);
              divideOP(p, xE, yE, xD, yD, x3, y3, n - 1);
            } else {
              makeTriangle(p, [x1, y1], [x2, y2], [x3, y3]);
            }
          };

          const makeTriangle = (p: any, v1: number[], v2: number[], v3: number[]) => {
            let points = p.shuffle([v1, v2, v3]);
            let [x1, y1] = points[0];
            let [x2, y2] = points[1];
            let [x3, y3] = points[2];
            let iStep = 1 / p.pow(2, p.floor(p.random(4, 2)));
            for (let i = 0; i < 1; i += iStep) {
              let [x4, y4] = prop(x1, y1, x2, y2, 1 - i);
              let [x5, y5] = prop(x1, y1, x3, y3, 1 - i);
              p.triangle(x1, y1, x4, y4, x5, y5);
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
    }, [params.seed]);

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      />
    );
  }
);

BlueMoodArtwork.displayName = "BlueMoodArtwork";

export default BlueMoodArtwork;
