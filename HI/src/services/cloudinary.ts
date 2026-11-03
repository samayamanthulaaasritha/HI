export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format?: string;
  bytes?: number;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'de0ivtkcn';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'HotelInfo';

// File validation constraints
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB

export function validateMediaFile(file: File, expectedType: 'image' | 'video' | 'audio'): { valid: boolean; error?: string } {
  if (expectedType === 'image') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only JPG, PNG, and WebP images are allowed.' };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { valid: false, error: 'Image file size must be less than 10MB.' };
    }
  } else if (expectedType === 'video') {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only MP4 and WebM videos are allowed.' };
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return { valid: false, error: 'Video file size must be less than 50MB.' };
    }
  } else if (expectedType === 'audio') {
    if (!ALLOWED_AUDIO_TYPES.includes(file.type) && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav')) {
      return { valid: false, error: 'Only MP3 and WAV audio files are allowed.' };
    }
    if (file.size > MAX_AUDIO_SIZE) {
      return { valid: false, error: 'Audio file size must be less than 25MB.' };
    }
  }
  return { valid: true };
}

/**
 * Upload single media item to Cloudinary using unsigned preset
 */
export async function uploadToCloudinary(
  file: File,
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto',
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'hotelinfo');

    const xhr = new XMLHttpRequest();
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    xhr.open('POST', endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id,
            resource_type: response.resource_type,
            format: response.format,
            bytes: response.bytes
          });
        } catch {
          reject(new Error('Failed to parse Cloudinary response.'));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || `Upload failed with HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with HTTP ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during Cloudinary upload. Check your connection.'));
    };

    xhr.send(formData);
  });
}

export async function uploadImage(file: File, onProgress?: (pct: number) => void): Promise<CloudinaryUploadResult> {
  const check = validateMediaFile(file, 'image');
  if (!check.valid) throw new Error(check.error);
  return uploadToCloudinary(file, 'image', onProgress);
}

export async function uploadVideo(file: File, onProgress?: (pct: number) => void): Promise<CloudinaryUploadResult> {
  const check = validateMediaFile(file, 'video');
  if (!check.valid) throw new Error(check.error);
  return uploadToCloudinary(file, 'video', onProgress);
}

export async function uploadAudio(file: File, onProgress?: (pct: number) => void): Promise<CloudinaryUploadResult> {
  const check = validateMediaFile(file, 'audio');
  if (!check.valid) throw new Error(check.error);
  return uploadToCloudinary(file, 'auto', onProgress);
}

export async function uploadMultipleImages(
  files: File[],
  onOverallProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];
  let completed = 0;
  for (const file of files) {
    const res = await uploadImage(file);
    urls.push(res.secure_url);
    completed++;
    if (onOverallProgress) onOverallProgress(completed, files.length);
  }
  return urls;
}

/**
 * Helper to build optimized Cloudinary image transformation URLs
 */
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; crop?: string; quality?: string } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transformations: string[] = ['f_auto', 'q_auto'];
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);

  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
}
