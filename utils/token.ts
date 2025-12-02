export function generateToken(): string {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let token = "fx-";
    for (let i = 0; i < 49; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
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
