/* ==========================================================================
   I18N.JS - Internationalization (RO/EN)
   ========================================================================== */

(function() {
    'use strict';

    let currentLang = 'ro';
    let translations = {};

    document.addEventListener('DOMContentLoaded', function() {
        initI18n();
    });

    /**
     * Initialize Internationalization
     */
    async function initI18n() {
        // Get saved language preference or default to 'ro'
        currentLang = localStorage.getItem('language') || 'ro';
        
        // Load translations
        await loadTranslations(currentLang);
        
        // Apply translations
        applyTranslations();
        
        // Set HTML lang attribute
        document.documentElement.setAttribute('lang', currentLang);
        
        // Update language switcher
        updateLanguageSwitcher();
        
        // Setup language switcher event
        setupLanguageSwitcher();
    }

    /**
     * Load translations from JSON file
     */
    async function loadTranslations(lang) {
        try {
            const response = await fetch(`/data/i18n-${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to Romanian if loading fails
            if (lang !== 'ro') {
                currentLang = 'ro';
                await loadTranslations('ro');
            }
        }
    }

    /**
     * Apply translations to elements with data-i18n attribute
     */
    function applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getNestedTranslation(key);
            
            if (translation) {
                // Check if element is an input placeholder
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    /**
     * Get nested translation by dot notation key
     */
    function getNestedTranslation(key) {
        return key.split('.').reduce((obj, k) => obj && obj[k], translations);
    }

    /**
     * Setup language switcher button
     */
    function setupLanguageSwitcher() {
        const langSwitch = document.querySelector('.lang-switch');
        
        if (!langSwitch) return;

        langSwitch.addEventListener('click', async function() {
            // Toggle language
            const newLang = currentLang === 'ro' ? 'en' : 'ro';
            
            // Save preference
            localStorage.setItem('language', newLang);
            currentLang = newLang;
            
            // Reload translations and apply
            await loadTranslations(newLang);
            applyTranslations();
            
            // Update HTML lang attribute
            document.documentElement.setAttribute('lang', newLang);
            
            // Update switcher
            updateLanguageSwitcher();
        });
    }

    /**
     * Update language switcher display
     */
    function updateLanguageSwitcher() {
        const langSwitch = document.querySelector('.lang-switch');
        const langText = langSwitch?.querySelector('.lang-text');
        
        if (!langSwitch || !langText) return;

        // Update to show opposite language (what it will switch TO)
        const displayLang = currentLang === 'ro' ? 'EN' : 'RO';
        langText.textContent = displayLang;
        langSwitch.setAttribute('data-lang', currentLang === 'ro' ? 'en' : 'ro');
    }

    /**
     * Get current language
     */
    window.getCurrentLanguage = function() {
        return currentLang;
    };

    /**
     * Get translation by key
     */
    window.getTranslation = function(key) {
        return getNestedTranslation(key);
    };

})();