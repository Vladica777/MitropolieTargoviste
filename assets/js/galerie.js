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
        updateImagesArray();

        // Add click event to each image
        images.forEach((img, index) => {
            const parent = img.parentElement;
            
            // Skip if already has event listener (progressive gallery handles this)
            if (parent.classList.contains('gallery-item-progressive')) {
                return;
            }

            parent.addEventListener('click', function(e) {
                e.preventDefault();
                openLightbox(index);
            });

            // Make gallery items keyboard accessible
            parent.setAttribute('tabindex', '0');
            parent.setAttribute('role', 'button');
            parent.setAttribute('aria-label', `View image: ${img.alt}`);

            parent.addEventListener('keydown', function(e) {
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
     * Update images array (called from gallery-progressive.js or manually)
     */
    function updateImagesArray() {
        const galleryItems = document.querySelectorAll('.gallery-item img, .gallery-item-progressive img');
        images = Array.from(galleryItems);
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
        openLightbox(index);
    };

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
            const closeBtn = document.querySelector('.lightbox-close');
            if (closeBtn) closeBtn.focus();
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
            const parent = images[currentIndex].parentElement;
            if (parent) parent.focus();
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

        const handleTabKey = function(e) {
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

})();



/* ==========================================================================
   GALLERY-PROGRESSIVE.JS - Progressive Image Loading
   ========================================================================== */

(function() {
    'use strict';

    let galleryData = [];
    let currentIndex = 0;
    let currentBreakpoint = 'mobile';

    const config = {
        initialCount: {
            mobile: 4,
            tablet: 6,
            desktop: 8
        },
        batchPerClick: {
            mobile: 2,
            tablet: 3,
            desktop: 4
        },
        breakpoints: {
            tablet: 768,
            desktop: 1024
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        const galleryGrid = document.getElementById('gallery-grid');
        
        if (!galleryGrid) return;

        initGallery();
    });

    /**
     * Initialize gallery
     */
    async function initGallery() {
        await loadGalleryData();
        detectBreakpoint();
        renderInitialImages();
        setupMoreButton();
        setupResizeHandler();
    }

    /**
     * Load gallery data from JSON
     */
    async function loadGalleryData() {
        try {
            const response = await fetch('/data/gallery.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            galleryData = await response.json();
        } catch (error) {
            console.error('Error loading gallery data:', error);
            // Fallback to empty array
            galleryData = [];
        }
    }

    /**
     * Detect current breakpoint
     */
    function detectBreakpoint() {
        const width = window.innerWidth;
        
        if (width >= config.breakpoints.desktop) {
            currentBreakpoint = 'desktop';
        } else if (width >= config.breakpoints.tablet) {
            currentBreakpoint = 'tablet';
        } else {
            currentBreakpoint = 'mobile';
        }
    }

    /**
     * Render initial images based on breakpoint
     */
    function renderInitialImages() {
        const initialCount = config.initialCount[currentBreakpoint];
        const imagesToRender = galleryData.slice(0, initialCount);
        
        currentIndex = initialCount;
        renderImages(imagesToRender, 0);
        updateMoreButton();
    }

    /**
     * Render images to grid
     */
    function renderImages(images, startIndex) {
        const galleryGrid = document.getElementById('gallery-grid');
        
        images.forEach((image, index) => {
            const globalIndex = startIndex + index;
            const item = createGalleryItem(image, globalIndex);
            galleryGrid.appendChild(item);
            
            // Trigger animation with slight delay for stagger effect
            setTimeout(() => {
                item.style.animationDelay = `${index * 50}ms`;
            }, 10);
        });

        // Update lightbox images array
        if (typeof window.updateLightboxImages === 'function') {
            window.updateLightboxImages();
        }
    }

    /**
     * Create gallery item element
     */
    function createGalleryItem(imageData, globalIndex) {
        const item = document.createElement('div');
        item.className = 'gallery-item gallery-item-progressive';
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View image: ${imageData.alt || 'Gallery image'}`);
        
        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt || '';
        img.loading = 'lazy';
        img.width = imageData.width || 800;
        img.height = imageData.height || 600;
        
        // Add srcset if available
        if (imageData.srcset) {
            img.srcset = imageData.srcset;
            img.sizes = imageData.sizes || '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw';
        }
        
        // Add data attributes for lightbox
        if (imageData.caption) {
            img.setAttribute('data-caption', imageData.caption);
        }
        
        item.appendChild(img);
        
        // Add click handler for lightbox (if exists)
        item.addEventListener('click', function() {
            openLightboxAtIndex(globalIndex);
        });

        // Add keyboard handler
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightboxAtIndex(globalIndex);
            }
        });
        
        return item;
    }

    /**
     * Open lightbox at specific index
     */
    function openLightboxAtIndex(index) {
        if (typeof window.openLightbox === 'function') {
            window.openLightbox(index);
        }
    }

    /**
     * Setup "Load More" button
     */
    function setupMoreButton() {
        const moreBtn = document.getElementById('gallery-more');
        
        if (!moreBtn) return;

        moreBtn.addEventListener('click', function() {
            loadMoreImages();
        });
    }

    /**
     * Load more images
     */
    function loadMoreImages() {
        const moreBtn = document.getElementById('gallery-more');
        const batchSize = config.batchPerClick[currentBreakpoint];
        const imagesToLoad = galleryData.slice(currentIndex, currentIndex + batchSize);
        
        if (imagesToLoad.length === 0) {
            updateMoreButton();
            return;
        }
        
        // Show loading state
        moreBtn.disabled = true;
        const originalHTML = moreBtn.innerHTML;
        moreBtn.innerHTML = '<span class="gallery-loading"></span> Se încarcă...';
        
        // Simulate network delay for smooth UX
        setTimeout(() => {
            const startIndex = currentIndex;
            renderImages(imagesToLoad, startIndex);
            currentIndex += imagesToLoad.length;
            
            // Update button
            moreBtn.disabled = false;
            moreBtn.innerHTML = originalHTML;
            updateMoreButton();
            
            // Announce to screen readers
            announceImagesLoaded(imagesToLoad.length);
            
            // Keep focus on button
            moreBtn.focus();
        }, 300);
    }

    /**
     * Update "Load More" button state
     */
    function updateMoreButton() {
        const moreBtn = document.getElementById('gallery-more');
        
        if (!moreBtn) return;

        const remainingImages = galleryData.length - currentIndex;
        
        if (remainingImages <= 0) {
            moreBtn.setAttribute('aria-disabled', 'true');
            moreBtn.style.display = 'none';
            
            // Show completion message
            showCompletionMessage();
        } else {
            moreBtn.setAttribute('aria-disabled', 'false');
            const lang = document.documentElement.lang || 'ro';
            const textMore = lang === 'en' ? 'Load More' : 'Arată mai mult';
            moreBtn.innerHTML = `${textMore} (${remainingImages})`;
        }
    }

    /**
     * Show completion message
     */
    function showCompletionMessage() {
        const galleryGrid = document.getElementById('gallery-grid');
        const existingStatus = document.querySelector('.gallery-status');
        
        if (existingStatus) return;
        
        const status = document.createElement('p');
        status.className = 'gallery-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        
        const lang = document.documentElement.lang || 'ro';
        status.textContent = lang === 'en' 
            ? 'All images have been loaded.' 
            : 'Toate imaginile au fost încărcate.';
        
        galleryGrid.parentElement.appendChild(status);
    }

    /**
     * Announce images loaded to screen readers
     */
    function announceImagesLoaded(count) {
        const galleryGrid = document.getElementById('gallery-grid');
        const lang = document.documentElement.lang || 'ro';
        
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        
        announcement.textContent = lang === 'en'
            ? `${count} images loaded.`
            : `${count} imagini încărcate.`;
        
        galleryGrid.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }

    /**
     * Setup resize handler (debounced)
     */
    function setupResizeHandler() {
        let resizeTimer;
        
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const oldBreakpoint = currentBreakpoint;
                detectBreakpoint();
                
                // Only update button text, don't re-render images
                if (oldBreakpoint !== currentBreakpoint) {
                    updateMoreButton();
                }
            }, 250);
        });
    }

    /**
     * Public API
     */
    window.progressiveGalleryAPI = {
        reload: function() {
            currentIndex = 0;
            const galleryGrid = document.getElementById('gallery-grid');
            if (galleryGrid) {
                galleryGrid.innerHTML = '';
            }
            initGallery();
        },
        loadMore: function() {
            loadMoreImages();
        }
    };

})();



/* ==========================================================================
   EXPANDABLE.JS - Toggle Expand/Collapse Content
   ========================================================================== */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initExpandables();
    });

    /**
     * Initialize all expandable sections
     */
    function initExpandables() {
        const expandables = document.querySelectorAll('.expandable');
        
        expandables.forEach(expandable => {
            const toggleBtn = expandable.querySelector('.btn-toggle');
            
            if (!toggleBtn) return;

            toggleBtn.addEventListener('click', function() {
                toggleExpand(expandable);
            });
        });
    }

    /**
     * Toggle expand/collapse state
     */
    function toggleExpand(expandable) {
        const isExpanded = expandable.classList.contains('is-expanded');
        const toggleBtn = expandable.querySelector('.btn-toggle');
        const content = expandable.querySelector('.expandable-content');
        const textMore = toggleBtn.getAttribute('data-text-more') || 'Arată mai mult';
        const textLess = toggleBtn.getAttribute('data-text-less') || 'Arată mai puțin';

        if (isExpanded) {
            // Collapse
            expandable.classList.remove('is-expanded');
            expandable.classList.add('is-collapsed');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.innerHTML = `${textMore} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
            
            // Smooth scroll to section top
            const headerOffset = 80;
            const elementPosition = expandable.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            // Expand
            expandable.classList.remove('is-collapsed');
            expandable.classList.add('is-expanded');
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.innerHTML = `${textLess} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        }

        // Maintain focus on button
        toggleBtn.focus();
    }

    /**
     * Public API for manual control
     */
    window.expandableAPI = {
        expand: function(sectionId) {
            const expandable = document.getElementById(sectionId);
            if (expandable && expandable.classList.contains('is-collapsed')) {
                toggleExpand(expandable);
            }
        },
        collapse: function(sectionId) {
            const expandable = document.getElementById(sectionId);
            if (expandable && expandable.classList.contains('is-expanded')) {
                toggleExpand(expandable);
            }
        }
    };

})();