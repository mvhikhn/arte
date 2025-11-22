import { createClient, type VercelKV } from '@vercel/kv';

// Lazy-load KV client to avoid build-time errors
let kvClient: VercelKV | null = null;

function getKVClient(): VercelKV {
  if (!kvClient) {
    const url = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || '';
    const token = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || '';
    
    if (!url || !token) {
      throw new Error('Redis REST API credentials not configured. Please add KV_REST_API_URL and KV_REST_API_TOKEN environment variables.');
    }
    
    kvClient = createClient({ url, token });
  }
  return kvClient;
}

// Store email access in KV (free Vercel Redis)
export async function grantEmailAccess(email: string): Promise<void> {
  try {
    const client = getKVClient();
    const normalizedEmail = email.toLowerCase().trim();
    await client.set(`gif_access:${normalizedEmail}`, {
      granted: true,
      grantedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error granting email access:', error);
    throw error;
  }
}

// Check if email has access
export async function checkEmailAccess(email: string): Promise<boolean> {
  try {
    const client = getKVClient();
    const normalizedEmail = email.toLowerCase().trim();
    const access = await client.get(`gif_access:${normalizedEmail}`);
    return access ? true : false;
  } catch (error) {
    console.error('Error checking email access:', error);
    throw error;
  }
}

// Get all access data for an email
export async function getEmailAccessData(email: string): Promise<any> {
  try {
    const client = getKVClient();
    const normalizedEmail = email.toLowerCase().trim();
    return await client.get(`gif_access:${normalizedEmail}`);
  } catch (error) {
    console.error('Error getting email access data:', error);
    throw error;
  }
}
