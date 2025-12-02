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

export function tokenToSeed(token: string): number {
    let seed = 0;
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i);
        seed = ((seed << 5) - seed) + char;
        seed = seed & seed; // Convert to 32bit integer
    }
    return Math.abs(seed);
}
