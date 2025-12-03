
// Mock dependencies
const ArtworkType = 'mosaic';

// Helper to encode/decode Base64 safe for URLs
const toBase64 = (str) => Buffer.from(str).toString('base64');
const fromBase64 = (str) => Buffer.from(str, 'base64').toString();

// Helper to calculate checksum from data
const calculateChecksum = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data.charCodeAt(i);
    }
    return (sum % 65536).toString(16).padStart(4, '0');
};

// Mock encodeMosaicParams
const encodeMosaicParams = (params) => {
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
        params.token
    ];
    return toBase64(JSON.stringify(data));
};

// Mock decodeMosaicParams
const decodeMosaicParams = (encoded, token) => {
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
            token: data[23] || token
        };
    } catch (e) {
        console.error("Failed to decode mosaic params", e);
        return {};
    }
};

// encodeParams
const encodeParams = (type, params) => {
    let encoded = "";
    switch (type) {
        case 'mosaic': encoded = encodeMosaicParams(params); break;
    }

    const checksum = calculateChecksum(encoded);
    const typeStr = type;
    return `fx-${typeStr}-v1-${encoded}-${checksum}`;
};

// decodeParams
const decodeParams = (token) => {
    const parts = token.split('-');
    if (parts.length < 4 || parts[2] !== 'v1') {
        throw new Error('Invalid state token format');
    }

    const type = parts[1];
    const encoded = parts[3];

    if (parts.length === 5) {
        const providedChecksum = parts[4];
        const calculatedChecksum = calculateChecksum(encoded);

        if (providedChecksum !== calculatedChecksum) {
            throw new Error('Token checksum mismatch');
        }
    }

    switch (type) {
        case 'mosaic': return decodeMosaicParams(encoded, token);
    }
};

// validateToken
function validateToken(token, artworkType) {
    const hasArtworkType = token.match(/^fx-(flow|grid|mosaic|rotated|tree|text)-/);

    if (hasArtworkType) {
        const parts = token.split('-');
        if ((parts.length !== 3 && parts.length !== 4 && parts.length !== 5) || parts[0] !== 'fx') {
            return false;
        }

        const tokenArtworkType = parts[1];
        const randomAndChecksum = parts[2];

        if (artworkType && tokenArtworkType !== artworkType) {
            return false;
        }

        if (randomAndChecksum === 'v1') {
            const v1Parts = token.split('-');
            if (v1Parts.length < 4 || v1Parts.length > 5) return false;
            const dataPart = v1Parts[3];
            if (!dataPart || dataPart.length === 0) return false;
            return true;
        }
        return false; // Not handling legacy random tokens here for brevity
    }
    return false;
}

// Test
const params = {
    color1: "#FF0000",
    color2: "#00FF00",
    color3: "#0000FF",
    color4: "#FFFF00",
    initialRectMinSize: 0.5,
    initialRectMaxSize: 1.0,
    gridDivisionChance: 0.5,
    recursionChance: 0.5,
    minGridRows: 2,
    maxGridRows: 4,
    minGridCols: 2,
    maxGridCols: 4,
    splitRatioMin: 0.2,
    splitRatioMax: 0.8,
    marginMultiplier: 0.05,
    detailGridMin: 2,
    detailGridMax: 4,
    noiseDensity: 0.1,
    minRecursionSize: 20,
    canvasWidth: 800,
    canvasHeight: 1000,
    exportWidth: 1600,
    exportHeight: 2000,
    token: "fx-mosaic-SEED123"
};

console.log("Original Params:", params);

const v1Token = encodeParams('mosaic', params);
console.log("Encoded Token:", v1Token);

const isValid = validateToken(v1Token, 'mosaic');
console.log("Is Valid:", isValid);

if (isValid) {
    const decoded = decodeParams(v1Token);
    console.log("Decoded Params:", decoded);

    if (decoded.color1 === params.color1 && decoded.token === params.token) {
        console.log("SUCCESS: Params match!");
    } else {
        console.log("FAILURE: Params mismatch!");
    }
} else {
    console.log("FAILURE: Token invalid!");
}
