/**
 * MANIPI - MAIN JAVASCRIPT
 * Professional E-Commerce Functionality
 */

(function() {
    'use strict';

    // Global variables
    const MANIPI = window.MANIPI || {};
    
    /**
     * Utility Functions
     */
    const Utils = {
        // Debounce function for search
        debounce: function(func, wait, immediate) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },

        // Throttle function for scroll events
        throttle: function(func, limit) {
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
        },

        // Format currency
        formatCurrency: function(amount) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        },

        // Show loading
        showLoading: function() {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.add('show');
            }
        },

        // Hide loading
        hideLoading: function() {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.remove('show');
            }
        },

        // Show toast notification
        showToast: function(message, type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.className = `toast-notification toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <i class="fas fa-${this.getToastIcon(type)} me-2"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // Add to document
            document.body.appendChild(toast);

            // Show toast
            setTimeout(() => toast.classList.add('show'), 100);

            // Auto hide
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, duration);

            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            });
        },

        getToastIcon: function(type) {
            const icons = {
                success: 'check-circle',
                error: 'exclamation-circle',
                warning: 'exclamation-triangle',
                info: 'info-circle'
            };
            return icons[type] || 'info-circle';
        },

        // CSRF Token
        getCsrfToken: function() {
            return MANIPI.csrfToken || document.querySelector('[name=csrfmiddlewaretoken]')?.value;
        },

        // API Request wrapper
        apiRequest: async function(url, options = {}) {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                }
            };

            const mergedOptions = {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers
                }
            };

            try {
                const response = await fetch(url, mergedOptions);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Request failed');
                }
                
                return data;
            } catch (error) {
                console.error('API Request Error:', error);
                throw error;
            }
        }
    };

    /**
     * Header Component
     */
    const Header = {
        init: function() {
            this.handleStickyHeader();
            this.handleSearch();
            this.handleMobileMenu();
            this.handleUserDropdown();
        },

        handleStickyHeader: function() {
            const header = document.getElementById('main-header');
            const navbar = document.getElementById('main-navbar');
            
            if (!header || !navbar) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        navbar.classList.remove('scrolled');
                    } else {
                        navbar.classList.add('scrolled');
                    }
                },
                { threshold: 0.1 }
            );

            observer.observe(header);
        },

        handleSearch: function() {
            const searchInputs = document.querySelectorAll('.search-input');
            const searchForms = document.querySelectorAll('.search-form');

            searchInputs.forEach(input => {
                const clearBtn = input.parentElement.querySelector('.search-clear');
                
                // Show/hide clear button
                input.addEventListener('input', () => {
                    if (clearBtn) {
                        clearBtn.style.display = input.value ? 'block' : 'none';
                    }
                });

                // Clear search
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        input.value = '';
                        clearBtn.style.display = 'none';
                        input.focus();
                    });
                }

                // Search suggestions (if implemented)
                const debouncedSearch = Utils.debounce((query) => {
                    if (query.length >= 2) {
                        this.fetchSearchSuggestions(query);
                    }
                }, 300);

                input.addEventListener('input', (e) => {
                    debouncedSearch(e.target.value);
                });
            });

            // Handle form submission
            searchForms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    const input = form.querySelector('.search-input');
                    if (!input.value.trim()) {
                        e.preventDefault();
                        input.focus();
                    }
                });
            });
        },

        fetchSearchSuggestions: function(query) {
            // Implement search suggestions if needed
            // This would typically make an AJAX request to get suggestions
            console.log('Fetching suggestions for:', query);
        },

        handleMobileMenu: function() {
            const toggleBtn = document.querySelector('.navbar-toggler');
            const navCollapse = document.getElementById('main-nav');

            if (!toggleBtn || !navCollapse) return;

            toggleBtn.addEventListener('click', () => {
                const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
                toggleBtn.setAttribute('aria-expanded', !isExpanded);
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.navbar') && navCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navCollapse);
                    bsCollapse.hide();
                }
            });
        },

        handleUserDropdown: function() {
            const userDropdowns = document.querySelectorAll('.user-dropdown');
            
            userDropdowns.forEach(dropdown => {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                const menu = dropdown.querySelector('.dropdown-menu');

                if (!toggle || !menu) return;

                // Custom dropdown behavior if needed
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    menu.classList.toggle('show');
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!dropdown.contains(e.target)) {
                        menu.classList.remove('show');
                    }
                });
            });
        }
    };

    /**
     * Cart Functionality
     */
    const Cart = {
        init: function() {
            this.handleCartActions();
            this.updateCartDisplay();
        },

        handleCartActions: function() {
            document.addEventListener('click', (e) => {
                if (e.target.matches('.update-cart') || e.target.closest('.update-cart')) {
                    e.preventDefault();
                    const btn = e.target.closest('.update-cart');
                    const productId = btn.dataset.product;
                    const action = btn.dataset.action;
                    const variantId = btn.dataset.variant || null;

                    if (productId && action) {
                        this.updateCart(productId, action, variantId);
                    }
                }
            });
        },

        updateCart: async function(productId, action, variantId = null) {
            if (!MANIPI.isAuthenticated) {
                this.updateCookieCart(productId, action, variantId);
                return;
            }

            try {
                Utils.showLoading();

                const response = await Utils.apiRequest('/update_item/', {
                    method: 'POST',
                    body: JSON.stringify({
                        productId: productId,
                        action: action,
                        variantId: variantId
                    })
                });

                this.updateCartDisplay();
                this.showCartFeedback(action, response);

            } catch (error) {
                Utils.showToast('Gagal memperbarui keranjang', 'error');
                console.error('Cart update error:', error);
            } finally {
                Utils.hideLoading();
            }
        },

        updateCookieCart: function(productId, action, variantId = null) {
            let cart = this.getCartFromCookie();
            const key = variantId ? `${productId}_${variantId}` : productId;

            if (!cart[key]) {
                cart[key] = {
                    quantity: 0,
                    variant_id: variantId
                };
            }

            if (action === 'add') {
                cart[key].quantity += 1;
            } else if (action === 'remove') {
                cart[key].quantity -= 1;
                if (cart[key].quantity <= 0) {
                    delete cart[key];
                }
            } else if (action === 'delete') {
                delete cart[key];
            }

            this.saveCartToCookie(cart);
            this.updateCartDisplay();
            this.showCartFeedback(action);
        },

        getCartFromCookie: function() {
            const cartCookie = document.cookie
                .split('; ')
                .find(row => row.startsWith('cart='));
            
            if (cartCookie) {
                try {
                    return JSON.parse(decodeURIComponent(cartCookie.split('=')[1]));
                } catch (e) {
                    return {};
                }
            }
            return {};
        },

        saveCartToCookie: function(cart) {
            document.cookie = `cart=${encodeURIComponent(JSON.stringify(cart))};path=/;max-age=${30 * 24 * 60 * 60}`;
        },

        updateCartDisplay: function() {
            const cartBadges = document.querySelectorAll('.action-badge');
            const cart = this.getCartFromCookie();
            let totalItems = 0;

            Object.values(cart).forEach(item => {
                totalItems += item.quantity || 0;
            });

            cartBadges.forEach(badge => {
                if (badge.closest('.cart-btn')) {
                    badge.textContent = totalItems;
                    badge.style.display = totalItems > 0 ? 'flex' : 'none';
                }
            });

            // Update MANIPI.cartItems for other scripts
            MANIPI.cartItems = totalItems;
        },

        showCartFeedback: function(action, response = null) {
            const messages = {
                add: 'Produk ditambahkan ke keranjang',
                remove: 'Produk dikurangi dari keranjang',
                delete: 'Produk dihapus dari keranjang'
            };

            const message = messages[action] || 'Keranjang diperbarui';
            Utils.showToast(message, 'success', 2000);

            // Add visual feedback to button
            const buttons = document.querySelectorAll(`[data-action="${action}"]`);
            buttons.forEach(btn => {
                btn.classList.add('btn-success');
                setTimeout(() => {
                    btn.classList.remove('btn-success');
                }, 1000);
            });
        }
    };

    /**
     * Product Components
     */
    const Product = {
        init: function() {
            this.handleQuickView();
            this.handleWishlist();
            this.handleCompare();
            this.handleProductImages();
        },

        handleQuickView: function() {
            document.addEventListener('click', (e) => {
                if (e.target.matches('.quick-view-btn') || e.target.closest('.quick-view-btn')) {
                    e.preventDefault();
                    const btn = e.target.closest('.quick-view-btn');
                    const productId = btn.dataset.productId;
                    
                    if (productId) {
                        this.openQuickView(productId);
                    }
                }
            });
        },

        openQuickView: async function(productId) {
            try {
                Utils.showLoading();

                // Fetch product data
                const response = await Utils.apiRequest(`/api/product/${productId}/`);
                this.populateQuickViewModal(response);

                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
                modal.show();

            } catch (error) {
                Utils.showToast('Gagal memuat detail produk', 'error');
                console.error('Quick view error:', error);
            } finally {
                Utils.hideLoading();
            }
        },

        populateQuickViewModal: function(product) {
            const modal = document.getElementById('quickViewModal');
            if (!modal) return;

            // Update modal content
            modal.querySelector('#quickViewImage').src = product.imageURL;
            modal.querySelector('#quickViewCategory').textContent = product.kategori;
            modal.querySelector('#quickViewTitle').textContent = product.name;
            modal.querySelector('#quickViewPrice').textContent = product.format_discount_price;
            modal.querySelector('#quickViewDescription').textContent = product.description || '';
            modal.querySelector('#quickViewStock').textContent = product.stock > 0 ? 'Tersedia' : 'Habis';
            modal.querySelector('#quickViewSku').textContent = product.sku || 'N/A';

            // Update rating
            const ratingElement = modal.querySelector('#quickViewRating');
            if (ratingElement) {
                const percentage = (product.rating / 5) * 100;
                ratingElement.style.width = `${percentage}%`;
            }

            // Update review count
            modal.querySelector('#quickViewReviewCount').textContent = `(${product.review_count || 0})`;

            // Update original price if there's a discount
            const originalPriceElement = modal.querySelector('#quickViewOriginalPrice');
            if (product.discount_percent > 0) {
                originalPriceElement.textContent = product.format_harga;
                originalPriceElement.style.display = 'inline';
            } else {
                originalPriceElement.style.display = 'none';
            }

            // Update discount badge
            const discountBadge = modal.querySelector('#quickViewDiscountBadge');
            if (product.discount_percent > 0) {
                discountBadge.querySelector('span').textContent = `${product.discount_percent}% OFF`;
                discountBadge.style.display = 'block';
            } else {
                discountBadge.style.display = 'none';
            }

            // Update add to cart button
            const addToCartBtn = modal.querySelector('#quickViewAddToCart');
            addToCartBtn.dataset.product = product.id;
            addToCartBtn.dataset.action = 'add';

            // Update detail link
            modal.querySelector('#quickViewDetailLink').href = `/product/${product.id}/`;
        },

        handleWishlist: function() {
            document.addEventListener('click', (e) => {
                if (e.target.matches('.wishlist-btn') || e.target.closest('.wishlist-btn')) {
                    e.preventDefault();
                    const btn = e.target.closest('.wishlist-btn');
                    const productId = btn.dataset.product;
                    
                    if (productId) {
                        this.toggleWishlist(productId, btn);
                    }
                }
            });
        },

        toggleWishlist: async function(productId, button) {
            if (!MANIPI.isAuthenticated) {
                Utils.showToast('Silakan login terlebih dahulu', 'warning');
                return;
            }

            try {
                const response = await Utils.apiRequest('/api/wishlist/toggle/', {
                    method: 'POST',
                    body: JSON.stringify({ product_id: productId })
                });

                // Update button state
                const icon = button.querySelector('i');
                if (response.added) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    button.classList.add('active');
                    Utils.showToast('Ditambahkan ke wishlist', 'success');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    button.classList.remove('active');
                    Utils.showToast('Dihapus dari wishlist', 'info');
                }

                // Update wishlist counter
                this.updateWishlistCounter();

            } catch (error) {
                Utils.showToast('Gagal memperbarui wishlist', 'error');
                console.error('Wishlist error:', error);
            }
        },

        updateWishlistCounter: function() {
            // Update wishlist badge if exists
            const wishlistBadge = document.querySelector('.wishlist-btn .action-badge');
            if (wishlistBadge) {
                // This would typically be updated from the server response
                // For now, we'll just indicate there are items
                wishlistBadge.style.display = 'flex';
            }
        },

        handleCompare: function() {
            document.addEventListener('click', (e) => {
                if (e.target.matches('.compare-btn') || e.target.closest('.compare-btn')) {
                    e.preventDefault();
                    const btn = e.target.closest('.compare-btn');
                    const productId = btn.dataset.product;
                    
                    if (productId) {
                        this.toggleCompare(productId, btn);
                    }
                }
            });
        },

        toggleCompare: function(productId, button) {
            let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
            const index = compareList.indexOf(productId);

            if (index === -1) {
                if (compareList.length >= 4) {
                    Utils.showToast('Maksimal 4 produk untuk perbandingan', 'warning');
                    return;
                }
                compareList.push(productId);
                button.classList.add('active');
                Utils.showToast('Ditambahkan ke perbandingan', 'success');
            } else {
                compareList.splice(index, 1);
                button.classList.remove('active');
                Utils.showToast('Dihapus dari perbandingan', 'info');
            }

            localStorage.setItem('compareList', JSON.stringify(compareList));
            this.updateCompareCounter();
        },

        updateCompareCounter: function() {
            const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
            // Update compare counter in UI if exists
            console.log('Compare list updated:', compareList.length, 'items');
        },

        handleProductImages: function() {
            // Image zoom and gallery functionality
            const productImages = document.querySelectorAll('.product-img');
            
            productImages.forEach(img => {
                img.addEventListener('mouseenter', function() {
                    if (this.nextElementSibling && this.nextElementSibling.classList.contains('product-img-hover')) {
                        this.style.opacity = '0';
                        this.nextElementSibling.style.opacity = '1';
                    }
                });

                img.addEventListener('mouseleave', function() {
                    if (this.nextElementSibling && this.nextElementSibling.classList.contains('product-img-hover')) {
                        this.style.opacity = '1';
                        this.nextElementSibling.style.opacity = '0';
                    }
                });
            });
        }
    };

    /**
     * Form Enhancements
     */
    const Forms = {
        init: function() {
            this.handleNewsletterForm();
            this.enhanceFormValidation();
        },

        handleNewsletterForm: function() {
            const forms = document.querySelectorAll('.newsletter-form');
            
            forms.forEach(form => {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const emailInput = form.querySelector('input[type="email"]');
                    const email = emailInput.value.trim();
                    
                    if (!email) {
                        Utils.showToast('Silakan masukkan email Anda', 'warning');
                        return;
                    }

                    try {
                        await Utils.apiRequest('/api/newsletter/subscribe/', {
                            method: 'POST',
                            body: JSON.stringify({ email: email })
                        });

                        Utils.showToast('Berhasil berlangganan newsletter!', 'success');
                        emailInput.value = '';
                        
                    } catch (error) {
                        Utils.showToast('Gagal berlangganan newsletter', 'error');
                        console.error('Newsletter subscription error:', error);
                    }
                });
            });
        },

        enhanceFormValidation: function() {
            const forms = document.querySelectorAll('form[novalidate]');
            
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    if (!form.checkValidity()) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Focus first invalid field
                        const firstInvalid = form.querySelector(':invalid');
                        if (firstInvalid) {
                            firstInvalid.focus();
                        }
                    }
                    
                    form.classList.add('was-validated');
                });
            });
        }
    };

    /**
     * UI Enhancements
     */
    const UI = {
        init: function() {
            this.handleBackToTop();
            this.handleSmoothScroll();
            this.initializeTooltips();
            this.handleViewSwitcher();
        },

        handleBackToTop: function() {
            const backToTopBtn = document.getElementById('back-to-top');
            if (!backToTopBtn) return;

            const toggleBackToTop = Utils.throttle(() => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.add('show');
                } else {
                    backToTopBtn.classList.remove('show');
                }
            }, 100);

            window.addEventListener('scroll', toggleBackToTop);

            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        },

        handleSmoothScroll: function() {
            document.addEventListener('click', (e) => {
                const anchor = e.target.closest('a[href^="#"]');
                if (!anchor) return;

                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        },

        initializeTooltips: function() {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        },

        handleViewSwitcher: function() {
            const viewSwitchers = document.querySelectorAll('.view-switcher button');
            const productsContainer = document.querySelector('.products-container');
            
            viewSwitchers.forEach(btn => {
                btn.addEventListener('click', () => {
                    const view = btn.dataset.view;
                    
                    // Update active button
                    viewSwitchers.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update products container
                    if (productsContainer) {
                        if (view === 'list') {
                            productsContainer.classList.add('list-view');
                        } else {
                            productsContainer.classList.remove('list-view');
                        }
                    }
                    
                    // Save preference
                    localStorage.setItem('preferredView', view);
                });
            });

            // Load saved preference
            const savedView = localStorage.getItem('preferredView');
            if (savedView) {
                const btn = document.querySelector(`[data-view="${savedView}"]`);
                if (btn) {
                    btn.click();
                }
            }
        }
    };

    /**
     * Performance Optimizations
     */
    const Performance = {
        init: function() {
            this.lazyLoadImages();
            this.preloadCriticalResources();
        },

        lazyLoadImages: function() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    });
                });

                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
        },

        preloadCriticalResources: function() {
            // Preload critical resources
            const criticalResources = [
                '/static/css/main.css',
                '/static/js/main.js'
            ];

            criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = resource.endsWith('.css') ? 'style' : 'script';
                link.href = resource;
                document.head.appendChild(link);
            });
        }
    };

    /**
     * Application Initialization
     */
    const App = {
        init: function() {
            // Initialize all components
            Header.init();
            Cart.init();
            Product.init();
            Forms.init();
            UI.init();
            Performance.init();

            // Hide loading overlay
            setTimeout(() => {
                Utils.hideLoading();
            }, 500);

            // Initialize Bootstrap components
            this.initBootstrapComponents();

            console.log('Manipi App initialized successfully');
        },

        initBootstrapComponents: function() {
            // Initialize tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

            // Initialize popovers
            const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
            popoverTriggerList.map(function (popoverTriggerEl) {
                return new bootstrap.Popover(popoverTriggerEl);
            });
        }
    };

    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', function() {
        App.init();
    });

    // Export to global scope
    window.ManipiApp = {
        Utils,
        Header,
        Cart,
        Product,
        Forms,
        UI,
        Performance,
        App
    };

})();