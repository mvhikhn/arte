/**
 * Schema Registry for v4 Token Compression
 * 
 * Defines the parameter structure for each artwork type,
 * enabling schema-based compression where we only store
 * non-default values in a positional format.
 */

// Provenance data structure
export interface ProvenanceData {
    creator: string;      // Customer's name
    timestamp: number;    // Unix timestamp
    location?: string;    // Optional location
    feeling: string;      // One-line artistic statement
    artist: string;       // Always "Mahi Khan"
    artworkType: string;  // e.g., "flow", "tree"
}

// Control types for generic UI generation
export type ControlType = 'range' | 'color' | 'boolean' | 'select' | 'text';

export interface ControlConfig {
    type: ControlType;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
    section?: string; // To group controls in the UI
}

// Schema definition type
interface ParamSchema {
    // Ordered list of param keys (for positional encoding)
    keys: string[];
    // Default values (params matching defaults are omitted)
    defaults: Record<string, any>;
    // UI Control definitions (optional, for generic controls)
    controls?: Record<string, ControlConfig>;
}

/**
 * Parameter schemas for each artwork type.
 * Keys are ordered - this order is used for positional encoding.
 * Only non-default values are included in the compressed token.
 */
export const PARAM_SCHEMAS: Record<string, ParamSchema> = {
    flow: {
        keys: [
            'numPoints', 'backgroundFade', 'scaleValue', 'noiseSpeed', 'movementDistance',
            'gaussianMean', 'gaussianStd', 'minIterations', 'maxIterations', 'circleSize',
            'strokeWeightMin', 'strokeWeightMax', 'angleMultiplier1', 'angleMultiplier2',
            'canvasWidth', 'canvasHeight', 'targetWidth', 'targetHeight',
            'color1', 'color2', 'color3', 'color4', 'color5',
            'exportWidth', 'exportHeight', 'isAnimating', 'token', 'colorSeed'
        ],
        defaults: {
            backgroundFade: 5,
            canvasWidth: 630,
            canvasHeight: 790,
            targetWidth: 800,
            targetHeight: 1000,
            exportWidth: 1600,
            exportHeight: 2000,
            isAnimating: true,
        },
        controls: {
            // Colors
            color1: { type: 'color', label: 'Color 1', section: 'Colors' },
            color2: { type: 'color', label: 'Color 2', section: 'Colors' },
            color3: { type: 'color', label: 'Color 3', section: 'Colors' },
            color4: { type: 'color', label: 'Color 4', section: 'Colors' },
            color5: { type: 'color', label: 'Color 5', section: 'Colors' },

            // Movement
            numPoints: { type: 'range', label: 'Density', min: 500, max: 5000, step: 100, section: 'Movement' },
            noiseSpeed: { type: 'range', label: 'Speed', min: 0.001, max: 0.05, step: 0.001, section: 'Movement' },
            movementDistance: { type: 'range', label: 'Flow', min: 0.5, max: 5, step: 0.1, section: 'Movement' },
            angleMultiplier1: { type: 'range', label: 'Chaos X', min: 0.1, max: 5, step: 0.1, section: 'Movement' },
            angleMultiplier2: { type: 'range', label: 'Chaos Y', min: 0.1, max: 5, step: 0.1, section: 'Movement' },

            // Style
            circleSize: { type: 'range', label: 'Particle Size', min: 0.5, max: 5, step: 0.1, section: 'Style' },
            backgroundFade: { type: 'range', label: 'Trails', min: 1, max: 50, step: 1, section: 'Style' },
            strokeWeightMin: { type: 'range', label: 'Min Stroke', min: 0.1, max: 5, step: 0.1, section: 'Style' },
            strokeWeightMax: { type: 'range', label: 'Max Stroke', min: 0.1, max: 5, step: 0.1, section: 'Style' },
        }
    },
    grid: {
        keys: [
            'backgroundColor', 'borderColor', 'color1', 'color2', 'color3', 'color4',
            'animationSpeed', 'maxDepth', 'minModuleSize', 'subdivideChance', 'crossSize',
            'minColumns', 'maxColumns', 'isAnimating', 'canvasWidth', 'canvasHeight',
            'token', 'colorSeed', 'exportWidth', 'exportHeight'
        ],
        defaults: {
            canvasWidth: 630,
            canvasHeight: 790,
            isAnimating: true,
            exportWidth: 1600,
            exportHeight: 2000,
        }
    },
    mosaic: {
        keys: [
            'color1', 'color2', 'color3', 'color4',
            'initialRectMinSize', 'initialRectMaxSize', 'gridDivisionChance', 'recursionChance',
            'minGridRows', 'maxGridRows', 'minGridCols', 'maxGridCols',
            'splitRatioMin', 'splitRatioMax', 'marginMultiplier', 'detailGridMin', 'detailGridMax',
            'noiseDensity', 'minRecursionSize', 'canvasWidth', 'canvasHeight',
            'token', 'colorSeed', 'exportWidth', 'exportHeight'
        ],
        defaults: {
            initialRectMaxSize: 1.00,
            canvasWidth: 630,
            canvasHeight: 790,
            exportWidth: 1600,
            exportHeight: 2000,
        }
    },
    rotated: {
        keys: [
            'color1', 'color2', 'color3', 'color4', 'backgroundColor',
            'cols', 'rows', 'minCellSize', 'maxCellSize', 'rotationRange',
            'shapeChance', 'fillChance', 'margin', 'isAnimating',
            'canvasWidth', 'canvasHeight', 'token', 'colorSeed', 'exportWidth', 'exportHeight'
        ],
        defaults: {
            canvasWidth: 630,
            canvasHeight: 790,
            isAnimating: true,
            exportWidth: 1600,
            exportHeight: 2000,
        }
    },
    tree: {
        keys: [
            'initialPaths', 'initialVelocity', 'branchProbability', 'diameterShrink', 'minDiameter',
            'bumpMultiplier', 'velocityRetention', 'speedMin', 'speedMax', 'finishedCircleSize',
            'strokeWeightMultiplier', 'stemColor1', 'stemColor2', 'stemColor3',
            'tipColor1', 'tipColor2', 'tipColor3', 'backgroundColor',
            'textContent', 'textEnabled', 'fontSize', 'textColor', 'textAlign', 'textX', 'textY',
            'lineHeight', 'fontFamily', 'fontUrl', 'customFontFamily', 'grainAmount',
            'canvasWidth', 'canvasHeight', 'token', 'exportWidth', 'exportHeight', 'isAnimating'
        ],
        defaults: {
            initialPaths: 2,
            initialVelocity: 10,
            branchProbability: 0.2,
            diameterShrink: 0.65,
            minDiameter: 0.3,
            bumpMultiplier: 0.2,
            velocityRetention: 0.77,
            speedMin: 5,
            speedMax: 10,
            finishedCircleSize: 12,
            strokeWeightMultiplier: 1.1,
            stemColor1: "#3d2817",
            stemColor2: "#4a3319",
            stemColor3: "#5c3d1f",
            tipColor1: "#e8c4a0",
            tipColor2: "#f0d4b8",
            tipColor3: "#d9b89a",
            backgroundColor: "#fafafa",
            textContent: "",
            textEnabled: false,
            fontSize: 24,
            textColor: "#333333",
            textAlign: 'center',
            textX: 400,
            textY: 50,
            lineHeight: 1.5,
            fontFamily: 'Georgia, serif',
            fontUrl: '',
            customFontFamily: '',
            grainAmount: 0,
            canvasWidth: 400,
            canvasHeight: 400,
            exportWidth: 1600,
            exportHeight: 2000,
            isAnimating: true,
        }
    },
    textdesign: {
        keys: [
            'text', 'fontSize', 'fontFamily', 'fontWeight', 'letterSpacing',
            'lineHeight', 'textColor', 'backgroundColor', 'textAlign',
            'canvasWidth', 'canvasHeight', 'token', 'exportWidth', 'exportHeight'
        ],
        defaults: {
            fontWeight: 400,
            letterSpacing: 0,
            lineHeight: 1.2,
            textAlign: 'center',
            canvasWidth: 630,
            canvasHeight: 790,
            exportWidth: 1600,
            exportHeight: 2000,
        }
    },
    text: {
        keys: [
            'text', 'fontSize', 'fontFamily', 'fontWeight', 'letterSpacing',
            'lineHeight', 'textColor', 'backgroundColor', 'textAlign',
            'canvasWidth', 'canvasHeight', 'token', 'exportWidth', 'exportHeight'
        ],
        defaults: {
            fontWeight: 400,
            letterSpacing: 0,
            lineHeight: 1.2,
            textAlign: 'center',
            canvasWidth: 630,
            canvasHeight: 790,
            exportWidth: 1600,
            exportHeight: 2000,
        }
    },
    lamb: {
        keys: [
            'cols', 'rows', 'wOff', 'hOff', 'noiseScale', 'lifeStep',
            'weiRangeMax', 'totalFrame', 'canvasWidth', 'canvasHeight',
            'token', 'isAnimating'
        ],
        defaults: {
            wOff: 200,
            hOff: 200,
            lifeStep: 0.005,
            totalFrame: 1000,
            canvasWidth: 1200,
            canvasHeight: 370,
            isAnimating: true,
        }
    }
};

/**
 * Get schema for an artwork type.
 * Falls back to empty schema if type is unknown.
 */
export const getSchema = (type: string): ParamSchema => {
    return PARAM_SCHEMAS[type] || { keys: [], defaults: {} };
};

/**
 * Check if a value equals the default (for stripping).
 * Handles arrays, objects, and primitives.
 */
export const isDefault = (value: any, defaultValue: any): boolean => {
    if (value === defaultValue) return true;
    if (typeof value !== typeof defaultValue) return false;
    if (Array.isArray(value) && Array.isArray(defaultValue)) {
        return JSON.stringify(value) === JSON.stringify(defaultValue);
    }
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value) === JSON.stringify(defaultValue);
    }
    return false;
};
