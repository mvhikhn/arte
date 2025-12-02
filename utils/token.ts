// fxhash-style token generation and seeding
export function generateToken(): string {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let randomPart = "";
    for (let i = 0; i < 48; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < randomPart.length; i++) {
        sum += randomPart.charCodeAt(i);
    }
    const checksum = (sum % 256).toString(16).padStart(2, '0');

    return `fx-${randomPart}${checksum}`;
}

export function validateToken(token: string): boolean {
    if (!token.startsWith("fx-") || token.length !== 53) { // fx- (3) + 48 random + 2 checksum
        return false;
    }

    const randomPart = token.substring(3, 51);
    const providedChecksum = token.substring(51);

    let sum = 0;
    for (let i = 0; i < randomPart.length; i++) {
        sum += randomPart.charCodeAt(i);
    }
    const calculatedChecksum = (sum % 256).toString(16).padStart(2, '0');

    return providedChecksum === calculatedChecksum;
}

// Simple hash function to convert token to numbers
function hashToken(token: string): number[] {
    const hashes = [0, 0, 0, 0];
    for (let i = 0; i < token.length; i++) {
        const code = token.charCodeAt(i);
        hashes[i % 4] = ((hashes[i % 4] << 5) - hashes[i % 4]) + code;
        hashes[i % 4] = hashes[i % 4] & hashes[i % 4];
    }
    return hashes.map(h => Math.abs(h));
}

// sfc32 PRNG implementation (fxhash uses this)
function sfc32(a: number, b: number, c: number, d: number) {
    return function () {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

// Create a seedable random function from token
export function createSeededRandom(token: string): () => number {
    const hashes = hashToken(token);
    return sfc32(hashes[0], hashes[1], hashes[2], hashes[3]);
}

export function tokenToSeed(token: string): number {
    const hashes = hashToken(token);
    return hashes[0];
}
