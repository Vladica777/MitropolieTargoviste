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
        mobile: 4,    // 2×2 sau 4×1
        tablet: 4,    // 2×2 
        desktop: 6    // 3×2 (redus de la 8)
    },
    batchPerClick: {
        mobile: 4,
        tablet: 4,
        desktop: 6    // 3×2 (redus de la 8)
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
            // Fallback to hardcoded images if JSON fails
            galleryData = generateFallbackGallery();
        }
    }

    /**
     * Generate fallback gallery if JSON fails
     */
    function generateFallbackGallery() {
        const fallback = [];
        for (let i = 1; i <= 20; i++) {
            fallback.push({
                src: `/assets/img/gallery/img${i}.jpg`,
                alt: `Imagine ${i}`,
                caption: `Imagine din galerie ${i}`,
                width: 1200,
                height: 900
            });
        }
        return fallback;
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
            
            // Trigger fade-in animation
            setTimeout(() => {
                item.classList.add('fade-in');
            }, index * 50);
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
        item.setAttribute('aria-label', `Vizualizează: ${imageData.alt || 'Imagine din galerie'}`);
        
        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt || '';
        img.loading = 'lazy';
        img.width = imageData.width || 800;
        img.height = imageData.height || 600;
        
        // Add data attributes for lightbox
        if (imageData.caption) {
            img.setAttribute('data-caption', imageData.caption);
        }
        img.setAttribute('data-index', globalIndex);
        
        item.appendChild(img);
        
        // Add click handler for lightbox
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
        const btnText = moreBtn.querySelector('.btn-text');
        const batchSize = config.batchPerClick[currentBreakpoint];
        const imagesToLoad = galleryData.slice(currentIndex, currentIndex + batchSize);
        
        if (imagesToLoad.length === 0) {
            updateMoreButton();
            return;
        }
        
        // Show loading state
        moreBtn.disabled = true;
        btnText.innerHTML = '<span class="gallery-loading"></span> Se încarcă...';
        
        // Simulate network delay for smooth UX
        setTimeout(() => {
            const startIndex = currentIndex;
            renderImages(imagesToLoad, startIndex);
            currentIndex += imagesToLoad.length;
            
            // Update button
            moreBtn.disabled = false;
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
        const btnText = moreBtn?.querySelector('.btn-text');
        
        if (!moreBtn || !btnText) return;

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
            btnText.textContent = `${textMore} (${remainingImages})`;
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
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        
        const lang = document.documentElement.lang || 'ro';
        announcement.textContent = lang === 'en'
            ? `${count} images loaded.`
            : `${count} imagini încărcate.`;
        
        document.body.appendChild(announcement);
        
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
        },
        getLoadedCount: function() {
            return currentIndex;
        },
        getTotalCount: function() {
            return galleryData.length;
        }
    };

})();