/**
 * ARTE Secure Token Serialization
 * 
 * Generic serialization system for artwork parameters.
 * Uses LZ-String compression and optional Cloudflare Workers for AES-256 encryption.
 * 
 * Token Formats:
 * - v2:  fx-{type}-v2.{sha256hash16}.{compressedData}   (local, unencrypted)
 * - v2e: fx-{type}-v2e.{sha256hash16}.{encryptedData}   (server-encrypted)
 * - v4:  fx-{type}-v4.{sha256hash8}.{compressedData}    (aggressive compression + provenance)
 * 
 * Hybrid approach:
 * - encodeParams: Synchronous, local compression + hash (for instant UI feedback)
 * - encodeParamsSecure: Async, server-side AES encryption (for sharing)
 * - encodeParamsV4: Async, aggressive compression + provenance (for selling)
 * - decodeParams: Automatic detection of all token versions
 */

import LZString from 'lz-string';
import { ArtworkType } from '@/utils/token';
import { sha256Sync } from '@/utils/sha256';
import { compressV4, decompressV4 } from '@/utils/compression';
import { ProvenanceData } from '@/utils/schemaRegistry';

// Cloudflare Worker endpoints
const ENCRYPT_ENDPOINT = process.env.NEXT_PUBLIC_ENCRYPT_ENDPOINT || 'https://arte-encrypt.mvhikhn.workers.dev';
const DECRYPT_ENDPOINT = process.env.NEXT_PUBLIC_DECRYPT_ENDPOINT || 'https://arte-decrypt.mvhikhn.workers.dev';

/**
 * Round floating-point numbers to fixed precision to ensure identical
 * inputs produce identical tokens (WYSIWYG guarantee).
 */
const roundFloats = (value: any, precision: number = 4): any => {
    if (typeof value === 'number' && !Number.isInteger(value)) {
        return parseFloat(value.toFixed(precision));
    }
    if (Array.isArray(value)) {
        return value.map(v => roundFloats(v, precision));
    }
    if (value && typeof value === 'object') {
        const result: Record<string, any> = {};
        for (const key of Object.keys(value)) {
            result[key] = roundFloats(value[key], precision);
        }
        return result;
    }
    return value;
};

/**
 * Sort object keys alphabetically (deep) for canonical serialization.
 * Ensures identical objects produce identical JSON strings.
 */
const sortKeysDeep = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(sortKeysDeep);
    }
    if (obj && typeof obj === 'object') {
        const sorted: Record<string, any> = {};
        const keys = Object.keys(obj).sort();
        for (const key of keys) {
            sorted[key] = sortKeysDeep(obj[key]);
        }
        return sorted;
    }
    return obj;
};

/**
 * Create canonical JSON string from params object.
 * 1. Round floats to fixed precision
 * 2. Sort keys alphabetically
 * 3. Minify JSON
 */
const canonicalize = (params: any): string => {
    const rounded = roundFloats(params);
    const sorted = sortKeysDeep(rounded);
    return JSON.stringify(sorted);
};

/**
 * Calculate SHA-256 hash (first 16 hex chars for compactness).
 * Async version for server-side or when crypto.subtle is available.
 */
const sha256Async = async (data: string): Promise<string> => {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    } else {
        // Fallback to sync implementation if crypto.subtle unavailable
        return sha256Sync(data);
    }
};

/**
 * Compress data using LZ-String (base64 safe).
 */
const compress = (data: string): string => {
    return LZString.compressToBase64(data)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

/**
 * Decompress LZ-String data.
 */
const decompress = (data: string): string | null => {
    // Restore base64 characters
    const base64 = data
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    return LZString.decompressFromBase64(base64);
};

/**
 * Synchronous encode - for instant UI feedback.
 * Creates a locally verifiable token without server encryption.
 * Uses synchronous SHA-256 for bulletproof hashing.
 * 
 * Token format: fx-{type}-v2.{hash}.{compressed}
 */
export const encodeParams = (type: string, params: any): string => {
    const canonical = canonicalize(params);
    const hash = sha256Sync(canonical);
    const compressed = compress(canonical);
    return `fx-${type}-v2.${hash}.${compressed}`;
};

/**
 * Async encode with server-side encryption - for secure sharing.
 * Falls back to local encoding if server unavailable.
 * 
 * Token format: fx-{type}-v2e.{hash}.{encrypted}
 */
export const encodeParamsSecure = async (type: string, params: any): Promise<string> => {
    const canonical = canonicalize(params);
    const hash = await sha256Async(canonical);
    const compressed = compress(canonical);

    // If no endpoint configured, return local token
    if (!ENCRYPT_ENDPOINT) {
        return `fx-${type}-v2.${hash}.${compressed}`;
    }

    try {
        const response = await fetch(ENCRYPT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data: compressed, hash }),
        });

        if (!response.ok) {
            throw new Error(`Encryption service error: ${response.status}`);
        }

        const { token, error } = await response.json();

        if (error) {
            throw new Error(error);
        }

        // Return encrypted token with 'e' suffix to indicate encrypted
        return token.replace('-v2.', '-v2e.');
    } catch (error) {
        console.error('Encryption service failed:', error);
        throw new Error('Encryption failed. Please check your connection and try again.');
    }
};

/**
 * Decode a token back into artwork parameters.
 * Automatically handles both local (v2) and encrypted (v2e) tokens.
 */
export const decodeParams = async (token: string): Promise<{ type: ArtworkType; params: any }> => {
    // Parse token: fx-{type}-v2[e].{hash}.{data}
    const match = token.match(/^fx-(\w+)-v2(e)?\.([a-f0-9]+)\.(.+)$/);

    if (!match) {
        throw new Error('Invalid token format. Expected: fx-{type}-v2.{hash}.{data}');
    }

    const [, type, encrypted, providedHash, data] = match;

    if (encrypted === 'e' && DECRYPT_ENDPOINT) {
        // Encrypted token - use server decryption
        try {
            const response = await fetch(DECRYPT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                throw new Error(`Decryption service error: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            const canonical = decompress(result.data);
            if (!canonical) {
                console.error("Decompression failed. Received data:", result.data);
                throw new Error(`Decompression failed. Data start: ${result.data?.substring(0, 50)}...`);
            }

            // For v2e tokens, we TRUST the server's validation.
            // The server already validated the hash against the decrypted data.
            // We do NOT need to re-validate locally.
            return { type: type as ArtworkType, params: JSON.parse(canonical) };
        } catch (error) {
            console.error('Decryption service failed:', error);
            throw error;
        }
    }

    // Local token (v2) - decompress and validate locally
    const canonical = decompress(data);
    if (!canonical) {
        throw new Error('Token decompression failed');
    }

    // Validate hash using SHA-256 (Sync)
    const calculatedHash = sha256Sync(canonical);

    if (calculatedHash !== providedHash) {
        console.error(`Hash mismatch! Calculated: ${calculatedHash}, Provided: ${providedHash}`);
        throw new Error('Token validation failed - hash mismatch (tampering detected)');
    }

    return { type: type as ArtworkType, params: JSON.parse(canonical) };
};

/**
 * Synchronous decode - for cases where async isn't possible.
 * Only works with local (v2) tokens, not encrypted (v2e) tokens.
 */
export const decodeParamsSync = (token: string): { type: ArtworkType; params: any } | null => {
    const match = token.match(/^fx-(\w+)-v2\.([a-f0-9]+)\.(.+)$/);

    if (!match) {
        return null;
    }

    const [, type, providedHash, data] = match;

    const canonical = decompress(data);
    if (!canonical) {
        return null;
    }

    // Validate hash using SHA-256 (Sync)
    const calculatedHash = sha256Sync(canonical);
    if (calculatedHash !== providedHash) {
        return null;
    }

    try {
        return { type: type as ArtworkType, params: JSON.parse(canonical) };
    } catch {
        return null;
    }
};

/**
 * Validate a token format without decoding.
 * Supports v2, v2e, and v4 tokens.
 */
export const validateTokenFormat = (token: string): boolean => {
    return /^fx-(\w+)-v(2e?|4)\.([a-f0-9]+)\.(.+)$/.test(token);
};

/**
 * Extract artwork type from token without decoding.
 */
export const getTokenType = (token: string): ArtworkType | null => {
    const match = token.match(/^fx-(\w+)-v(2|4)/);
    return match ? (match[1] as ArtworkType) : null;
};

/**
 * Check if a token uses server-side encryption.
 */
export const isEncryptedToken = (token: string): boolean => {
    return token.includes('-v2e.');
};

/**
 * Check if a token is v4 format.
 */
export const isV4Token = (token: string): boolean => {
    return token.includes('-v4.');
};

/**
 * Encode params with v4 aggressive compression + Cloudflare encryption.
 * Compresses first for shorter encrypted payload, then encrypts via Cloudflare.
 * Optionally includes provenance data for collectibles.
 * 
 * Token format: fx-{type}-v4.{hash8}.{encryptedData}
 */
export const encodeParamsV4 = async (
    type: string,
    params: any,
    provenance?: {
        creator: string;
        location?: string;
        feeling: string;
    }
): Promise<string> => {
    // Round floats for consistency
    const rounded = roundFloats(params);

    // Create full provenance if provided
    const fullProvenance: ProvenanceData | undefined = provenance ? {
        ...provenance,
        timestamp: Date.now(),
        artist: 'Mahi Khan',
        artworkType: type,
    } : undefined;

    // Compress with v4 pipeline (msgpack + pako + base91)
    const compressed = compressV4(type, rounded, fullProvenance);

    // Create short hash (8 chars for integrity check)
    const hash = sha256Sync(compressed).substring(0, 8);

    // Encrypt via Cloudflare
    if (!ENCRYPT_ENDPOINT) {
        // Fallback to unencrypted if no endpoint
        return `fx-${type}-v4.${hash}.${compressed}`;
    }

    try {
        const response = await fetch(ENCRYPT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data: compressed, hash, version: 'v4' }),
        });

        if (!response.ok) {
            throw new Error(`Encryption service error: ${response.status}`);
        }

        const { token, error } = await response.json();

        if (error) {
            throw new Error(error);
        }

        // Token comes back as fx-{type}-v2.{hash}.{data}, convert to v4
        return token.replace('-v2.', '-v4.');
    } catch (error) {
        console.error('V4 encryption failed:', error);
        throw new Error('Encryption failed. Please check your connection and try again.');
    }
};

/**
 * Decode a v4 token with Cloudflare decryption.
 * Returns params and optional provenance data.
 */
export const decodeParamsV4 = async (
    token: string
): Promise<{ type: ArtworkType; params: any; provenance?: ProvenanceData }> => {
    const match = token.match(/^fx-(\w+)-v4\.([a-f0-9]+)\.(.+)$/);

    if (!match) {
        throw new Error('Invalid v4 token format');
    }

    const [, type, hash, data] = match;

    // Decrypt via Cloudflare
    if (!DECRYPT_ENDPOINT) {
        throw new Error('Decryption service not configured');
    }

    try {
        // Convert v4 token format to v2 for the decrypt endpoint
        const v2Token = token.replace('-v4.', '-v2.');

        const response = await fetch(DECRYPT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: v2Token }),
        });

        if (!response.ok) {
            throw new Error(`Decryption service error: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        // Result.data is the compressed v4 data
        const compressedData = result.data;

        // Verify hash
        const calculatedHash = sha256Sync(compressedData).substring(0, 8);
        if (calculatedHash !== hash) {
            throw new Error('Token validation failed - hash mismatch');
        }

        // Decompress v4 data
        const { params, provenance } = decompressV4(type, compressedData);

        // Restore token reference in params
        params.token = token;

        return { type: type as ArtworkType, params, provenance };
    } catch (error) {
        console.error('V4 decryption failed:', error);
        throw new Error('Decryption failed. Token may be invalid or corrupted.');
    }
};

/**
 * Universal decode function - handles all token versions.
 * Updated to support v4 tokens.
 */
export const decodeParamsUniversal = async (
    token: string
): Promise<{ type: ArtworkType; params: any; provenance?: ProvenanceData }> => {
    // Check for v4 first (new format)
    if (isV4Token(token)) {
        return decodeParamsV4(token);
    }

    // Fall back to existing v2/v2e decode
    const result = await decodeParams(token);
    return { ...result, provenance: undefined };
};

// Re-export ProvenanceData for external use
export type { ProvenanceData };
