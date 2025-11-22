import { createClient } from '@vercel/kv';

// Create KV client with explicit environment variables
// Supports multiple possible variable names from Vercel
const kvClient = createClient({
  url: process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.KV_URL || process.env.REDIS_URL || '',
  token: process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || '',
});

// Store email access in KV (free Vercel Redis)
export async function grantEmailAccess(email: string): Promise<void> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    await kvClient.set(`gif_access:${normalizedEmail}`, {
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
    const normalizedEmail = email.toLowerCase().trim();
    const access = await kvClient.get(`gif_access:${normalizedEmail}`);
    return access ? true : false;
  } catch (error) {
    console.error('Error checking email access:', error);
    throw error;
  }
}

// Get all access data for an email
export async function getEmailAccessData(email: string): Promise<any> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    return await kvClient.get(`gif_access:${normalizedEmail}`);
  } catch (error) {
    console.error('Error getting email access data:', error);
    throw error;
  }
}
