import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiPhotograph, HiUpload, HiX, HiStar } from 'react-icons/hi';
import adminApi from '../../config/api';
import toast from 'react-hot-toast';

const ImageUploader = ({ images = [], onChange, maxImages = 20, multiple = true }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const response = multiple && files.length > 1
        ? await adminApi.uploadImages(formData)
        : await adminApi.uploadImage(formData);

      const newImages = multiple && files.length > 1
        ? response.data.images
        : [response.data.image];

      onChange([...images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const setAsPrimary = (index) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="input-label">Property Images</label>
        <span className="text-xs text-[var(--color-text-muted)]">
          {images.length}/{maxImages} images
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
        {images.map((image, index) => (
          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden">
            <img src={image.url} alt="" className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!image.isPrimary && (
                <button
                  type="button"
                  onClick={() => setAsPrimary(index)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:text-[var(--color-primary)] transition-colors"
                  title="Set as primary"
                >
                  <HiStar className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/40 transition-colors"
                title="Remove"
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>

            {image.isPrimary && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-[var(--color-bg-dark)]">
                Primary
              </div>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-[var(--color-primary)]/50 transition-all flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            {uploading ? (
              <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <HiUpload className="w-8 h-8" />
                <span className="text-xs">Upload</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;