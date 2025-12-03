import { ArtworkParams } from "@/components/Artwork";
import { GridArtworkParams } from "@/components/GridArtwork";
import { MosaicArtworkParams } from "@/components/MosaicArtwork";
import { RotatedGridArtworkParams } from "@/components/RotatedGridArtwork";
import { TreeArtworkParams } from "@/components/TreeArtwork";
import { TextDesignArtworkParams } from "@/components/TextDesignArtwork";
import { ArtworkType } from "@/utils/token";

// Helper to encode/decode Base64 safe for URLs
const toBase64 = (str: string) => Buffer.from(str).toString('base64');
const fromBase64 = (str: string) => Buffer.from(str, 'base64').toString();

// Parameter Schemas (Order matters!)
// We map object values to an array to save space, then JSON stringify and Base64 encode.

// Flow Field Schema
const encodeFlowParams = (params: ArtworkParams): string => {
    const data = [
        params.numPoints,
        params.backgroundFade,
        params.scaleValue,
        params.noiseSpeed,
        params.movementDistance,
        params.gaussianMean,
        params.gaussianStd,
        params.minIterations,
        params.maxIterations,
        params.circleSize,
        params.strokeWeightMin,
        params.strokeWeightMax,
        params.angleMultiplier1,
        params.angleMultiplier2,
        params.color1,
        params.color2,
        params.color3,
        params.color4,
        params.color5,
        params.isAnimating ? 1 : 0,
        params.canvasWidth,
        params.canvasHeight,
        params.targetWidth,
        params.targetHeight,
        params.exportWidth,
        params.exportHeight
    ];
    return toBase64(JSON.stringify(data));
};

const decodeFlowParams = (encoded: string, token: string): Partial<ArtworkParams> => {
    try {
        const data = JSON.parse(fromBase64(encoded));
        return {
            numPoints: data[0],
            backgroundFade: data[1],
            scaleValue: data[2],
            noiseSpeed: data[3],
            movementDistance: data[4],
            gaussianMean: data[5],
            gaussianStd: data[6],
            minIterations: data[7],
            maxIterations: data[8],
            circleSize: data[9],
            strokeWeightMin: data[10],
            strokeWeightMax: data[11],
            angleMultiplier1: data[12],
            angleMultiplier2: data[13],
            color1: data[14],
            color2: data[15],
            color3: data[16],
            color4: data[17],
            color5: data[18],
            isAnimating: Boolean(data[19]),
            canvasWidth: data[20] || 630,
            canvasHeight: data[21] || 790,
            targetWidth: data[22] || 800,
            targetHeight: data[23] || 1000,
            exportWidth: data[24] || 1600,
            exportHeight: data[25] || 2000,
            token: token
        };
    } catch (e) {
        console.error("Failed to decode flow params", e);
        return {};
    }
};

// Grid Schema
const encodeGridParams = (params: GridArtworkParams): string => {
    const data = [
        params.backgroundColor,
        params.borderColor,
        params.color1,
        params.color2,
        params.color3,
        params.color4,
        params.animationSpeed,
        params.maxDepth,
        params.minModuleSize,
        params.subdivideChance,
        params.crossSize,
        params.minColumns,
        params.maxColumns,
        params.isAnimating ? 1 : 0,
        params.canvasWidth,
        params.canvasHeight,
        params.exportWidth,
        params.exportHeight
    ];
    return toBase64(JSON.stringify(data));
};

const decodeGridParams = (encoded: string, token: string): Partial<GridArtworkParams> => {
    try {
        const data = JSON.parse(fromBase64(encoded));
        return {
            backgroundColor: data[0],
            borderColor: data[1],
            color1: data[2],
            color2: data[3],
            color3: data[4],
            color4: data[5],
            animationSpeed: data[6],
            maxDepth: data[7],
            minModuleSize: data[8],
            subdivideChance: data[9],
            crossSize: data[10],
            minColumns: data[11],
            maxColumns: data[12],
            isAnimating: Boolean(data[13]),
            canvasWidth: data[14] || 630,
            canvasHeight: data[15] || 790,
            exportWidth: data[16] || 1600,
            exportHeight: data[17] || 2000,
            token: token
        };
    } catch (e) {
        console.error("Failed to decode grid params", e);
        return {};
    }
};

// Mosaic Schema
const encodeMosaicParams = (params: MosaicArtworkParams): string => {
    const data = [
        params.color1,
        params.color2,
        params.color3,
        params.color4,
        params.initialRectMinSize,
        params.initialRectMaxSize,
        params.gridDivisionChance,
        params.recursionChance,
        params.minGridRows,
        params.maxGridRows,
        params.minGridCols,
        params.maxGridCols,
        params.splitRatioMin,
        params.splitRatioMax,
        params.marginMultiplier,
        params.detailGridMin,
        params.detailGridMax,
        params.noiseDensity,
        params.minRecursionSize,
        params.canvasWidth,
        params.canvasHeight,
        params.exportWidth,
        params.exportHeight
    ];
    return toBase64(JSON.stringify(data));
};

const decodeMosaicParams = (encoded: string, token: string): Partial<MosaicArtworkParams> => {
    try {
        const data = JSON.parse(fromBase64(encoded));
        return {
            color1: data[0],
            color2: data[1],
            color3: data[2],
            color4: data[3],
            initialRectMinSize: data[4],
            initialRectMaxSize: data[5],
            gridDivisionChance: data[6],
            recursionChance: data[7],
            minGridRows: data[8],
            maxGridRows: data[9],
            minGridCols: data[10],
            maxGridCols: data[11],
            splitRatioMin: data[12],
            splitRatioMax: data[13],
            marginMultiplier: data[14],
            detailGridMin: data[15],
            detailGridMax: data[16],
            noiseDensity: data[17],
            minRecursionSize: data[18],
            canvasWidth: data[19] || 630,
            canvasHeight: data[20] || 790,
            exportWidth: data[21] || 1600,
            exportHeight: data[22] || 2000,
            token: token
        };
    } catch (e) {
        console.error("Failed to decode mosaic params", e);
        return {};
    }
};

// Rotated Grid Schema
const encodeRotatedGridParams = (params: RotatedGridArtworkParams): string => {
    const data = [
        params.color1,
        params.color2,
        params.color3,
        params.color4,
        params.backgroundColor,
        params.offsetRatio,
        params.marginRatio,
        params.minCellCount,
        params.maxCellCount,
        params.minRecursionSize,
        params.strokeWeight,
        params.canvasWidth,
        params.canvasHeight,
        params.exportWidth,
        params.exportHeight
    ];
    return toBase64(JSON.stringify(data));
};

const decodeRotatedGridParams = (encoded: string, token: string): Partial<RotatedGridArtworkParams> => {
    try {
        const data = JSON.parse(fromBase64(encoded));
        return {
            color1: data[0],
            color2: data[1],
            color3: data[2],
            color4: data[3],
            backgroundColor: data[4],
            offsetRatio: data[5],
            marginRatio: data[6],
            minCellCount: data[7],
            maxCellCount: data[8],
            minRecursionSize: data[9],
            strokeWeight: data[10],
            canvasWidth: data[11] || 630,
            canvasHeight: data[12] || 790,
            exportWidth: data[13] || 1600,
            exportHeight: data[14] || 2000,
            token: token
        };
    } catch (e) {
        console.error("Failed to decode rotated grid params", e);
        return {};
    }
};

// Tree Schema
const encodeTreeParams = (params: TreeArtworkParams): string => {
    const data = [
        params.initialPaths,
        params.initialVelocity,
        params.branchProbability,
        params.diameterShrink,
        params.minDiameter,
        params.bumpMultiplier,
        params.velocityRetention,
        params.speedMin,
        params.speedMax,
        params.finishedCircleSize,
        params.strokeWeightMultiplier,
        params.stemColor1,
        params.stemColor2,
        params.stemColor3,
        params.tipColor1,
        params.tipColor2,
        params.tipColor3,
        params.backgroundColor,
        params.grainAmount,
        params.isAnimating ? 1 : 0,
        params.canvasWidth,
        params.canvasHeight,
        params.exportWidth,
        params.exportHeight
    ];
    return toBase64(JSON.stringify(data));
};

const decodeTreeParams = (encoded: string, token: string): Partial<TreeArtworkParams> => {
    try {
        const data = JSON.parse(fromBase64(encoded));
        return {
            initialPaths: data[0],
            initialVelocity: data[1],
            branchProbability: data[2],
            diameterShrink: data[3],
            minDiameter: data[4],
            bumpMultiplier: data[5],
            velocityRetention: data[6],
            speedMin: data[7],
            speedMax: data[8],
            finishedCircleSize: data[9],
            strokeWeightMultiplier: data[10],
            stemColor1: data[11],
            stemColor2: data[12],
            stemColor3: data[13],
            tipColor1: data[14],
            tipColor2: data[15],
            tipColor3: data[16],
            backgroundColor: data[17],
            grainAmount: data[18],
            isAnimating: Boolean(data[19]),
            canvasWidth: data[20] || 630,
            canvasHeight: data[21] || 790,
            exportWidth: data[22] || 1600,
            exportHeight: data[23] || 2000,
            token: token
        };
    } catch (e) {
        console.error("Failed to decode tree params", e);
        return {};
    }
};

// Text Design Schema
// Complex object, we'll simplify by encoding layers as sub-arrays
const encodeTextDesignParams = (params: TextDesignArtworkParams): string => {
    const layer1 = [
        params.layer1.text, params.layer1.x, params.layer1.y, params.layer1.size,
        params.layer1.alignment, params.layer1.fill, params.layer1.extrudeDepth,
        params.layer1.extrudeX, params.layer1.extrudeY, params.layer1.extrudeStart,
        params.layer1.extrudeEnd, params.layer1.highlight, params.layer1.showHighlight ? 1 : 0,
        params.layer1.outlineThickness, params.layer1.outlineColor, params.layer1.fontUrl || ""
    ];
    const layer2 = [
        params.layer2.text, params.layer2.x, params.layer2.y, params.layer2.size,
        params.layer2.alignment, params.layer2.fill, params.layer2.extrudeDepth,
        params.layer2.extrudeX, params.layer2.extrudeY, params.layer2.extrudeStart,
        params.layer2.extrudeEnd, params.layer2.highlight, params.layer2.showHighlight ? 1 : 0,
        params.layer2.outlineThickness, params.layer2.outlineColor, params.layer2.fontUrl || ""
    ];
    const layer3 = [
        params.layer3.text, params.layer3.x, params.layer3.y, params.layer3.size,
        params.layer3.alignment, params.layer3.fill, params.layer3.extrudeDepth,
        params.layer3.extrudeX, params.layer3.extrudeY, params.layer3.extrudeStart,
        params.layer3.extrudeEnd, params.layer3.highlight, params.layer3.showHighlight ? 1 : 0,
        params.layer3.outlineThickness, params.layer3.outlineColor, params.layer3.fontUrl || ""
    ];

    const data = [
        params.backgroundColor,
        params.grainAmount,
        params.fontUrl,
        params.customFontFamily,
        params.canvasWidth,
        params.canvasHeight,
        params.exportWidth,
        params.exportHeight,
        layer1,
        layer2,
        layer3
    ];
    return toBase64(JSON.stringify(data));
};

const decodeTextDesignParams = (encoded: string, token: string): Partial<TextDesignArtworkParams> => {
    try {
        const data = JSON.parse(fromBase64(encoded));

        const mapLayer = (l: any) => ({
            text: l[0], x: l[1], y: l[2], size: l[3], alignment: l[4], fill: l[5],
            extrudeDepth: l[6], extrudeX: l[7], extrudeY: l[8], extrudeStart: l[9],
            extrudeEnd: l[10], highlight: l[11], showHighlight: Boolean(l[12]),
            outlineThickness: l[13], outlineColor: l[14], fontUrl: l[15] || undefined
        });

        return {
            backgroundColor: data[0],
            grainAmount: data[1],
            fontUrl: data[2],
            customFontFamily: data[3],
            canvasWidth: data[4] || 630,
            canvasHeight: data[5] || 790,
            exportWidth: data[6] || 1600,
            exportHeight: data[7] || 2000,
            layer1: mapLayer(data[8]),
            layer2: mapLayer(data[9]),
            layer3: mapLayer(data[10]),
            token: token
        };
    } catch (e) {
        console.error("Failed to decode text design params", e);
        return {};
    }
};

// Helper to calculate checksum from data
const calculateChecksum = (data: string): string => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data.charCodeAt(i);
    }
    return (sum % 65536).toString(16).padStart(4, '0');
};

// Main Export Functions
export const encodeParams = (type: ArtworkType, params: any): string => {
    let encoded = "";
    switch (type) {
        case 'flow': encoded = encodeFlowParams(params); break;
        case 'grid': encoded = encodeGridParams(params); break;
        case 'mosaic': encoded = encodeMosaicParams(params); break;
        case 'rotated': encoded = encodeRotatedGridParams(params); break;
        case 'tree': encoded = encodeTreeParams(params); break;
        case 'text': encoded = encodeTextDesignParams(params); break;
        // @ts-ignore - Handle legacy/alternate type name if needed
        case 'textdesign': encoded = encodeTextDesignParams(params); break;
    }

    // Calculate checksum from the encoded data
    const checksum = calculateChecksum(encoded);

    // Format: fx-[type]-v1-[encoded]-[checksum]
    // Note: We use 'text' for textdesign in tokens for brevity
    // @ts-ignore
    const typeStr = type === 'textdesign' ? 'text' : type;
    return `fx-${typeStr}-v1-${encoded}-${checksum}`;
};

export const decodeParams = (token: string): any => {
    // Token format: fx-[type]-v1-[encoded]-[checksum]
    const parts = token.split('-');

    // Support both old format (4 parts, no checksum) and new format (5 parts, with checksum)
    if (parts.length < 4 || parts[2] !== 'v1') {
        throw new Error('Invalid state token format');
    }

    const type = parts[1] as ArtworkType;
    const encoded = parts[3];

    // Validate checksum if present (5-part token)
    if (parts.length === 5) {
        const providedChecksum = parts[4];
        const calculatedChecksum = calculateChecksum(encoded);

        if (providedChecksum !== calculatedChecksum) {
            throw new Error('Token checksum mismatch - token may be corrupted or tampered with');
        }
    }

    try {
        switch (type) {
            case 'flow': return decodeFlowParams(encoded, token);
            case 'grid': return decodeGridParams(encoded, token);
            case 'mosaic': return decodeMosaicParams(encoded, token);
            case 'rotated': return decodeRotatedGridParams(encoded, token);
            case 'tree': return decodeTreeParams(encoded, token);
            case 'text': return decodeTextDesignParams(encoded, token);
        }
    } catch (e) {
        throw new Error(`Failed to decode artwork parameters: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    throw new Error(`Unknown artwork type: ${type}`);
};
