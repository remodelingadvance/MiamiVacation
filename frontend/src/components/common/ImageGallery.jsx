import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiChevronLeft, HiChevronRight, HiPhotograph } from 'react-icons/hi';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const ImageGallery = ({ images, alt = 'Property image' }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());

  const openLightbox = (index) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeLightbox();
  };

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-[var(--color-bg-light)] rounded-2xl flex items-center justify-center">
        <div className="text-center text-[var(--color-text-muted)]">
          <HiPhotograph className="w-12 h-12 mx-auto mb-2" />
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Gallery grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
        {/* Main image */}
        <div className="md:col-span-2 md:row-span-2 relative cursor-pointer group" onClick={() => openLightbox(0)}>
          <LazyLoadImage
            src={images[0]?.url}
            alt={images[0]?.alt || alt}
            effect="blur"
            className="w-full h-full object-cover aspect-[4/3] md:aspect-auto"
            afterLoad={() => handleImageLoad(0)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        </div>

        {/* Secondary images */}
        {images.slice(1, 5).map((image, index) => (
          <div key={index + 1} className="relative cursor-pointer group hidden md:block" onClick={() => openLightbox(index + 1)}>
            <LazyLoadImage
              src={image.url}
              alt={image.alt || alt}
              effect="blur"
              className="w-full h-full object-cover aspect-[4/3]"
              afterLoad={() => handleImageLoad(index + 1)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            
            {/* Show all photos button on last visible image */}
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <button className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white font-semibold text-sm">
                  +{images.length - 5} more photos
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:text-[var(--color-primary)] transition-colors"
            >
              <HiX className="w-6 h-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full glass text-white text-sm">
              {selectedIndex + 1} / {images.length}
            </div>

            {/* Previous button */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:text-[var(--color-primary)] transition-colors"
            >
              <HiChevronLeft className="w-6 h-6" />
            </button>

            {/* Image */}
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={images[selectedIndex]?.url}
              alt={images[selectedIndex]?.alt || alt}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next button */}
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:text-[var(--color-primary)] transition-colors"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>

            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(index); }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedIndex ? 'border-[var(--color-primary)]' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={image.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;