/**
 * Client-side encryption for localStorage data
 * Uses Web Crypto API with AES-GCM encryption
 */

const ENCRYPTION_KEY_NAME = 'bolsocerto_encryption_key';

// Generate a random encryption key and store it
async function generateAndStoreKey(): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Export and store the key
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  localStorage.setItem(ENCRYPTION_KEY_NAME, keyBase64);
  
  return key;
}

// Get or create the encryption key
async function getEncryptionKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
  
  if (storedKey) {
    try {
      const keyData = Uint8Array.from(atob(storedKey), c => c.charCodeAt(0));
      return await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Error importing stored key, generating new one:', error);
      return generateAndStoreKey();
    }
  }
  
  return generateAndStoreKey();
}

// Encrypt data
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    
    // Generate a random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt data
export async function decryptData(encryptedString: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Check if data is encrypted (starts with base64 pattern for our encrypted format)
export function isEncrypted(data: string): boolean {
  // Encrypted data will be base64 and won't start with '{'
  try {
    const decoded = atob(data);
    // If it's valid base64 and doesn't look like JSON, it's likely encrypted
    return decoded.length > 12 && !data.startsWith('{');
  } catch {
    return false;
  }
}

// Migrate unencrypted data to encrypted
export async function migrateToEncrypted(storageKey: string): Promise<boolean> {
  try {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return false;
    
    // Check if already encrypted
    if (isEncrypted(storedData)) {
      return true; // Already encrypted
    }
    
    // Validate it's valid JSON before migrating
    JSON.parse(storedData);
    
    // Encrypt and store
    const encrypted = await encryptData(storedData);
    localStorage.setItem(storageKey, encrypted);
    
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}
