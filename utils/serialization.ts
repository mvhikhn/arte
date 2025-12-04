import { ArtworkParams } from "@/components/Artwork";
import { GridArtworkParams } from "@/components/GridArtwork";
import { MosaicArtworkParams } from "@/components/MosaicArtwork";
import { RotatedGridArtworkParams } from "@/components/RotatedGridArtwork";
import { TreeArtworkParams } from "@/components/TreeArtwork";
import { TextDesignArtworkParams } from "@/components/TextDesignArtwork";
import { ArtworkType } from "@/utils/token";

// Helper to encode/decode Base64 safe for URLs
const toBase64 = (str: string) => {
    if (typeof window === 'undefined') {
        return Buffer.from(str).toString('base64');
    } else {
        return window.btoa(str);
    }
};

const fromBase64 = (str: string) => {
    if (typeof window === 'undefined') {
        return Buffer.from(str, 'base64').toString();
    } else {
        return window.atob(str);
    }
};

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
        params.exportHeight,
        params.exportHeight,
        params.token, // Add token (seed) to data
        params.colorSeed // Add colorSeed
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
            token: data[26] || token, // Use encoded seed if present, else fallback to v1 token
            colorSeed: data[27] // Optional colorSeed
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
        params.exportHeight,
        params.token, // Add token (seed)
        params.colorSeed // Add colorSeed
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
            token: data[18] || token, // Use encoded seed
            colorSeed: data[19]
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
        params.exportHeight,
        params.token, // Add token (seed)
        params.colorSeed // Add colorSeed
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
            token: data[23] || token, // Use encoded seed
            colorSeed: data[24]
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
        params.exportHeight,
        params.token, // Add token (seed)
        params.colorSeed // Add colorSeed
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
            token: data[15] || token, // Use encoded seed
            colorSeed: data[16]
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
        params.exportHeight,
        params.token, // Add token (seed)
        params.colorSeed // Add colorSeed
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
            token: data[24] || token, // Use encoded seed
            colorSeed: data[25]
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
        layer3,
        params.token, // Add token (seed)
        params.colorSeed // Add colorSeed
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

        // Detect OLD token format (14 elements with layer2 duplicated)
        // vs NEW token format (13 elements, correct)
        // OLD: [bg, grain, ..., layer1(8), layer2(9), layer2-dup(10), layer3(11), token(12), colorSeed(13)]
        // NEW: [bg, grain, ..., layer1(8), layer2(9), layer3(10), token(11), colorSeed(12)]
        // Detection: If data[11] is an array, it's OLD format (layer3 was at index 11)
        const isOldFormat = Array.isArray(data[11]);

        if (isOldFormat) {
            // OLD FORMAT: data has 14 elements
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
                // Skip data[10] (duplicate of layer2)
                layer3: mapLayer(data[11]), // Actual layer3 in old format
                token: typeof data[12] === 'string' ? data[12] : token,
                colorSeed: data[13]
            };
        } else {
            // NEW FORMAT: data has 13 elements
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
                token: typeof data[11] === 'string' ? data[11] : token,
                colorSeed: data[12]
            };
        }
    } catch (e) {
        console.error("Failed to decode text design params", e);
        return {};
    }
};

// Encryption Key (Simple obfuscation)
const ENCRYPTION_KEY = "ARTE_SECURE_2024";

// Simple XOR encryption/decryption
const xorCipher = (text: string): string => {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return result;
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

    // Encrypt the encoded string (which is Base64)
    // We encrypt the Base64 string to keep it text-safe, then re-Base64 or just use it?
    // Wait, encode...Params returns Base64.
    // If we encrypt Base64, we get binary-looking string.
    // We should encrypt the JSON string inside encode...Params?
    // No, encode...Params is already defined.

    // Let's encrypt the Base64 string.
    // Result is binary-looking.
    // We need to Base64 encode the result of encryption to make it URL safe.

    // Better: Encrypt the raw JSON in encode...Params?
    // Too invasive.

    // Let's just encrypt the 'encoded' string (which is Base64).
    const encrypted = xorCipher(encoded);
    // Prefix with ENC: to identify
    const finalData = "ENC:" + toBase64(encrypted);

    // Calculate checksum from the FINAL data
    const checksum = calculateChecksum(finalData);

    // Format: fx-[type]-v1-[finalData]-[checksum]
    // @ts-ignore
    const typeStr = type === 'textdesign' ? 'text' : type;
    return `fx-${typeStr}-v1-${finalData}-${checksum}`;
};

export const decodeParams = (token: string): any => {
    // Token format: fx-[type]-v1-[encoded]-[checksum]
    const parts = token.split('-');

    // Support both old format (4 parts, no checksum) and new format (5 parts, with checksum)
    if (parts.length < 4 || parts[2] !== 'v1') {
        throw new Error('Invalid state token format');
    }

    const type = parts[1] as ArtworkType;
    let encoded = parts[3];

    // Validate checksum if present (5-part token)
    if (parts.length === 5) {
        const providedChecksum = parts[4];
        const calculatedChecksum = calculateChecksum(encoded);

        if (providedChecksum !== calculatedChecksum) {
            throw new Error('Token checksum mismatch - token may be corrupted or tampered with');
        }
    }

    // Check for encryption
    if (encoded.startsWith("ENC:")) {
        // Remove prefix
        const encryptedBase64 = encoded.substring(4);
        // Decode Base64 to get the XOR'd string
        const encrypted = fromBase64(encryptedBase64);
        // Decrypt (XOR is reversible)
        encoded = xorCipher(encrypted);
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
        console.error("Failed to decode params", e);
        throw e;
    }
};
