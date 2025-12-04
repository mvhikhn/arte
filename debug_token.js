
const ENCRYPTION_KEY = "ARTE_SECURE_2024";

const xorCipher = (text) => {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return result;
};

const decodeParams = (token) => {
    try {
        let jsonString;

        if (token.includes("ENC:")) {
            const parts = token.split("ENC:");
            const encryptedPart = parts[1].split("-")[0]; // Remove checksum if present
            const decrypted = xorCipher(Buffer.from(encryptedPart, 'base64').toString('binary'));
            jsonString = Buffer.from(decrypted, 'base64').toString('binary');
        } else {
            // ... legacy handling ...
            return "Legacy token not supported in this debug script";
        }

        const data = JSON.parse(jsonString);

        const mapLayer = (l) => ({
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
            token: data[11] || token,
            colorSeed: data[12]
        };
    } catch (e) {
        console.error("Failed to decode:", e);
        return null;
    }
};

const token = "fx-text-v1-ENC:FisdLxIXBDsPBRwne1lFTg8BIywWOjIqBgVwb2hoe10NFhE9EikMMBgoBCh+dHcGDBYVNhI5BDQYET09e1xCZBIUHgcLOgwwGBFxbn50c0EPASN3EjoyKgxgEypWd2RNCDsjLBZjHwQaBi4of3N7Rw8RIzESOjI7GTgALHtZfFkbOBUyEhcEKhkRDDVoXWtDDBYVMhY6MiocYB8yaFpgXQ4RHTYSEDI0GREMNWB0d0MMFhUyFjoyKjQVLW9WeHBODjtsMwUUDDY3YHAsU2cHWCVgAiwFPnw2MRoIKmsCC0ANYQUzEhcQcBsoDzJrAmBfGDgVMhEXLSsaFQBsaHR7TQ8oP3YSKR8pGwYman93d0ElGgYoFj91MAIrDDZ+dHNBDCsjMhM5HHcZFhwofnN4XhsFYXUFCwwqGREMNWBbawEOBhUyFjoyOxg7Mid+dHdHCDsaABIHBDQYFgQ2fnN7XhMWETISFwQ0HDsyNnsCaFkbOAYsEBAMMBgRMm9+c3teExYRMhIXBDQcOzI2e1wCRxYrHSwTFwQ2GCsyKH5aawANFg0yExAPKQ8FcG9oaHtdDREdLw04HHYaBgQoe1lFTAw7Iz0TFwAwHDsLGn9kc0MMFhUsExAMKQcWACh/dHNDCDsjLBZhHy4POBc2fXN7RwwRI3UTEAwpBxYAKH90c0MIOyMsFj91MAIrDDZ+dHNBDwYBNhIQcXEaETInf3RzRwg/Gik9PRcvNjsMLHtZfHMTOD9wEhcEKhkWACZ+dHdHDAEjLBZjFDsYFgQof3N7Rwg7GgASBwQ0GBYENn5ze14bPw4oERQMdxw7Mih+dGNHCDsaABIHBDQYFgQ2fnN7XRkBIywFPSI3MRUTa1ZzA2AlORIwCAcLADE/MQxWXnBhFGE7dQUbCxUCPjUbYwBGWwxgPBwNOQA6NAcxHGh2fGYUFThwDBUTNg8VCzR7WUVdGzwzMTsUE3cxEXQLVlt0QRYGGgY7PjEQMTwHCmcDXQQbGhoTCD81BwRiMTB/AlptEzgRPD4GMQAPFAsNZ3deARIUAjAFFAsoHD51Yg==-5e06";

console.log(JSON.stringify(decodeParams(token), null, 2));
