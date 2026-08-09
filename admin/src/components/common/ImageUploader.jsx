import { useRef, useState } from 'react';
import { HiStar, HiUpload, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const getApiBaseUrl = () => (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');

const buildDefaultAlt = (propertyName, index) => {
  const name = propertyName?.trim() || 'Stay Wise Miami vacation rental';
  return `${name} - property photo ${index + 1}`;
};

const ImageUploader = ({ images = [], onChange, maxImages = 20, multiple = true, propertyName = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const updateImageAlt = (indexToUpdate, alt) => {
    const updated = images.map((image, index) => (
      index === indexToUpdate ? { ...image, alt } : image
    ));
    onChange(updated);
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (>5MB)`);
      } else if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} (not an image)`);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();

      if (multiple) {
        validFiles.forEach((file) => formData.append('images', file));
      } else {
        formData.append('image', validFiles[0]);
      }

      const token = localStorage.getItem('mlr_admin_token');
      const endpoint = multiple ? '/upload/images' : '/upload/image';
      const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      const uploadedImages = multiple && data.images ? data.images : data.image ? [data.image] : [];
      const hasExistingPrimary = images.some((image) => image.isPrimary === true);

      const formattedImages = uploadedImages.map((image, index) => {
        const nextIndex = images.length + index;
        return {
          url: image.url,
          publicId: image.publicId,
          alt: image.alt || buildDefaultAlt(propertyName, nextIndex),
          isPrimary: !hasExistingPrimary && images.length === 0 && index === 0,
          order: nextIndex,
          size: image.size,
          format: image.format,
        };
      });

      onChange([...images, ...formattedImages]);
      toast.success(`${formattedImages.length} image(s) uploaded successfully`);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (indexToRemove) => {
    const updated = images.filter((_, index) => index !== indexToRemove);
    const wasPrimaryRemoved = images[indexToRemove]?.isPrimary;

    if (wasPrimaryRemoved && updated.length > 0) {
      updated[0] = { ...updated[0], isPrimary: true };
    }

    onChange(updated);
    toast.success('Image removed');
  };

  const setAsPrimary = (selectedIndex) => {
    const updated = images.map((image, index) => ({
      ...image,
      isPrimary: index === selectedIndex,
    }));
    onChange(updated);
    toast.success('Primary image updated');
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="input-label">Property Images</label>
        <span className="text-xs text-[var(--color-text-muted)]">
          {images.length}/{maxImages} images
        </span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div key={image.publicId || image.url || index} className="space-y-2">
            <div className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[var(--color-surface)]">
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.alt || buildDefaultAlt(propertyName, index)}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = 'https://placehold.co/400x400?text=Image+Error';
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface)]">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                    <span className="text-xs text-[var(--color-text-muted)]">Loading...</span>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {!image.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setAsPrimary(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 hover:text-yellow-400"
                    title="Set as primary"
                  >
                    <HiStar className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/40 hover:text-red-300"
                  title="Remove"
                >
                  <HiX className="h-4 w-4" />
                </button>
              </div>

              {image.isPrimary && (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-semibold text-black">
                  <HiStar className="h-3 w-3" />
                  Primary
                </div>
              )}

              <div className="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                {index + 1}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                SEO alt text
              </span>
              <input
                type="text"
                value={image.alt || ''}
                onChange={(event) => updateImageAlt(index, event.target.value)}
                placeholder={buildDefaultAlt(propertyName, index)}
                className="input-field min-h-[42px] text-xs"
              />
            </label>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-white/20 bg-[var(--color-surface)] flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)] transition-all hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                <span className="text-xs">Uploading... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <HiUpload className="h-6 w-6" />
                <span className="text-xs">Upload Image</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        Supported formats: JPEG, PNG, WEBP. Max file size: 5MB per image.
        {images.length > 0 && (
          <span className="mt-1 block text-yellow-400">
            Add clear alt text like "Oceanfront condo balcony in Brickell" for better SEO and accessibility.
          </span>
        )}
      </p>
    </div>
  );
};

export default ImageUploader;
