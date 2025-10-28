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


/**
 * Toggle expand/collapse state
 */
function toggleExpand(expandable) {
    const isExpanded = expandable.classList.contains('is-expanded');
    const toggleBtn = expandable.querySelector('.btn-toggle');
    const content = expandable.querySelector('.expandable-content');
    const readMoreLink = expandable.querySelector('.expandable-read-more');
    const textMore = toggleBtn.getAttribute('data-text-more') || 'Arată mai mult';
    const textLess = toggleBtn.getAttribute('data-text-less') || 'Arată mai puțin';

    if (isExpanded) {
        // Collapse
        expandable.classList.remove('is-expanded');
        expandable.classList.add('is-collapsed');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = `${textMore} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        
        // ASCUNDE link-ul
        if (readMoreLink) {
            readMoreLink.style.display = 'none';
        }
        
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
        
        // AFIȘEAZĂ link-ul
        if (readMoreLink) {
            readMoreLink.style.display = 'inline-flex';
        }
    }

    // Maintain focus on button
    toggleBtn.focus();
}