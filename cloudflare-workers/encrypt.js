/**
 * ARTE Token Encryption Worker
 * 
 * Cloudflare Worker for AES-256-GCM encryption of artwork parameters.
 * Deploy to Cloudflare Workers with environment variable: ENCRYPTION_KEY
 * 
 * Usage: POST /encrypt
 * Body: { type: "mosaic", params: {...}, hash: "sha256hash" }
 * Returns: { token: "fx-mosaic-v1.hash.encryptedData" }
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
            const { type, data, hash } = await request.json();

            if (!type || !data || !hash) {
                return new Response(JSON.stringify({ error: 'Missing type, data, or hash' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

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
                ['encrypt']
            );

            // Generate IV
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Encrypt the data
            const dataBytes = encoder.encode(data);
            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                cryptoKey,
                dataBytes
            );

            // Combine IV + encrypted data and encode as base64url
            const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encryptedBuffer), iv.length);

            const base64 = btoa(String.fromCharCode(...combined))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            // Construct final token
            const token = `fx-${type}-v2.${hash}.${base64}`;

            return new Response(JSON.stringify({ token }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Encryption failed', details: error.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    },
};
