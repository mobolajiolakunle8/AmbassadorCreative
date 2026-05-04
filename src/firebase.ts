import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove, update } from 'firebase/database';

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

// === Database helpers ===
export const dbRef = (path: string) => ref(db, path);

export function listenTo<T>(path: string, callback: (data: T | null) => void) {
  const r = ref(db, path);
  return onValue(r, snap => callback(snap.val() as T | null));
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

// === Image compression (NO resizing) ===

export interface CompressedImage {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  quality: number;
}

/** Approximate the byte size of a base64 data URL (each char encodes ~6 bits). */
function approxBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',');
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  // padding correction
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Compress an image without changing its pixel dimensions.
 *
 * Pure quality-based compression: the canvas keeps the original width and
 * height, and only JPEG quality is reduced step-by-step until the encoded
 * image fits under `maxBytes` (default 600 KB) — perfect for keeping
 * Firebase Realtime DB lean while preserving full image dimensions.
 */
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
        // Keep ORIGINAL pixel dimensions — no resizing.
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported in this browser'));
          return;
        }
        // White background prevents transparent PNG → black JPEG artifacts.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const originalBytes = file.size;

        // Step the quality down until we fit under maxBytes.
        // Start high (0.92) so well-sized images stay sharp.
        let quality = 0.92;
        let output = canvas.toDataURL('image/jpeg', quality);
        let compressedBytes = approxBytes(output);

        while (compressedBytes > maxBytes && quality > 0.3) {
          quality = Math.max(0.3, quality - 0.07);
          output = canvas.toDataURL('image/jpeg', quality);
          compressedBytes = approxBytes(output);
        }

        if (compressedBytes > maxBytes) {
          reject(
            new Error(
              `Image too large even after maximum compression (${(compressedBytes / 1024).toFixed(0)} KB). ` +
                `Please choose an image with smaller pixel dimensions.`,
            ),
          );
          return;
        }

        resolve({
          dataUrl: output,
          originalBytes,
          compressedBytes,
          width: img.width,
          height: img.height,
          quality: Number(quality.toFixed(2)),
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Format a byte count as a friendly KB/MB string. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
