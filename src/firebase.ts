import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove, update, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAngGwuWkNk6gJF8t0WVJJC5uPo4Iooaxw',
  authDomain: 'myportfolio-df139.firebaseapp.com',
  databaseURL: 'https://myportfolio-df139-default-rtdb.firebaseio.com',
  projectId: 'myportfolio-df139',
  storageBucket: 'myportfolio-df139.firebasestorage.app',
  messagingSenderId: '248921121567',
  appId: '1:248921121567:web:3e7fa1a0119682a886862a',
  measurementId: 'G-LXLM9CLS00',
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);

// === Database helpers ===
export const dbRef = (path: string) => ref(db, path);

export function listenTo<T>(path: string, callback: (data: T | null) => void) {
  const r = ref(db, path);
  return onValue(r, snap => callback(snap.val() as T | null));
}

export function fetchOnce<T>(path: string): Promise<T | null> {
  const r = ref(db, path);
  return get(r).then(snap => snap.val() as T | null);
}

// === Local cache helpers (sessionStorage) ===
const CACHE_PREFIX = 'portfolio_cache_';

export function cacheSet(key: string, data: unknown) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // storage full — ignore
  }
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeTo(path: string, data: unknown) {
  return set(ref(db, path), data);
}

export function updateAt(path: string, data: object) {
  return update(ref(db, path), data);
}

export function removeAt(path: string) {
  return remove(ref(db, path));
}

// === Firebase Storage — Upload image and get URL ===

export interface UploadResult {
  url: string;
  originalBytes: number;
  compressedBytes: number;
  storagePath: string;
}

/**
 * Compress an image on the client (no resizing), then upload the
 * resulting JPEG blob to Firebase Storage. Returns a public download URL
 * that can be stored in the Realtime DB instead of a heavy base64 string.
 */
export async function uploadImageToStorage(
  file: File,
  folder: string = 'projects',
  maxBytes: number = 800 * 1024,
): Promise<UploadResult> {
  const originalBytes = file.size;

  // Compress via canvas
  const blob = await compressToBlob(file, maxBytes);
  const compressedBytes = blob.size;

  // Upload to Firebase Storage
  const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const sRef = storageRef(storage, fileName);
  await uploadBytes(sRef, blob, { contentType: 'image/jpeg' });
  const url = await getDownloadURL(sRef);

  return { url, originalBytes, compressedBytes, storagePath: fileName };
}

/** Delete an image from Firebase Storage by its path or URL. */
export async function deleteImageFromStorage(pathOrUrl: string): Promise<void> {
  try {
    // If it's a full URL, extract path; if it's a storage path, use directly.
    // Skip base64 strings and placeholder URLs.
    if (pathOrUrl.startsWith('data:') || pathOrUrl.includes('placehold.co')) return;
    const sRef = storageRef(storage, pathOrUrl.includes('firebasestorage') ? pathOrUrl : pathOrUrl);
    await deleteObject(sRef);
  } catch {
    // File may not exist or is a legacy base64, ignore
  }
}

// === Image compression — returns a Blob (NOT base64 string) ===

function compressToBlob(file: File, maxBytes: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unsupported')); return; }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        let quality = 0.92;
        const tryCompress = () => {
          canvas.toBlob(
            blob => {
              if (!blob) { reject(new Error('Compression failed')); return; }
              if (blob.size <= maxBytes || quality <= 0.3) {
                resolve(blob);
              } else {
                quality = Math.max(0.3, quality - 0.07);
                tryCompress();
              }
            },
            'image/jpeg',
            quality,
          );
        };
        tryCompress();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Legacy function kept for CV/DP uploads that still use base64 for small images
export interface CompressedImage {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  quality: number;
}

export function compressImageToBase64(
  file: File,
  maxBytes = 600 * 1024,
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unsupported')); return; }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const originalBytes = file.size;
        let quality = 0.92;
        let output = canvas.toDataURL('image/jpeg', quality);
        const approxBytes = (s: string) => { const c = s.indexOf(','); const b = c >= 0 ? s.slice(c + 1) : s; const p = b.endsWith('==') ? 2 : b.endsWith('=') ? 1 : 0; return Math.floor((b.length * 3) / 4) - p; };
        let compressedBytes = approxBytes(output);

        while (compressedBytes > maxBytes && quality > 0.3) {
          quality = Math.max(0.3, quality - 0.07);
          output = canvas.toDataURL('image/jpeg', quality);
          compressedBytes = approxBytes(output);
        }

        if (compressedBytes > maxBytes) {
          reject(new Error(`Image still too large (${(compressedBytes / 1024).toFixed(0)} KB). Choose a smaller image.`));
          return;
        }

        resolve({ dataUrl: output, originalBytes, compressedBytes, width: img.width, height: img.height, quality: Number(quality.toFixed(2)) });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
