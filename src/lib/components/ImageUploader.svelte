<script lang="ts">
  import { onDestroy } from 'svelte';
  import Cropper from 'cropperjs';
  import { imageUpload } from '$lib/services/imageUpload';

  interface Props {
    currentImageUrl?: string;
    onImageUploaded: (url: string) => void;
    folder?: 'words' | 'rewards';
    aspectRatio?: number;
  }

  let {
    currentImageUrl = '',
    onImageUploaded,
    folder = 'words',
    aspectRatio = 4 / 3
  }: Props = $props();

  let fileInput: HTMLInputElement;
  let imageElement: HTMLImageElement;
  let cropper: Cropper | null = null;
  let dragActive = $state(false);
  let showCropModal = $state(false);
  let uploading = $state(false);
  let uploadProgress = $state(0);
  let error = $state('');
  let selectedFile: File | null = null;
  let previewUrl = $state('');
  let croppedPreviewUrl = $state('');
  let imageInfo = $state({ width: 0, height: 0, size: '' });

  onDestroy(() => {
    if (cropper) {
      cropper.destroy();
    }
  });

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragActive = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragActive = true;
  }

  function handleDragLeave() {
    dragActive = false;
  }

  async function processFile(file: File) {
    error = '';
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      error = 'Invalid file type. Please upload JPG, PNG, or WEBP images.';
      return;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      error = 'File size too large. Maximum size is 5MB.';
      return;
    }

    selectedFile = file;
    
    // Get image dimensions and size info
    const img = new Image();
    previewUrl = await imageUpload.fileToDataUrl(file);
    img.src = previewUrl;
    img.onload = () => {
      imageInfo = {
        width: img.width,
        height: img.height,
        size: formatFileSize(file.size)
      };
    };

    showCropModal = true;
    
    // Wait for next tick to ensure imageElement is in DOM
    setTimeout(() => {
      initializeCropper();
    }, 100);
  }

  function initializeCropper() {
    if (!imageElement) return;
    
    if (cropper) {
      cropper.destroy();
    }

    const options: any = {
      aspectRatio: aspectRatio,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      restore: false,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      ready: () => {
        updateCroppedPreview();
      },
      crop: () => {
        updateCroppedPreview();
      }
    };

    cropper = new Cropper(imageElement, options) as any;
  }

  function updateCroppedPreview() {
    if (!cropper) return;
    
    const canvas = (cropper as any).getCroppedCanvas({
      maxWidth: 800,
      maxHeight: 600,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });
    
    if (canvas) {
      croppedPreviewUrl = canvas.toDataURL('image/jpeg', 0.85);
    }
  }

  function zoomIn() {
    (cropper as any)?.zoom(0.1);
  }

  function zoomOut() {
    (cropper as any)?.zoom(-0.1);
  }

  function rotateLeft() {
    (cropper as any)?.rotate(-90);
  }

  function rotateRight() {
    (cropper as any)?.rotate(90);
  }

  function resetCrop() {
    (cropper as any)?.reset();
  }

  function closeCropModal() {
    showCropModal = false;
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    selectedFile = null;
    previewUrl = '';
    croppedPreviewUrl = '';
    error = '';
  }

  async function handleUpload() {
    if (!cropper || !selectedFile) return;

    uploading = true;
    uploadProgress = 0;
    error = '';

    try {
      // Get cropped canvas
      const canvas = (cropper as any).getCroppedCanvas({
        maxWidth: 800,
        maxHeight: 600,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob: Blob | null) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          0.85
        );
      });

      // Create file from blob
      const croppedFile = new File([blob], selectedFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      // Simulate upload progress (since Supabase doesn't provide progress)
      const progressInterval = setInterval(() => {
        uploadProgress = Math.min(uploadProgress + 10, 90);
      }, 200);

      // Upload to Supabase
      const result = await imageUpload.uploadImage(croppedFile, folder);

      clearInterval(progressInterval);
      uploadProgress = 100;

      if (result.success && result.url) {
        // Delete old image if it's a Supabase URL and we're replacing it
        if (currentImageUrl && imageUpload.isSupabaseUrl(currentImageUrl)) {
          await imageUpload.deleteImage(currentImageUrl);
        }

        onImageUploaded(result.url);
        closeCropModal();
      } else {
        error = result.error || 'Failed to upload image';
        uploadProgress = 0;
      }
    } catch (err) {
      console.error('Upload error:', err);
      error = err instanceof Error ? err.message : 'Failed to upload image';
      uploadProgress = 0;
    } finally {
      uploading = false;
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  async function handleDeleteImage() {
    if (!currentImageUrl) return;
    
    if (!confirm('Are you sure you want to delete this image?')) return;

    if (imageUpload.isSupabaseUrl(currentImageUrl)) {
      const success = await imageUpload.deleteImage(currentImageUrl);
      if (success) {
        onImageUploaded('');
      } else {
        alert('Failed to delete image from storage');
      }
    } else {
      onImageUploaded('');
    }
  }
</script>

<div class="image-uploader">
  <!-- Current Image Display -->
  {#if currentImageUrl}
    <div class="current-image">
      <label class="block mb-2 text-sm font-semibold text-gray-700">Current Image</label>
      <div class="relative group">
        <img 
          src={currentImageUrl} 
          alt="Current" 
          class="object-cover w-full h-48 border-2 border-gray-300 rounded-lg"
        />
        <div class="absolute inset-0 flex items-center justify-center gap-2 transition-opacity bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100">
          <button
            type="button"
            onclick={() => fileInput.click()}
            class="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Replace
          </button>
          <button
            type="button"
            onclick={handleDeleteImage}
            class="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  {:else}
    <!-- Upload Area -->
    <div
      class="upload-area {dragActive ? 'drag-active' : ''}"
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      onclick={() => fileInput.click()}
    >
      <div class="text-center">
        <div class="mb-4 text-6xl">📸</div>
        <p class="mb-2 text-lg font-semibold text-gray-700">
          {dragActive ? 'Drop image here' : 'Click to upload or drag & drop'}
        </p>
        <p class="text-sm text-gray-500">JPG, PNG, or WEBP • Max 5MB</p>
      </div>
    </div>
  {/if}

  <input
    type="file"
    bind:this={fileInput}
    onchange={handleFileSelect}
    accept="image/jpeg,image/jpg,image/png,image/webp"
    class="hidden"
  />
</div>

<!-- Crop Modal -->
{#if showCropModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-75">
    <div class="w-full max-w-5xl p-6 my-8 bg-white shadow-2xl rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-800">Crop & Adjust Image</h2>
        <button
          onclick={closeCropModal}
          disabled={uploading}
          class="text-2xl text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          ✕
        </button>
      </div>

      {#if error}
        <div class="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          ⚠️ {error}
        </div>
      {/if}

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left: Crop Editor -->
        <div class="lg:col-span-2">
          <div class="p-4 bg-gray-100 rounded-lg">
            <img
              bind:this={imageElement}
              src={previewUrl}
              alt="Crop preview"
              class="max-w-full"
            />
          </div>

          <!-- Crop Controls -->
          <div class="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onclick={zoomIn}
              disabled={uploading}
              class="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              🔍+ Zoom In
            </button>
            <button
              type="button"
              onclick={zoomOut}
              disabled={uploading}
              class="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              🔍- Zoom Out
            </button>
            <button
              type="button"
              onclick={rotateLeft}
              disabled={uploading}
              class="px-4 py-2 text-sm font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              ↶ Rotate Left
            </button>
            <button
              type="button"
              onclick={rotateRight}
              disabled={uploading}
              class="px-4 py-2 text-sm font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              ↷ Rotate Right
            </button>
            <button
              type="button"
              onclick={resetCrop}
              disabled={uploading}
              class="px-4 py-2 text-sm font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              ⟲ Reset
            </button>
          </div>
        </div>

        <!-- Right: Preview & Info -->
        <div class="space-y-4">
          <div>
            <label class="block mb-2 text-sm font-semibold text-gray-700">Cropped Preview</label>
            {#if croppedPreviewUrl}
              <img
                src={croppedPreviewUrl}
                alt="Cropped preview"
                class="object-cover w-full border-2 border-gray-300 rounded-lg"
              />
            {:else}
              <div class="flex items-center justify-center h-48 bg-gray-200 border-2 border-gray-300 rounded-lg">
                <span class="text-gray-500">Preview will appear here</span>
              </div>
            {/if}
          </div>

          <!-- Image Info -->
          <div class="p-4 border border-gray-300 rounded-lg bg-gray-50">
            <p class="mb-2 text-xs font-semibold text-gray-700">Original Image Info:</p>
            <ul class="space-y-1 text-xs text-gray-600">
              <li>📐 Dimensions: {imageInfo.width}×{imageInfo.height}px</li>
              <li>💾 File Size: {imageInfo.size}</li>
              <li>📁 Type: JPEG (after crop)</li>
              <li>🎯 Quality: 85%</li>
            </ul>
          </div>

          <!-- Tips -->
          <div class="p-3 border border-blue-200 rounded-lg bg-blue-50">
            <p class="mb-1 text-xs font-semibold text-blue-800">💡 Tips:</p>
            <ul class="space-y-1 text-xs text-blue-700">
              <li>• Drag the image to reposition</li>
              <li>• Drag corners to resize crop area</li>
              <li>• Use zoom for precise cropping</li>
              <li>• Final size will be optimized</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Upload Progress -->
      {#if uploading}
        <div class="mt-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Uploading...</span>
            <span class="text-sm font-semibold text-gray-700">{uploadProgress}%</span>
          </div>
          <div class="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
            <div
              class="h-full transition-all duration-300 bg-green-500"
              style="width: {uploadProgress}%"
            ></div>
          </div>
        </div>
      {/if}

      <!-- Action Buttons -->
      <div class="flex gap-3 mt-6">
        <button
          type="button"
          onclick={closeCropModal}
          disabled={uploading}
          class="flex-1 py-3 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onclick={handleUpload}
          disabled={uploading}
          class="flex-1 py-3 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : '✓ Upload Image'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .upload-area {
    border: 2px dashed #d1d5db;
    border-radius: 0.75rem;
    padding: 3rem;
    cursor: pointer;
    transition: all 0.3s;
    background: #f9fafb;
  }

  .upload-area:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .upload-area.drag-active {
    border-color: #3b82f6;
    background: #dbeafe;
    transform: scale(1.02);
  }

  .current-image {
    margin-bottom: 1rem;
  }
</style>
