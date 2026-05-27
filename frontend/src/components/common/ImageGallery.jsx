import { useState, useCallback, useEffect } from 'react';
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

  useEffect(() => {
    if (selectedIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') goToPrevious();
      if (event.key === 'ArrowRight') goToNext();
      if (event.key === 'Escape') closeLightbox();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious, selectedIndex]);

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
      <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl md:grid-cols-4">
        {/* Main image */}
        <button
          type="button"
          className="group relative cursor-pointer text-left md:col-span-2 md:row-span-2"
          onClick={() => openLightbox(0)}
        >
          <LazyLoadImage
            src={images[0]?.url}
            alt={images[0]?.alt || alt}
            effect="blur"
            className="w-full h-full object-cover aspect-[4/3] md:aspect-auto"
            afterLoad={() => handleImageLoad(0)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        </button>

        {/* Secondary images */}
        {images.slice(1, 5).map((image, index) => (
          <button
            key={index + 1}
            type="button"
            className="group relative hidden cursor-pointer text-left md:block"
            onClick={() => openLightbox(index + 1)}
          >
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
                <span className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                  +{images.length - 5} more photos
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(7,20,76,0.96)] p-4"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Property photo gallery"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                closeLightbox();
              }}
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-text-primary)] shadow-xl transition-colors hover:text-[var(--color-primary)]"
              aria-label="Close gallery"
            >
              <HiX className="w-6 h-6" />
            </button>

            {/* Image counter */}
            <div className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1.5 text-sm font-black text-[var(--color-text-primary)] shadow-xl">
              {selectedIndex + 1} / {images.length}
            </div>

            {/* Previous button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-text-primary)] shadow-xl transition-colors hover:text-[var(--color-primary)]"
              aria-label="Previous photo"
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
              className="max-h-[78vh] w-auto max-w-[min(92vw,1400px)] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-text-primary)] shadow-xl transition-colors hover:text-[var(--color-primary)]"
              aria-label="Next photo"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>

            {/* Thumbnails */}
            <div
              className="absolute bottom-4 left-1/2 flex max-w-[min(92vw,1400px)] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl bg-white/12 p-2 backdrop-blur"
              onClick={(event) => event.stopPropagation()}
            >
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(index); }}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    index === selectedIndex ? 'border-[var(--color-primary)] opacity-100' : 'border-transparent opacity-65 hover:opacity-100'
                  }`}
                  aria-label={`Open photo ${index + 1}`}
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
