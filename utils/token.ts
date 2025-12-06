// fxhash-style token generation and seeding with artwork type
export type ArtworkType = 'flow' | 'grid' | 'mosaic' | 'rotated' | 'tree' | 'text' | 'lamb';

export function generateToken(artworkType?: ArtworkType): string {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let randomPart = "";
    // Slightly shorter random part to accommodate artwork type in similar total length
    const randomLength = artworkType ? 44 : 48;
    for (let i = 0; i < randomLength; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Calculate checksum
    // We include the artwork type in the checksum calculation to bind the token to its type
    // This prevents users from manually changing the prefix (e.g. fx-grid- to fx-flow-)
    // as the checksum validation will fail.
    const checksumSource = artworkType ? `${artworkType}${randomPart}` : randomPart;

    let sum = 0;
    for (let i = 0; i < checksumSource.length; i++) {
        sum += checksumSource.charCodeAt(i);
    }
    const checksum = (sum % 256).toString(16).padStart(2, '0');

    // Include artwork type in token if provided
    if (artworkType) {
        return `fx-${artworkType}-${randomPart}${checksum}`;
    }
    return `fx-${randomPart}${checksum}`;
}

export function validateToken(token: string, artworkType?: string): boolean {
    // Check if token has artwork type prefix
    const hasArtworkType = token.match(/^fx-(flow|grid|mosaic|rotated|tree|text|lamb)-/);

    if (hasArtworkType) {
        // Token format: fx-[type]-[44 random chars][2 checksum]
        // Check if this is a v2/v2e state token (new secure format)
        // Format: fx-[type]-v2.[hash].[data]
        // Format: fx-[type]-v2e.[hash].[data]
        // Check this FIRST because data can contain hyphens, breaking the split('-') logic below
        if (token.includes('-v2.') || token.includes('-v2e.')) {
            // Simple regex check for format
            return /^fx-(flow|grid|mosaic|rotated|tree|text|lamb)-v2e?\.([a-f0-9]+)\.(.+)$/.test(token);
        }

        const parts = token.split('-');
        // Standard token: fx-[type]-[hash+checksum] (3 parts)
        // State token (legacy): fx-[type]-v1-[data] (4 parts)
        // State token (with checksum): fx-[type]-v1-[data]-[checksum] (5 parts)
        if ((parts.length !== 3 && parts.length !== 4 && parts.length !== 5) || parts[0] !== 'fx') {
            return false;
        }

        const tokenArtworkType = parts[1] as ArtworkType;
        const randomAndChecksum = parts[2];

        // Validate artwork type matches if specified
        if (artworkType && tokenArtworkType !== artworkType) {
            return false;
        }

        // Check if this is a v1 state token (legacy)
        // Format: fx-[type]-v1-[base64] (legacy, 4 parts)
        // Format: fx-[type]-v1-[base64]-[checksum] (new, 5 parts)
        if (randomAndChecksum === 'v1') {
            // It's a state token. We just need to verify it has data.
            const v1Parts = token.split('-');
            if (v1Parts.length < 4 || v1Parts.length > 5) return false;
            const dataPart = v1Parts[3];
            if (!dataPart || dataPart.length === 0) return false;
            return true;
        }



        // Validate length: 44 random + 2 checksum
        if (randomAndChecksum.length !== 46) {
            return false;
        }

        const randomPart = randomAndChecksum.substring(0, 44);
        const providedChecksum = randomAndChecksum.substring(44);

        // Verify checksum with artwork type binding
        const checksumSource = `${tokenArtworkType}${randomPart}`;
        let sum = 0;
        for (let i = 0; i < checksumSource.length; i++) {
            sum += checksumSource.charCodeAt(i);
        }
        const calculatedChecksum = (sum % 256).toString(16).padStart(2, '0');

        return providedChecksum === calculatedChecksum;
    } else {
        // Legacy format: fx-[48 random chars][2 checksum]
        if (!token.startsWith("fx-") || token.length !== 53) {
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
}

export function getTokenArtworkType(token: string): ArtworkType | null {
    const match = token.match(/^fx-(flow|grid|mosaic|rotated|tree|text|lamb)-/);
    return match ? (match[1] as ArtworkType) : null;
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
