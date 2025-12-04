/**
 * ARTE Token Decryption Worker
 * 
 * Cloudflare Worker for AES-256-GCM decryption and validation of artwork tokens.
 * Deploy to Cloudflare Workers with environment variable: ENCRYPTION_KEY
 * 
 * Usage: POST /decrypt
 * Body: { token: "fx-mosaic-v1.hash.encryptedData" }
 * Returns: { type: "mosaic", params: {...} } or { error: "..." }
 */

export default {
    async fetch(request, env) {
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        try {
            const { token } = await request.json();

            if (!token) {
                return new Response(JSON.stringify({ error: 'Missing token' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // Parse token: fx-{type}-v1.{hash}.{encryptedData}
            const match = token.match(/^fx-(\w+)-v1\.([a-f0-9]+)\.(.+)$/);
            if (!match) {
                return new Response(JSON.stringify({ error: 'Invalid token format' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            const [, type, providedHash, encryptedBase64] = match;

            // Get encryption key from environment
            const keyString = env.ENCRYPTION_KEY;
            if (!keyString) {
                return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // Derive AES key from string
            const encoder = new TextEncoder();
            const keyData = encoder.encode(keyString);
            const keyHash = await crypto.subtle.digest('SHA-256', keyData);
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyHash,
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );

            // Decode base64url
            const base64 = encryptedBase64
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            const padding = (4 - (base64.length % 4)) % 4;
            const paddedBase64 = base64 + '='.repeat(padding);
            const combined = Uint8Array.from(atob(paddedBase64), c => c.charCodeAt(0));

            // Extract IV and encrypted data
            const iv = combined.slice(0, 12);
            const encryptedData = combined.slice(12);

            // Decrypt
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                cryptoKey,
                encryptedData
            );

            const decoder = new TextDecoder();
            const decryptedData = decoder.decode(decryptedBuffer);

            // Validate hash (bulletproof check)
            const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(decryptedData));
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);

            if (calculatedHash !== providedHash) {
                return new Response(JSON.stringify({ error: 'Token validation failed - hash mismatch' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            return new Response(JSON.stringify({ type, data: decryptedData }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Decryption failed', details: error.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    },
};
