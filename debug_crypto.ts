```javascript
const LZString = require('lz-string');
const nodeCrypto = require('crypto');

// Mock Web Crypto API for Node.js
const webCrypto = nodeCrypto.webcrypto;

async function testRoundTrip() {
    console.log("Starting Crypto Round Trip Test...");

    // 1. Generate Data
    const params = {
        canvasWidth: 630,
        canvasHeight: 790,
        color1: "#A8DADC",
        color2: "#E63946",
        color3: "#457B9D",
        color4: "#1D3557",
        initialRectMinSize: 0.8,
        initialRectMaxSize: 1.0,
        gridDivisionChance: 0.1,
        recursionChance: 0.1,
        minGridRows: 2,
        maxGridRows: 4,
        minGridCols: 3,
        maxGridCols: 5,
        splitRatioMin: 0.2,
        splitRatioMax: 0.8,
        marginMultiplier: 0.05,
        detailGridMin: 2,
        detailGridMax: 4,
        noiseDensity: 0.05,
        minRecursionSize: 20,
        token: "fx-mosaic-v2.test",
        colorSeed: "fx-mosaic-v2.test",
        exportWidth: 1600,
        exportHeight: 2000
    };

    const canonical = JSON.stringify(params);
    console.log("Original Data Length:", canonical.length);

    // 2. Compress (Client Side)
    const compressed = LZString.compressToBase64(canonical)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    console.log("Compressed Data:", compressed);

    // 3. Encrypt (Worker Side Simulation)
    const keyString = "TEST_KEY_1234567890";
    const encoder = new TextEncoder();
    const keyHash = await webCrypto.subtle.digest('SHA-256', encoder.encode(keyString));
    const cryptoKey = await webCrypto.subtle.importKey('raw', keyHash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);

    const iv = webCrypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await webCrypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoder.encode(compressed));

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    const base64Token = btoa(String.fromCharCode.apply(null, Array.from(combined)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    console.log("Encrypted Token Data:", base64Token);

    // 4. Decrypt (Worker Side Simulation)
    const decryptBase64 = base64Token.replace(/-/g, '+').replace(/_/g, '/');
    const pad = decryptBase64.length % 4;
    const paddedBase64 = pad ? decryptBase64 + '='.repeat(4 - pad) : decryptBase64;

    const encryptedData = Uint8Array.from(atob(paddedBase64), c => c.charCodeAt(0));

    const decryptIv = encryptedData.slice(0, 12);
    const ciphertext = encryptedData.slice(12);

    const decryptedBuffer = await webCrypto.subtle.decrypt({ name: 'AES-GCM', iv: decryptIv }, cryptoKey, ciphertext);
    const decryptedString = new TextDecoder().decode(decryptedBuffer);

    console.log("Decrypted String:", decryptedString);
    console.log("Match?", decryptedString === compressed ? "YES" : "NO");

    // 5. Decompress (Client Side)
    const decompressBase64 = decryptedString
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const decompressed = LZString.decompressFromBase64(decompressBase64);

    console.log("Decompressed Data:", decompressed);
    console.log("Final Match?", decompressed === canonical ? "YES" : "NO");
}

testRoundTrip().catch(console.error);
