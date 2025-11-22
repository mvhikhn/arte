import { kv } from '@vercel/kv';

// Store email access in KV (free Vercel Redis)
export async function grantEmailAccess(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  await kv.set(`gif_access:${normalizedEmail}`, {
    granted: true,
    grantedAt: new Date().toISOString(),
  });
}

// Check if email has access
export async function checkEmailAccess(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const access = await kv.get(`gif_access:${normalizedEmail}`);
  return access ? true : false;
}

// Get all access data for an email
export async function getEmailAccessData(email: string): Promise<any> {
  const normalizedEmail = email.toLowerCase().trim();
  return await kv.get(`gif_access:${normalizedEmail}`);
}
