/* ==========================================================================
   LIGHTBOX.JS - Photo Gallery Lightbox with Keyboard & Touch Support
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

        if (!lightbox) return;

        // Get all gallery images
        const galleryItems = document.querySelectorAll('.gallery-item img');
        images = Array.from(galleryItems);

        // Add click event to each image
        images.forEach((img, index) => {
            img.parentElement.addEventListener('click', function(e) {
                e.preventDefault();
                openLightbox(index);
            });

            // Make gallery items keyboard accessible
            img.parentElement.setAttribute('tabindex', '0');
            img.parentElement.setAttribute('role', 'button');
            img.parentElement.setAttribute('aria-label', `View image: ${img.alt}`);

            img.parentElement.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });
        });

        // Setup lightbox controls
        setupLightboxControls();
    }

    /**
     * Open lightbox at specific index
     */
    function openLightbox(index) {
        if (images.length === 0) return;

        currentIndex = index;
        updateLightboxContent();

        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Focus trap
        trapFocus();

        // Set initial focus to close button
        setTimeout(() => {
            document.querySelector('.lightbox-close').focus();
        }, 100);
    }

    /**
     * Close lightbox
     */
    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        
        // Return focus to the thumbnail that was clicked
        if (images[currentIndex]) {
            images[currentIndex].parentElement.focus();
        }
    }

    /**
     * Update lightbox content
     */
    function updateLightboxContent() {
        if (!images[currentIndex]) return;

        const img = images[currentIndex];
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;

        // Update caption
        const caption = img.getAttribute('data-caption') || img.alt;
        lightboxCaption.textContent = caption;

        // Update counter
        lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;

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

        if (images.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
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
            prevBtn.addEventListener('click', prevImage);
        }

        // Next button
        const nextBtn = document.querySelector('.lightbox-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', nextImage);
        }

        // Click overlay to close
        const overlay = document.querySelector('.lightbox-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeLightbox);
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (lightbox.style.display !== 'flex') return;

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
        const lightboxContent = document.querySelector('.lightbox-content');
        if (lightboxContent) {
            lightboxContent.addEventListener('touchstart', handleTouchStart, { passive: true });
            lightboxContent.addEventListener('touchend', handleTouchEnd, { passive: true });
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

        lightbox.addEventListener('keydown', function(e) {
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
        });
    }

})();