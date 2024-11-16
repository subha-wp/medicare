// Utility functions for password hashing using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('base64');
}

export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedPassword === hashedInput;
}