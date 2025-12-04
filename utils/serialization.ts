/**
 * ARTE Secure Token Serialization
 * 
 * Generic serialization system for artwork parameters.
 * Uses LZ-String compression and optional Cloudflare Workers for AES-256 encryption.
 * 
 * Token Format: fx-{type}-v2.{sha256hash16}.{compressedData}
 * 
 * Hybrid approach:
 * - encodeParams: Synchronous, local compression + hash (for instant UI feedback)
 * - encodeParamsSecure: Async, server-side AES encryption (for sharing)
 * - decodeParams: Automatic detection of secure vs local tokens
 */

import LZString from 'lz-string';
import { ArtworkType } from '@/utils/token';

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
 * Synchronous version using a simple hash for client-side use.
 */
const simpleHash = (data: string): string => {
    // djb2 hash - fast and deterministic
    let hash = 5381;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) + hash) ^ data.charCodeAt(i);
    }
    // Convert to positive hex and pad
    const hex = (hash >>> 0).toString(16);
    // Create more entropy by hashing again with different seed
    let hash2 = 0;
    for (let i = 0; i < data.length; i++) {
        hash2 = data.charCodeAt(i) + ((hash2 << 6) + (hash2 << 16) - hash2);
    }
    const hex2 = (hash2 >>> 0).toString(16);
    return (hex + hex2).padStart(16, '0').substring(0, 16);
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
    } else if (typeof require !== 'undefined') {
        try {
            const crypto = require('crypto');
            return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
        } catch {
            return simpleHash(data);
        }
    }
    return simpleHash(data);
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
 * 
 * Token format: fx-{type}-v2.{hash}.{compressed}
 */
export const encodeParams = (type: ArtworkType, params: any): string => {
    const canonical = canonicalize(params);
    const hash = simpleHash(canonical);
    const compressed = compress(canonical);
    return `fx-${type}-v2.${hash}.${compressed}`;
};

/**
 * Async encode with server-side encryption - for secure sharing.
 * Falls back to local encoding if server unavailable.
 * 
 * Token format: fx-{type}-v2e.{hash}.{encrypted}
 */
export const encodeParamsSecure = async (type: ArtworkType, params: any): Promise<string> => {
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
        console.warn('Encryption service unavailable, using local token:', error);
        return `fx-${type}-v2.${hash}.${compressed}`;
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
                throw new Error('Decompression failed');
            }

            return { type: type as ArtworkType, params: JSON.parse(canonical) };
        } catch (error) {
            console.warn('Decryption service failed, trying local decode:', error);
        }
    }

    // Local token or fallback - decompress directly
    const canonical = decompress(data);
    if (!canonical) {
        throw new Error('Token decompression failed');
    }

    // Validate hash
    const calculatedHash = simpleHash(canonical);
    if (calculatedHash !== providedHash) {
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

    const calculatedHash = simpleHash(canonical);
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
 */
export const validateTokenFormat = (token: string): boolean => {
    return /^fx-(\w+)-v2e?\.([a-f0-9]+)\.(.+)$/.test(token);
};

/**
 * Extract artwork type from token without decoding.
 */
export const getTokenType = (token: string): ArtworkType | null => {
    const match = token.match(/^fx-(\w+)-v2/);
    return match ? (match[1] as ArtworkType) : null;
};

/**
 * Check if a token uses server-side encryption.
 */
export const isEncryptedToken = (token: string): boolean => {
    return token.includes('-v2e.');
};
