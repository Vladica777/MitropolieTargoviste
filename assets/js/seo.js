/* ==========================================================================
   SEO.JS - Dynamic Meta Tags & Breadcrumbs
   ========================================================================== */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        updateBreadcrumbs();
    });

    /**
     * Update breadcrumbs dynamically if needed
     */
    function updateBreadcrumbs() {
        const breadcrumbs = document.querySelector('.breadcrumbs ol');
        if (!breadcrumbs) return;

        // Breadcrumbs are mostly static in HTML, but this function
        // can be used to update them dynamically if needed
    }

    /**
     * Update page title dynamically
     */
    window.updatePageTitle = function(title) {
        document.title = title;
        
        // Update OG tags
        updateMetaTag('og:title', title);
        updateMetaTag('twitter:title', title);
    };

    /**
     * Update page description dynamically
     */
    window.updatePageDescription = function(description) {
        updateMetaTag('description', description);
        updateMetaTag('og:description', description);
        updateMetaTag('twitter:description', description);
    };

    /**
     * Update meta tag content
     */
    function updateMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`) ||
                   document.querySelector(`meta[property="${name}"]`);
        
        if (meta) {
            meta.setAttribute('content', content);
        }
    }

    /**
     * Generate structured data for articles
     */
    window.generateArticleSchema = function(data) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": data.title,
            "image": data.image,
            "datePublished": data.publishedDate,
            "dateModified": data.modifiedDate,
            "author": {
                "@type": "Organization",
                "name": "Mitropolia Târgoviștei"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Mitropolia Târgoviștei",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://mitropolia-targovistei.ro/assets/img/logo.png"
                }
            },
            "description": data.description
        });
        
        document.head.appendChild(script);
    };

})();