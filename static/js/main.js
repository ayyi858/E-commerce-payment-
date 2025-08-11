/**
 * ===========================
 * MANIPI MAIN JAVASCRIPT
 * Enhanced main.js with dropdown integration
 * File: static/js/main.js
 * ===========================
 */

(function() {
    'use strict';

    // Global configuration
    const MANIPI_CONFIG = {
        // Animation durations
        animationSpeed: 300,
        scrollSpeed: 800,
        
        // Breakpoints
        breakpoints: {
            mobile: 768,
            tablet: 992,
            desktop: 1200
        },
        
        // Selectors
        selectors: {
            backToTop: '#back-to-top',
            loadingOverlay: '#loading-overlay',
            alerts: '.alert',
            navbar: '#main-navbar',
            searchForm: '.search-form',
            cartButtons: '[data-cart-action]',
            wishlistButtons: '[data-wishlist-action]'
        }
    };

    /**
     * Initialize application
     */
    function initApp() {
        console.log('Manipi: Initializing application...');
        
        try {
            initBackToTop();
            initSmoothScrolling();
            initAlertHandling();
            initNavbarBehavior();
            initLoadingOverlay();
            initFormEnhancements();
            initImageLazyLoading();
            initCartIntegration();
            initWishlistIntegration();
            initSearchEnhancements();
            initPerformanceMonitoring();
            
            console.log('Manipi: Application initialized successfully');
        } catch (error) {
            console.error('Manipi: Application initialization failed', error);
        }
    }

    /**
     * Initialize back to top button
     */
    function initBackToTop() {
        const backToTopBtn = document.querySelector(MANIPI_CONFIG.selectors.backToTop);
        if (!backToTopBtn) return;

        let ticking = false;

        function updateBackToTopVisibility() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
            
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateBackToTopVisibility);
                ticking = true;
            }
        }

        // Scroll event listener
        window.addEventListener('scroll', requestTick, { passive: true });

        // Click event listener
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Focus management for accessibility
            setTimeout(() => {
                const focusTarget = document.querySelector('h1, .navbar-brand');
                if (focusTarget) {
                    focusTarget.focus();
                }
            }, MANIPI_CONFIG.scrollSpeed);
            
            trackEvent('scroll_to_top');
        });

        // Initial check
        updateBackToTopVisibility();
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    function initSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector(MANIPI_CONFIG.selectors.navbar)?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update focus
                    setTimeout(() => {
                        targetElement.focus();
                        targetElement.scrollIntoView({ block: 'nearest' });
                    }, MANIPI_CONFIG.scrollSpeed);
                }
            });
        });
    }

    /**
     * Initialize alert handling
     */
    function initAlertHandling() {
        const alerts = document.querySelectorAll(MANIPI_CONFIG.selectors.alerts);
        
        alerts.forEach(alert => {
            // Auto-dismiss alerts after 5 seconds (except error alerts)
            if (!alert.classList.contains('alert-danger') && !alert.classList.contains('alert-error')) {
                setTimeout(() => {
                    dismissAlert(alert);
                }, 5000);
            }
            
            // Add dismiss animation
            const closeBtn = alert.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => dismissAlert(alert));
            }
        });
    }

    /**
     * Dismiss alert with animation
     */
    function dismissAlert(alert) {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            alert.remove();
        }, MANIPI_CONFIG.animationSpeed);
    }

    /**
     * Initialize navbar behavior
     */
    function initNavbarBehavior() {
        const navbar = document.querySelector(MANIPI_CONFIG.selectors.navbar);
        if (!navbar) return;

        let lastScrollTop = 0;
        let ticking = false;

        function updateNavbar() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add shadow when scrolled
            if (scrollTop > 10) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
            
            // Hide/show navbar on scroll (optional)
            if (Math.abs(scrollTop - lastScrollTop) > 50) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    navbar.classList.add('navbar-hidden');
                } else {
                    navbar.classList.remove('navbar-hidden');
                }
                lastScrollTop = scrollTop;
            }
            
            ticking = false;
        }

        function requestNavbarTick() {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestNavbarTick, { passive: true });
        
        // Initial check
        updateNavbar();
    }

    /**
     * Initialize loading overlay
     */
    function initLoadingOverlay() {
        const loadingOverlay = document.querySelector(MANIPI_CONFIG.selectors.loadingOverlay);
        if (!loadingOverlay) return;

        // Hide loading overlay after page load
        window.addEventListener('load', () => {
            hideLoading();
        });

        // Show loading for form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                // Don't show loading for GET forms (search forms)
                if (form.method.toLowerCase() !== 'get') {
                    showLoading();
                }
            });
        });

        // Show loading for navigation
        const navLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([target="_blank"]):not([data-no-loading])');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                showLoading();
            });
        });
    }

    /**
     * Show loading overlay
     */
    function showLoading() {
        const loadingOverlay = document.querySelector(MANIPI_CONFIG.selectors.loadingOverlay);
        if (loadingOverlay) {
            loadingOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide loading overlay
     */
    function hideLoading() {
        const loadingOverlay = document.querySelector(MANIPI_CONFIG.selectors.loadingOverlay);
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    /**
     * Initialize form enhancements
     */
    function initFormEnhancements() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add loading state to submit buttons
            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) {
                form.addEventListener('submit', function() {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
                });
            }
            
            // Enhance input fields
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(enhanceInput);
        });
        
        // Enhance standalone inputs
        const standaloneInputs = document.querySelectorAll('input:not(form input), textarea:not(form textarea), select:not(form select)');
        standaloneInputs.forEach(enhanceInput);
    }

    /**
     * Enhance individual input field
     */
    function enhanceInput(input) {
        // Add focus effects
        input.addEventListener('focus', function() {
            this.closest('.form-group, .input-group, .search-input-group')?.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.closest('.form-group, .input-group, .search-input-group')?.classList.remove('focused');
        });
        
        // Add validation feedback
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
            showInputError(this, this.validationMessage);
        });
        
        input.addEventListener('input', function() {
            clearInputError(this);
        });
    }

    /**
     * Show input error
     */
    function showInputError(input, message) {
        clearInputError(input);
        
        input.classList.add('is-invalid');
        
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback d-block';
        feedback.textContent = message;
        
        input.parentNode.appendChild(feedback);
    }

    /**
     * Clear input error
     */
    function clearInputError(input) {
        input.classList.remove('is-invalid');
        
        const feedback = input.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.remove();
        }
    }

    /**
     * Initialize image lazy loading
     */
    function initImageLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src || img.dataset.lazySrc;
                        
                        if (src) {
                            img.src = src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src], img[data-lazy-src]');
            lazyImages.forEach(img => {
                img.classList.add('lazy');
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Initialize cart integration
     */
    function initCartIntegration() {
        // Cart update buttons
        const cartButtons = document.querySelectorAll(MANIPI_CONFIG.selectors.cartButtons);
        cartButtons.forEach(button => {
            button.addEventListener('click', handleCartAction);
        });
        
        // Listen for cart updates from other components
        window.addEventListener('manipi:cart-updated', function(e) {
            updateCartUI(e.detail);
        });
    }

    /**
     * Handle cart actions
     */
    function handleCartAction(e) {
        e.preventDefault();
        
        const button = e.currentTarget;
        const action = button.dataset.cartAction;
        const productId = button.dataset.productId;
        const variantId = button.dataset.variantId || null;
        
        if (!productId || !action) {
            console.error('Missing product ID or action for cart operation');
            return;
        }
        
        // Show loading state
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Prepare request data
        const requestData = {
            productId: productId,
            action: action
        };
        
        if (variantId) {
            requestData.variantId = variantId;
        }
        
        // Make AJAX request
        fetch('/update_item/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Update UI
            updateCartUI(data);
            
            // Show success feedback
            showToast('success', 'Cart updated successfully');
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('manipi:cart-updated', {
                detail: data
            }));
        })
        .catch(error => {
            console.error('Cart update failed:', error);
            showToast('error', 'Failed to update cart. Please try again.');
        })
        .finally(() => {
            // Restore button state
            button.disabled = false;
            button.innerHTML = originalContent;
        });
    }

    /**
     * Update cart UI elements
     */
    function updateCartUI(data) {
        // Update cart badge in dropdown
        if (window.ManipiDropdown) {
            window.ManipiDropdown.updateCartBadge(data.cartItems || 0);
        }
        
        // Update cart total displays
        const cartTotalElements = document.querySelectorAll('[data-cart-total]');
        cartTotalElements.forEach(element => {
            if (data.cartTotal !== undefined) {
                element.textContent = formatPrice(data.cartTotal);
            }
        });
        
        // Update item quantities
        const quantityElements = document.querySelectorAll(`[data-item-quantity="${data.productId}"]`);
        quantityElements.forEach(element => {
            if (data.quantity !== undefined) {
                element.textContent = data.quantity;
            }
        });
    }

    /**
     * Initialize wishlist integration
     */
    function initWishlistIntegration() {
        const wishlistButtons = document.querySelectorAll(MANIPI_CONFIG.selectors.wishlistButtons);
        wishlistButtons.forEach(button => {
            button.addEventListener('click', handleWishlistAction);
        });
    }

    /**
     * Handle wishlist actions
     */
    function handleWishlistAction(e) {
        e.preventDefault();
        
        const button = e.currentTarget;
        const productId = button.dataset.productId;
        const action = button.dataset.wishlistAction || 'toggle';
        
        if (!productId) {
            console.error('Missing product ID for wishlist operation');
            return;
        }
        
        // Show loading state
        const icon = button.querySelector('i');
        const originalClass = icon.className;
        icon.className = 'fas fa-spinner fa-spin';
        
        // Simulate wishlist API call (replace with actual endpoint)
        setTimeout(() => {
            // Toggle wishlist state
            const isInWishlist = button.classList.contains('in-wishlist');
            
            if (isInWishlist) {
                button.classList.remove('in-wishlist');
                icon.className = 'far fa-heart';
                showToast('info', 'Removed from wishlist');
            } else {
                button.classList.add('in-wishlist');
                icon.className = 'fas fa-heart';
                showToast('success', 'Added to wishlist');
            }
            
            // Update wishlist badge
            const currentCount = parseInt(document.querySelector('.wishlist-btn .action-badge')?.textContent || '0');
            const newCount = isInWishlist ? currentCount - 1 : currentCount + 1;
            
            if (window.ManipiDropdown) {
                window.ManipiDropdown.updateWishlistBadge(Math.max(0, newCount));
            }
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('manipi:wishlist-updated', {
                detail: { count: Math.max(0, newCount), productId, action }
            }));
            
        }, 500);
    }

    /**
     * Initialize search enhancements
     */
    function initSearchEnhancements() {
        const searchForms = document.querySelectorAll(MANIPI_CONFIG.selectors.searchForm);
        
        searchForms.forEach(form => {
            const input = form.querySelector('input[name="search"]');
            const clearBtn = form.querySelector('.search-clear');
            
            if (!input) return;
            
            // Add search suggestions (placeholder for future implementation)
            let searchTimeout;
            input.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    handleSearchInput(this.value.trim());
                }, 300);
            });
            
            // Clear button functionality
            if (clearBtn) {
                clearBtn.addEventListener('click', function() {
                    input.value = '';
                    input.focus();
                    clearBtn.style.display = 'none';
                });
            }
            
            // Show/hide clear button
            input.addEventListener('input', function() {
                if (clearBtn) {
                    clearBtn.style.display = this.value.length > 0 ? 'block' : 'none';
                }
            });
            
            // Form submission tracking
            form.addEventListener('submit', function() {
                trackEvent('search', input.value.trim());
            });
        });
    }

    /**
     * Handle search input for suggestions
     */
    function handleSearchInput(query) {
        if (query.length < 2) return;
        
        // Placeholder for search suggestions API
        console.log('Search suggestions for:', query);
        
        // Could implement autocomplete/suggestions here
        // fetchSearchSuggestions(query);
    }

    /**
     * Initialize performance monitoring
     */
    function initPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                    
                    console.log(`Page load time: ${loadTime}ms`);
                    
                    // Track performance metrics
                    trackEvent('performance', 'page_load_time', Math.round(loadTime));
                }, 0);
            }
        });
        
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn(`Long task detected: ${entry.duration}ms`);
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // PerformanceObserver not supported or failed
                console.debug('Performance monitoring not available');
            }
        }
    }

    /**
     * Show toast notification
     */
    function showToast(type = 'info', message = '', duration = 3000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.manipi-toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `manipi-toast toast-${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${iconMap[type] || iconMap.info}"></i>
                <span>${message}</span>
                <button type="button" class="toast-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: getToastBackground(type),
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '9999',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease-out',
            maxWidth: '400px',
            fontSize: '14px'
        });
        
        const content = toast.querySelector('.toast-content');
        Object.assign(content.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        });
        
        const closeBtn = toast.querySelector('.toast-close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            color: 'inherit',
            marginLeft: 'auto',
            cursor: 'pointer',
            padding: '0',
            fontSize: '12px'
        });
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Close functionality
        const closeToast = () => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        };
        
        closeBtn.addEventListener('click', closeToast);
        
        // Auto close
        if (duration > 0) {
            setTimeout(closeToast, duration);
        }
        
        return toast;
    }

    /**
     * Get toast background color
     */
    function getToastBackground(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    /**
     * Format price for display
     */
    function formatPrice(price) {
        if (typeof price === 'string') {
            price = parseFloat(price.replace(/[^\d.-]/g, ''));
        }
        
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    }

    /**
     * Get CSRF token from cookies or meta tag
     */
    function getCsrfToken() {
        // First try to get from global MANIPI object
        if (window.MANIPI && window.MANIPI.csrfToken) {
            return window.MANIPI.csrfToken;
        }
        
        // Then try meta tag
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            return metaToken.getAttribute('content');
        }
        
        // Finally try cookie
        const cookieMatch = document.cookie.match(/csrftoken=([^;]+)/);
        return cookieMatch ? cookieMatch[1] : '';
    }

    /**
     * Track events for analytics
     */
    function trackEvent(category, action, label = null, value = null) {
        try {
            // Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', action, {
                    event_category: category,
                    event_label: label,
                    value: value
                });
            }
            
            // Google Analytics Universal
            if (typeof ga !== 'undefined') {
                ga('send', 'event', category, action, label, value);
            }
            
            // Custom analytics
            if (window.MANIPI && window.MANIPI.analytics) {
                window.MANIPI.analytics.track(action, {
                    category,
                    label,
                    value
                });
            }
            
            console.debug(`Event tracked: ${category} - ${action}`, { label, value });
        } catch (error) {
            console.debug('Analytics tracking failed:', error);
        }
    }

    /**
     * Utility: Throttle function
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Utility: Debounce function
     */
    function debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            
            const callNow = immediate && !timeout;
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * Utility: Check if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Utility: Get device info
     */
    function getDeviceInfo() {
        const width = window.innerWidth;
        return {
            isMobile: width < MANIPI_CONFIG.breakpoints.mobile,
            isTablet: width >= MANIPI_CONFIG.breakpoints.mobile && width < MANIPI_CONFIG.breakpoints.desktop,
            isDesktop: width >= MANIPI_CONFIG.breakpoints.desktop,
            width: width,
            height: window.innerHeight
        };
    }

    /**
     * Public API
     */
    window.Manipi = window.Manipi || {};
    Object.assign(window.Manipi, {
        // Core functions
        init: initApp,
        showLoading: showLoading,
        hideLoading: hideLoading,
        showToast: showToast,
        
        // Utilities
        formatPrice: formatPrice,
        getCsrfToken: getCsrfToken,
        trackEvent: trackEvent,
        throttle: throttle,
        debounce: debounce,
        isInViewport: isInViewport,
        getDeviceInfo: getDeviceInfo,
        
        // State
        config: MANIPI_CONFIG
    });

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    // Handle page visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('Page hidden');
        } else {
            console.log('Page visible');
            // Refresh dynamic content if needed
        }
    });

    // Handle online/offline status
    window.addEventListener('online', function() {
        showToast('success', 'Connection restored', 2000);
        console.log('Back online');
    });

    window.addEventListener('offline', function() {
        showToast('warning', 'You are offline', 5000);
        console.log('Gone offline');
    });

    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        
        // Don't show toast for script errors in production
        if (window.location.hostname !== 'localhost') {
            trackEvent('error', 'javascript_error', e.message);
        } else {
            showToast('error', 'An error occurred. Check console for details.');
        }
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        
        if (window.location.hostname !== 'localhost') {
            trackEvent('error', 'promise_rejection', e.reason?.toString());
        }
    });

})();