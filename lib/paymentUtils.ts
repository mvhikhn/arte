// Check if user has paid for GIF export feature
export function hasGifAccess(): boolean {
  if (typeof window === 'undefined') return false;
  
  const access = localStorage.getItem('arte_gif_access');
  return access === 'true';
}

// Grant GIF access (called after successful payment)
export function grantGifAccess(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('arte_gif_access', 'true');
  localStorage.setItem('arte_gif_access_date', new Date().toISOString());
}

// Remove GIF access (for testing or refunds)
export function revokeGifAccess(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('arte_gif_access');
  localStorage.removeItem('arte_gif_access_date');
}

// Get when access was granted
export function getAccessDate(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('arte_gif_access_date');
}
