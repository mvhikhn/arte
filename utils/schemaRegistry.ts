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

            // Canvas
            canvasWidth: { type: 'range', label: 'Width', min: 400, max: 2000, step: 10, section: 'Canvas' },
            canvasHeight: { type: 'range', label: 'Height', min: 400, max: 2000, step: 10, section: 'Canvas' },
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
        },
        controls: {
            // Grid Settings
            minColumns: { type: 'range', label: 'Min Columns', min: 3, max: 8, step: 1, section: 'Grid Settings' },
            maxColumns: { type: 'range', label: 'Max Columns', min: 6, max: 12, step: 1, section: 'Grid Settings' },
            minModuleSize: { type: 'range', label: 'Min Module', min: 20, max: 100, step: 1, section: 'Grid Settings' },
            maxDepth: { type: 'range', label: 'Max Depth', min: 1, max: 4, step: 1, section: 'Grid Settings' },
            subdivideChance: { type: 'range', label: 'Subdivide', min: 0, max: 1, step: 0.01, section: 'Grid Settings' },

            // Animation
            animationSpeed: { type: 'range', label: 'Speed', min: 0.001, max: 0.15, step: 0.001, section: 'Animation' },
            crossSize: { type: 'range', label: 'Cross Size', min: 0.3, max: 1, step: 0.01, section: 'Animation' },

            // Colors
            backgroundColor: { type: 'color', label: 'Background', section: 'Colors' },
            borderColor: { type: 'color', label: 'Border', section: 'Colors' },
            color1: { type: 'color', label: 'Color 1', section: 'Colors' },
            color2: { type: 'color', label: 'Color 2', section: 'Colors' },
            color3: { type: 'color', label: 'Color 3', section: 'Colors' },
            color4: { type: 'color', label: 'Color 4', section: 'Colors' },

            // Canvas
            canvasWidth: { type: 'range', label: 'Width', min: 400, max: 2000, step: 10, section: 'Canvas' },
            canvasHeight: { type: 'range', label: 'Height', min: 400, max: 2000, step: 10, section: 'Canvas' },
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
        },
        controls: {
            // Initial Rectangle
            initialRectMinSize: { type: 'range', label: 'Min Size', min: 0.2, max: 0.8, step: 0.01, section: 'Initial Rectangle' },
            initialRectMaxSize: { type: 'range', label: 'Max Size', min: 0.4, max: 1, step: 0.01, section: 'Initial Rectangle' },

            // Division
            gridDivisionChance: { type: 'range', label: 'Grid Chance', min: 0, max: 1, step: 0.01, section: 'Division' },
            recursionChance: { type: 'range', label: 'Recursion', min: 0, max: 1, step: 0.01, section: 'Division' },
            minRecursionSize: { type: 'range', label: 'Min Size', min: 20, max: 100, step: 1, section: 'Division' },

            // Grid Settings
            minGridRows: { type: 'range', label: 'Min Rows', min: 2, max: 6, step: 1, section: 'Grid Settings' },
            maxGridRows: { type: 'range', label: 'Max Rows', min: 3, max: 10, step: 1, section: 'Grid Settings' },
            minGridCols: { type: 'range', label: 'Min Cols', min: 2, max: 6, step: 1, section: 'Grid Settings' },
            maxGridCols: { type: 'range', label: 'Max Cols', min: 3, max: 10, step: 1, section: 'Grid Settings' },

            // Details
            splitRatioMin: { type: 'range', label: 'Split Min', min: 0.1, max: 0.4, step: 0.01, section: 'Details' },
            splitRatioMax: { type: 'range', label: 'Split Max', min: 0.6, max: 0.9, step: 0.01, section: 'Details' },
            marginMultiplier: { type: 'range', label: 'Margin', min: 0.05, max: 0.3, step: 0.001, section: 'Details' },
            detailGridMin: { type: 'range', label: 'Detail Min', min: 2, max: 4, step: 1, section: 'Details' },
            detailGridMax: { type: 'range', label: 'Detail Max', min: 3, max: 6, step: 1, section: 'Details' },
            noiseDensity: { type: 'range', label: 'Noise', min: 0, max: 0.3, step: 0.001, section: 'Details' },

            // Colors
            color1: { type: 'color', label: 'Color 1', section: 'Colors' },
            color2: { type: 'color', label: 'Color 2', section: 'Colors' },
            color3: { type: 'color', label: 'Color 3', section: 'Colors' },
            color4: { type: 'color', label: 'Color 4', section: 'Colors' },

            // Canvas
            canvasWidth: { type: 'range', label: 'Width', min: 400, max: 2000, step: 10, section: 'Canvas' },
            canvasHeight: { type: 'range', label: 'Height', min: 400, max: 2000, step: 10, section: 'Canvas' },
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
        },
        controls: {
            // Layout
            offsetRatio: { type: 'range', label: 'Offset', min: 0.01, max: 0.15, step: 0.001, section: 'Layout' },
            marginRatio: { type: 'range', label: 'Margin', min: 0.1, max: 0.5, step: 0.01, section: 'Layout' },

            // Grid Settings
            minCellCount: { type: 'range', label: 'Min Cells', min: 2, max: 4, step: 1, section: 'Grid Settings' },
            maxCellCount: { type: 'range', label: 'Max Cells', min: 3, max: 6, step: 1, section: 'Grid Settings' },
            minRecursionSize: { type: 'range', label: 'Min Size', min: 0.03, max: 0.15, step: 0.001, section: 'Grid Settings' },

            // Style
            strokeWeight: { type: 'range', label: 'Stroke', min: 0.5, max: 4, step: 0.1, section: 'Style' },

            // Colors
            backgroundColor: { type: 'color', label: 'Background', section: 'Colors' },
            color1: { type: 'color', label: 'Color 1', section: 'Colors' },
            color2: { type: 'color', label: 'Color 2', section: 'Colors' },
            color3: { type: 'color', label: 'Color 3', section: 'Colors' },
            color4: { type: 'color', label: 'Color 4', section: 'Colors' },

            // Canvas
            canvasWidth: { type: 'range', label: 'Width', min: 400, max: 2000, step: 10, section: 'Canvas' },
            canvasHeight: { type: 'range', label: 'Height', min: 400, max: 2000, step: 10, section: 'Canvas' },
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
        },
        controls: {
            // Tree Structure
            initialPaths: { type: 'range', label: 'Initial Branches', min: 1, max: 5, step: 1, section: 'Tree Structure' },
            initialVelocity: { type: 'range', label: 'Initial Velocity', min: 5, max: 20, step: 0.5, section: 'Tree Structure' },
            branchProbability: { type: 'range', label: 'Branch Probability', min: 0.05, max: 0.4, step: 0.01, section: 'Tree Structure' },
            diameterShrink: { type: 'range', label: 'Diameter Shrink', min: 0.5, max: 0.8, step: 0.01, section: 'Tree Structure' },
            minDiameter: { type: 'range', label: 'Min Diameter', min: 0.1, max: 1.0, step: 0.05, section: 'Tree Structure' },

            // Movement
            bumpMultiplier: { type: 'range', label: 'Bump Strength', min: 0.1, max: 0.5, step: 0.01, section: 'Movement' },
            velocityRetention: { type: 'range', label: 'Velocity Retention', min: 0.5, max: 0.95, step: 0.01, section: 'Movement' },
            speedMin: { type: 'range', label: 'Speed Min', min: 3, max: 8, step: 0.5, section: 'Movement' },
            speedMax: { type: 'range', label: 'Speed Max', min: 8, max: 15, step: 0.5, section: 'Movement' },

            // Visual
            finishedCircleSize: { type: 'range', label: 'Tip Circle Size', min: 5, max: 20, step: 0.5, section: 'Visual' },
            strokeWeightMultiplier: { type: 'range', label: 'Stroke Weight', min: 0.5, max: 2.0, step: 0.05, section: 'Visual' },
            grainAmount: { type: 'range', label: 'Grain Amount', min: 0, max: 50, step: 1, section: 'Global Settings' },

            // Colors
            backgroundColor: { type: 'color', label: 'Background', section: 'Colors' },
            stemColor1: { type: 'color', label: 'Stem Color 1', section: 'Colors' },
            stemColor2: { type: 'color', label: 'Stem Color 2', section: 'Colors' },
            stemColor3: { type: 'color', label: 'Stem Color 3', section: 'Colors' },
            tipColor1: { type: 'color', label: 'Tip Color 1', section: 'Colors' },
            tipColor2: { type: 'color', label: 'Tip Color 2', section: 'Colors' },
            tipColor3: { type: 'color', label: 'Tip Color 3', section: 'Colors' },

            // Text Overlay (Simplified)
            textEnabled: { type: 'boolean', label: 'Enable Text', section: 'Text Overlay' },
            textContent: { type: 'text', label: 'Text Content', section: 'Text Overlay' },
            fontSize: { type: 'range', label: 'Font Size', min: 10, max: 100, step: 1, section: 'Text Overlay' },
            textColor: { type: 'color', label: 'Text Color', section: 'Text Overlay' },
            textX: { type: 'range', label: 'Position X', min: 0, max: 800, step: 10, section: 'Text Overlay' },
            textY: { type: 'range', label: 'Position Y', min: 0, max: 800, step: 10, section: 'Text Overlay' },

            // Canvas
            canvasWidth: { type: 'range', label: 'Width', min: 400, max: 2000, step: 10, section: 'Canvas' },
            canvasHeight: { type: 'range', label: 'Height', min: 400, max: 2000, step: 10, section: 'Canvas' },
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
        },
        controls: {
            // Grid Settings
            cols: { type: 'range', label: 'Columns', min: 10, max: 200, step: 10, section: 'Grid Settings' },
            rows: { type: 'range', label: 'Rows', min: 10, max: 200, step: 10, section: 'Grid Settings' },

            // Physics
            noiseScale: { type: 'range', label: 'Noise Scale', min: 0.001, max: 0.05, step: 0.001, section: 'Physics' },
            lifeStep: { type: 'range', label: 'Life Step', min: 0.001, max: 0.02, step: 0.001, section: 'Physics' },
            weiRangeMax: { type: 'range', label: 'Weight Range', min: 4, max: 512, step: 4, section: 'Physics' },

            // Layout
            wOff: { type: 'range', label: 'Width Offset', min: 0, max: 500, step: 10, section: 'Layout' },
            hOff: { type: 'range', label: 'Height Offset', min: 0, max: 500, step: 10, section: 'Layout' },

            // Canvas
            canvasWidth: { type: 'range', label: 'Width', min: 400, max: 2000, step: 10, section: 'Canvas' },
            canvasHeight: { type: 'range', label: 'Height', min: 400, max: 2000, step: 10, section: 'Canvas' },
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
