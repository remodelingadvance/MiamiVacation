import { useState, useRef } from 'react';
import { HiStar, HiUpload, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ImageUploader = ({ images = [], onChange, maxImages = 20, multiple = true }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (images.length + files.length > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`);
            return;
        }

        // Validate file sizes and types
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

            // Create FormData and append files
            const formData = new FormData();
            
            if (multiple) {
                validFiles.forEach((file) => {
                    formData.append('images', file);
                });
            } else {
                formData.append('image', validFiles[0]);
            }

            // Get token from localStorage
            const token = localStorage.getItem('mlr_admin_token');
            
            // Make direct API call to upload endpoint
            const endpoint = multiple ? '/api/v1/upload/images' : '/api/v1/upload/image';
            
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }

            const data = await response.json();
            
            let newImages = [];
            if (multiple && data.images) {
                newImages = data.images;
            } else if (data.image) {
                newImages = [data.image];
            }

            // Check if there are any existing images
            const hasExistingPrimary = images.some(img => img.isPrimary === true);
            
            // Format new images - only set as primary if no existing primary and this is the first image
            const formattedImages = newImages.map((img, idx) => ({
                url: img.url,
                publicId: img.publicId,
                alt: img.alt || '',
                isPrimary: !hasExistingPrimary && images.length === 0 && idx === 0,
                order: images.length + idx,
                size: img.size,
                format: img.format
            }));

            onChange([...images, ...formattedImages]);
            toast.success(`${formattedImages.length} image(s) uploaded successfully`);
            
            // Reset file input
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
        const updated = images.filter((_, idx) => idx !== indexToRemove);
        
        // Check if we removed the primary image
        const wasPrimaryRemoved = images[indexToRemove]?.isPrimary;
        
        if (wasPrimaryRemoved && updated.length > 0) {
            // Set the first image as primary
            updated[0].isPrimary = true;
        }
        
        onChange(updated);
        toast.success('Image removed');
    };

    const setAsPrimary = (index) => {
    const updated = images.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,  // Only the selected index gets true
    }));
    onChange(updated);
    toast.success('Primary image updated');
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
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-[var(--color-surface)] border border-white/10">
                        {image.url ? (
                            <img 
                                src={image.url} 
                                alt={image.alt || `Property image ${index + 1}`} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/400x400?text=Image+Error';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface)]">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <span className="text-xs text-[var(--color-text-muted)]">Loading...</span>
                                </div>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {/* Only show "Set as Primary" button if this image is not already primary */}
                            {!image.isPrimary && (
                                <button
                                    type="button"
                                    onClick={() => setAsPrimary(index)}
                                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white hover:text-yellow-400 transition-colors"
                                    title="Set as primary"
                                >
                                    <HiStar className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                                title="Remove"
                            >
                                <HiX className="w-4 h-4" />
                            </button>
                        </div>

                        {image.isPrimary && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-yellow-500 text-[10px] font-semibold text-black flex items-center gap-1">
                                <HiStar className="w-3 h-3" />
                                Primary
                            </div>
                        )}
                        
                        {/* Image order indicator */}
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-white">
                            {index + 1}
                        </div>
                    </div>
                ))}

                {images.length < maxImages && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-[var(--color-primary)]/50 transition-all flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] bg-[var(--color-surface)]"
                    >
                        {uploading ? (
                            <>
                                <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs">Uploading... {uploadProgress}%</span>
                            </>
                        ) : (
                            <>
                                <HiUpload className="w-6 h-6" />
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
            
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Supported formats: JPEG, PNG, WEBP. Max file size: 5MB per image.
                {images.length > 0 && (
                    <span className="block mt-1 text-yellow-400">
                        Tip: Click the star icon on any image to set it as the primary image
                    </span>
                )}
            </p>
        </div>
    );
};

export default ImageUploader;