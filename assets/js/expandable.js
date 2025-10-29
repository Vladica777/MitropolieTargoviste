/* ==========================================================================
   EXPANDABLE.JS - Toggle Expand Content (Single Direction)
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
                expandContent(expandable);
            });
        });
    }

    /**
     * Expand content (one-way, no collapse)
     */
    function expandContent(expandable) {
        const toggleBtn = expandable.querySelector('.btn-toggle');
        const content = expandable.querySelector('.expandable-content');
        
        // Expand
        expandable.classList.remove('is-collapsed');
        expandable.classList.add('is-expanded');
        toggleBtn.setAttribute('aria-expanded', 'true');
        
        // Hide the button completely after expansion
        setTimeout(() => {
            toggleBtn.style.display = 'none';
        }, 300);
    }

    /**
     * Public API for manual control
     */
    window.expandableAPI = {
        expand: function(sectionId) {
            const expandable = document.getElementById(sectionId);
            if (expandable && expandable.classList.contains('is-collapsed')) {
                expandContent(expandable);
            }
        }
    };

})();