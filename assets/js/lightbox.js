/* ==========================================================================
   LIGHTBOX.JS - Photo Gallery Lightbox with Navigation
   ========================================================================== */

(function() {
    'use strict';

    let currentIndex = 0;
    let images = [];
    let lightbox = null;
    let lightboxImage = null;
    let lightboxCaption = null;
    let lightboxCounter = null;
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('DOMContentLoaded', function() {
        initLightbox();
    });

    /**
     * Initialize Lightbox
     */
    function initLightbox() {
        // Get lightbox elements
        lightbox = document.getElementById('lightbox');
        lightboxImage = document.getElementById('lightbox-image');
        lightboxCaption = document.getElementById('lightbox-caption');
        lightboxCounter = document.getElementById('lightbox-counter');

        if (!lightbox) {
            console.error('Lightbox element not found');
            return;
        }

        // Setup lightbox controls
        setupLightboxControls();
    }

    /**
     * Update images array (called from gallery-progressive.js or manually)
     */
    function updateImagesArray() {
        const galleryItems = document.querySelectorAll('.gallery-item img, .gallery-item-progressive img');
        images = Array.from(galleryItems);
        console.log(`Lightbox: ${images.length} images loaded`);
    }

    /**
     * Update images array - exposed globally
     */
    window.updateLightboxImages = function() {
        updateImagesArray();
    };

    /**
     * Open lightbox at specific index (exposed globally)
     */
    window.openLightbox = function(index) {
        updateImagesArray();
        
        if (images.length === 0) {
            console.error('No images found in gallery');
            return;
        }
        
        openLightbox(index);
    };

    /**
     * Open lightbox at specific index (internal)
     */
    function openLightbox(index) {
        if (images.length === 0 || index < 0 || index >= images.length) {
            return;
        }

        currentIndex = index;
        updateLightboxContent();

        lightbox.style.display = 'flex';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus management
        trapFocus();

        // Set initial focus to close button
        setTimeout(() => {
            const closeBtn = document.querySelector('.lightbox-close');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    /**
     * Close lightbox
     */
    function closeLightbox() {
        lightbox.style.display = 'none';
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to the thumbnail that was clicked
        if (images[currentIndex]) {
            const parent = images[currentIndex].closest('.gallery-item, .gallery-item-progressive');
            if (parent) parent.focus();
        }
    }

    /**
     * Update lightbox content
     */
    function updateLightboxContent() {
        if (!images[currentIndex]) return;

        const img = images[currentIndex];
        
        // Update image
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt || 'Imagine din galerie';

        // Update caption
        const caption = img.getAttribute('data-caption') || img.alt || '';
        if (lightboxCaption) {
            lightboxCaption.textContent = caption;
        }

        // Update counter
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
        }

        // Update navigation button states
        updateNavigationButtons();
    }

    /**
     * Navigate to next image
     */
    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        updateLightboxContent();
    }

    /**
     * Navigate to previous image
     */
    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightboxContent();
    }

    /**
     * Update navigation button states
     */
    function updateNavigationButtons() {
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');

        if (!prevBtn || !nextBtn) return;

        if (images.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }

        // Update aria-disabled
        prevBtn.setAttribute('aria-disabled', 'false');
        nextBtn.setAttribute('aria-disabled', 'false');
    }

    /**
     * Setup lightbox controls
     */
    function setupLightboxControls() {
        // Close button
        const closeBtn = document.querySelector('.lightbox-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeLightbox);
        }

        // Previous button
        const prevBtn = document.querySelector('.lightbox-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                prevImage();
            });
        }

        // Next button
        const nextBtn = document.querySelector('.lightbox-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                nextImage();
            });
        }

        // Click overlay to close
        const overlay = document.querySelector('.lightbox-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeLightbox);
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox || lightbox.style.display !== 'flex') return;

            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        });

        // Touch events for swipe
        const lightboxContainer = document.querySelector('.lightbox-container');
        if (lightboxContainer) {
            lightboxContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
            lightboxContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
    }

    /**
     * Handle touch start
     */
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }

    /**
     * Handle touch end
     */
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }

    /**
     * Handle swipe gesture
     */
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                nextImage();
            } else {
                // Swipe right - previous image
                prevImage();
            }
        }
    }

    /**
     * Trap focus within lightbox
     */
    function trapFocus() {
        const focusableElements = lightbox.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        const handleTabKey = function(e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        lightbox.addEventListener('keydown', handleTabKey);
    }

    /**
     * Public API
     */
    window.lightboxAPI = {
        open: function(index) {
            window.openLightbox(index);
        },
        close: function() {
            closeLightbox();
        },
        next: function() {
            nextImage();
        },
        prev: function() {
            prevImage();
        },
        getCurrentIndex: function() {
            return currentIndex;
        }
    };

})();