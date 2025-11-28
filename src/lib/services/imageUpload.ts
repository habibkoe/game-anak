import { supabase } from '$lib/supabaseClient';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const imageUpload = {
  /**
   * Upload an image to Supabase Storage
   * @param file - The file to upload
   * @param folder - The folder in the bucket (e.g., 'words' or 'rewards')
   * @param fileName - Optional custom file name
   * @returns Upload result with public URL
   */
  async uploadImage(
    file: File,
    folder: 'words' | 'rewards',
    fileName?: string
  ): Promise<UploadResult> {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Please upload JPG, PNG, or WEBP images.'
        };
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size too large. Maximum size is 5MB.'
        };
      }

      // Generate unique file name if not provided
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const finalFileName = fileName || `${folder}-${timestamp}.${extension}`;
      const filePath = `${folder}/${finalFileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('game-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: error.message || 'Failed to upload image'
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('game-images')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Upload exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Delete an image from Supabase Storage
   * @param url - The public URL of the image
   * @returns Success status
   */
  async deleteImage(url: string): Promise<boolean> {
    try {
      // Extract file path from URL
      // URL format: https://{project}.supabase.co/storage/v1/object/public/game-images/{folder}/{filename}
      const urlParts = url.split('/game-images/');
      if (urlParts.length < 2) {
        console.error('Invalid URL format');
        return false;
      }

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('game-images')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete exception:', error);
      return false;
    }
  },

  /**
   * Check if a URL is a Supabase storage URL
   * @param url - The URL to check
   * @returns True if it's a Supabase storage URL
   */
  isSupabaseUrl(url: string): boolean {
    return url.includes('supabase.co/storage/v1/object/public/game-images');
  },

  /**
   * Convert a File to a data URL for preview
   * @param file - The file to convert
   * @returns Promise with data URL
   */
  async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Resize and compress an image
   * @param file - The original file
   * @param maxWidth - Maximum width
   * @param maxHeight - Maximum height
   * @param quality - JPEG quality (0-1)
   * @returns Promise with compressed file
   */
  async compressImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 600,
    quality: number = 0.85
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }
};
