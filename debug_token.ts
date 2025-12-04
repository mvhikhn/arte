
const LZString = require('lz-string');

// Mock browser globals if needed
if (typeof window === 'undefined') {
    global.window = {} as any;
}

// Token to debug
const token = "fx-mosaic-v2.81de1299b0d9a9fa.N4IgxghgdgbhDOAJApgSwOYAsAuIBcA7AJwAMANONHPAOqoAm2m-AbAMzngD2ANlwE4BGfCADEAJhYAWFgFY2ICmF4DxIiRCL0AHADNF3PvwV4xyImBkQDyo1PW6pEScKUr-AZWTJ6I3QA8AWgBbLngIVDBAgFl6ACEALzYYGHEwAEcCdABheHoAaVQAEXyAVWCEgAVs1ASaAAdEbSkARVL0AW0ANQgpbABRBIAjejADemRsCJ4AcX4GaIh_fFkKCanUWfn6aNQofHEKZH96gWwUDBwDkhujk7O6RmY8QRZbkHRtotQYVHhULhQbKYaBgZD4EgAOle2jYFD2qGwqAgPAASsgwNhFv4PLVwS94VBEci0RisXtcQl8VCWIIZBRghB-Og9tEAK48JH1HioZD8CGQkjiIhSBlLOYMbK8eCsMX-CX0VFcADuMrwhxAwT2CqlPDVGq1UAVStVBwZe3RYDZ_H-gMp-LpFCgXD-yCKyCg_2wAE8BYI2LJViB-BjrbagSCoGC_SwCNoKPBuYjURAkVxsQKCGxxEHEzzsCm07t9ngoQH_RRsFwANYevxBULhSIxeJJFJpTI5PKFErlKo1OqNZptDr8bq9AbDUYgAC-QA";

console.log("Debugging Token:", token);

// 1. Check Regex
const regex = /^fx-(flow|grid|mosaic|rotated|tree|text)-v2e?\.([a-f0-9]+)\.(.+)$/;
const match = token.match(regex);
console.log("Regex Match:", match ? "YES" : "NO");

if (match) {
    const [, type, hash, data] = match;
    console.log("Type:", type);
    console.log("Hash:", hash);
    console.log("Data Length:", data.length);

    // 2. Try Decompression
    try {
        const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
        console.log("Base64 (first 20):", base64.substring(0, 20));

        const decompressed = LZString.decompressFromBase64(base64);
        console.log("Decompressed:", decompressed ? "YES" : "NO");

        if (decompressed) {
            console.log("Decompressed Data (first 50):", decompressed.substring(0, 50));

            // 3. Check Hash
            const simpleHash = (data: string) => {
                let hash = 5381;
                for (let i = 0; i < data.length; i++) {
                    hash = ((hash << 5) + hash) ^ data.charCodeAt(i);
                }
                const hex = (hash >>> 0).toString(16);
                let hash2 = 0;
                for (let i = 0; i < data.length; i++) {
                    hash2 = data.charCodeAt(i) + ((hash2 << 6) + (hash2 << 16) - hash2);
                }
                const hex2 = (hash2 >>> 0).toString(16);
                return (hex + hex2).padStart(16, '0').substring(0, 16);
            };

            const calculatedHash = simpleHash(decompressed);
            console.log("Calculated Hash:", calculatedHash);
            console.log("Provided Hash:  ", hash);
            console.log("Hash Match:", calculatedHash === hash ? "YES" : "NO");
        }
    } catch (e) {
        console.error("Decompression Error:", e);
    }
}
