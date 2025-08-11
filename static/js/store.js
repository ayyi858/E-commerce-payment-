// ===========================
// STORE PAGE JAVASCRIPT
// Professional & Modern Functionality
// ===========================

class StoreManager {
    constructor() {
        this.init();
        this.bindEvents();
        this.setupIntersectionObserver();
    }

    init() {
        this.isLoading = false;
        this.searchTimeout = null;
        this.currentView = 'grid';
        
        // Initialize components
        this.setupSearch();
        this.setupFilters();
        this.setupViewToggle();
        this.setupQuantityControls();
        this.setupCartButtons();
        this.setupQuickView();
        this.setupImageLazyLoading();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearchInput.bind(this));
            searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
        }

        // Clear search button
        const clearBtn = document.querySelector('.search-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', this.clearSearch.bind(this));
        }

        // Filter changes
        const filterSelect = document.querySelector('.filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', this.handleFilterChange.bind(this));
        }

        // Sort functionality
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }

        // View toggle
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', this.handleViewToggle.bind(this));
        });

        // Wishlist buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-action[title="Add to Wishlist"]')) {
                this.handleWishlist(e);
            }
        });

        // Quick view buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-action[title="Quick View"]')) {
                const productId = e.target.closest('.product-card')?.querySelector('[data-product]')?.dataset.product;
                if (productId) {
                    this.openQuickView(productId);
                }
            }
        });

        // Modal events
        const modal = document.getElementById('quickViewModal');
        if (modal) {
            modal.addEventListener('hidden.bs.modal', this.resetQuickView.bind(this));
        }

        // Quantity controls in modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('qty-btn')) {
                this.handleQuantityChange(e);
            }
        });

        // Add to cart in modal
        const modalCartBtn = document.querySelector('.add-to-cart-modal');
        if (modalCartBtn) {
            modalCartBtn.addEventListener('click', this.handleModalAddToCart.bind(this));
        }
    }

    setupIntersectionObserver() {
        // Animate elements on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, { threshold: 0.1 });

        // Observe product cards
        document.querySelectorAll('.product-card').forEach(card => {
            observer.observe(card);
        });

        // Observe stats
        document.querySelectorAll('.stat-item').forEach(stat => {
            observer.observe(stat);
        });
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        // Show/hide clear button based on input
        const updateClearButton = () => {
            const clearBtn = document.querySelector('.search-clear');
            if (clearBtn) {
                clearBtn.style.display = searchInput.value ? 'block' : 'none';
            }
        };

        searchInput.addEventListener('input', updateClearButton);
        updateClearButton(); // Initial check
    }

    setupFilters() {
        // Initialize filter state
        this.activeFilters = {
            search: new URLSearchParams(window.location.search).get('search') || '',
            category: new URLSearchParams(window.location.search).get('category') || '',
            sort: 'popular'
        };
    }

    setupViewToggle() {
        const grid = document.querySelector('.products-grid');
        if (!grid) return;

        this.updateViewClasses();
    }

    setupQuantityControls() {
        // Handle quantity buttons in quick view modal
        document.addEventListener('click', (e) => {
            if (e.target.matches('.qty-btn.minus, .qty-btn.plus')) {
                const input = e.target.parentElement.querySelector('.qty-input');
                const currentValue = parseInt(input.value) || 1;
                
                if (e.target.classList.contains('minus') && currentValue > 1) {
                    input.value = currentValue - 1;
                } else if (e.target.classList.contains('plus')) {
                    input.value = currentValue + 1;
                }
            }
        });
    }

    setupCartButtons() {
        // Add to cart functionality (existing from main.js)
        document.querySelectorAll('.update-cart').forEach(button => {
            button.addEventListener('click', this.handleAddToCart.bind(this));
        });
    }

    setupQuickView() {
        // Initialize quick view modal
        this.quickViewModal = new bootstrap.Modal(document.getElementById('quickViewModal') || document.createElement('div'));
    }

    setupImageLazyLoading() {
        // Enhanced lazy loading for product images
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            });
        } else {
            // Fallback for browsers without native lazy loading
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    handleSearchInput(e) {
        clearTimeout(this.searchTimeout);
        const query = e.target.value.trim();

        // Show/hide clear button
        const clearBtn = document.querySelector('.search-clear');
        if (clearBtn) {
            clearBtn.style.display = query ? 'block' : 'none';
        }

        // Debounce search
        this.searchTimeout = setTimeout(() => {
            if (query !== this.activeFilters.search) {
                this.performSearch(query);
            }
        }, 500);
    }

    handleSearchKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(this.searchTimeout);
            this.performSearch(e.target.value.trim());
        }
    }

    clearSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        this.performSearch('');
    }

    performSearch(query) {
        this.activeFilters.search = query;
        this.updateURL();
        this.showLoading();
        
        // Reload page with new search params
        setTimeout(() => {
            window.location.href = this.buildURL();
        }, 300);
    }

    handleFilterChange(e) {
        this.activeFilters.category = e.target.value;
        this.updateURL();
        this.showLoading();
        
        setTimeout(() => {
            window.location.href = this.buildURL();
        }, 300);
    }

    handleSortChange(e) {
        this.activeFilters.sort = e.target.value;
        this.applySorting(e.target.value);
    }

    handleViewToggle(e) {
        const viewType = e.target.dataset.view || e.target.closest('[data-view]').dataset.view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Update view
        this.currentView = viewType;
        this.updateViewClasses();
    }

    updateViewClasses() {
        const grid = document.querySelector('.products-grid');
        if (!grid) return;

        grid.className = grid.className.replace(/view-\w+/g, '');
        grid.classList.add(`view-${this.currentView}`);
    }

    handleAddToCart(e) {
        e.preventDefault();
        
        const button = e.currentTarget;
        const productId = button.dataset.product;
        const action = button.dataset.action || 'add';
        
        if (!productId) return;

        // Add loading state
        this.setButtonLoading(button, true);

        // AJAX request to update cart
        fetch('/update_item/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken(),
            },
            body: JSON.stringify({
                productId: productId,
                action: action
            })
        })
        .then(response => response.json())
        .then(data => {
            this.setButtonLoading(button, false);
            this.showCartFeedback(button, 'added');
            this.updateCartCounter();
            
            // Show success notification
            this.showNotification('Product added to cart!', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            this.setButtonLoading(button, false);
            this.showNotification('Failed to add product to cart', 'error');
        });
    }

    handleWishlist(e) {
        e.preventDefault();
        const button = e.target.closest('.quick-action');
        const productCard = button.closest('.product-card');
        const productId = productCard.querySelector('[data-product]')?.dataset.product;
        
        if (!productId) return;

        // Toggle wishlist state
        const isWishlisted = button.classList.contains('wishlisted');
        button.classList.toggle('wishlisted');
        
        const icon = button.querySelector('i');
        if (isWishlisted) {
            icon.className = 'far fa-heart';
            this.showNotification('Removed from wishlist', 'info');
        } else {
            icon.className = 'fas fa-heart';
            this.showNotification('Added to wishlist!', 'success');
        }

        // Here you would typically make an AJAX call to update the server
        // For now, we'll just update the UI
    }

    openQuickView(productId) {
        // Show loading state
        this.showQuickViewLoading();
        this.quickViewModal.show();

        // Simulate API call to get product details
        // In a real app, you'd fetch this data from your backend
        setTimeout(() => {
            this.loadQuickViewData(productId);
        }, 500);
    }

    showQuickViewLoading() {
        const modal = document.getElementById('quickViewModal');
        if (!modal) return;

        const content = modal.querySelector('.quick-view-content');
        if (content) {
            content.innerHTML = `
                <div class="quick-view-loading">
                    <div class="loading-spinner">
                        <div class="spinner-ring"></div>
                        <span>Loading product details...</span>
                    </div>
                </div>
            `;
        }
    }

    loadQuickViewData(productId) {
        // Get product data from the page
        const productCard = document.querySelector(`[data-product="${productId}"]`)?.closest('.product-card');
        if (!productCard) return;

        const title = productCard.querySelector('.product-title a')?.textContent || '';
        const category = productCard.querySelector('.product-category')?.textContent || '';
        const price = productCard.querySelector('.current-price')?.textContent || '';
        const originalPrice = productCard.querySelector('.original-price')?.textContent || '';
        const image = productCard.querySelector('.main-image')?.src || '';
        const rating = this.getProductRating(productCard);

        this.populateQuickView({
            id: productId,
            title,
            category,
            price,
            originalPrice,
            image,
            rating,
            description: 'This is a premium quality product with excellent features and modern design. Perfect for your lifestyle needs.'
        });
    }

    populateQuickView(product) {
        const modal = document.getElementById('quickViewModal');
        if (!modal) return;

        const content = modal.querySelector('.quick-view-content');
        if (!content) return;

        content.innerHTML = `
            <div class="quick-view-image">
                <img id="quickViewImage" src="${product.image}" alt="${product.title}">
            </div>
            <div class="quick-view-details">
                <div class="product-category">${product.category}</div>
                <h2 class="product-title">${product.title}</h2>
                <div class="product-rating">
                    <div class="stars">
                        ${this.generateStars(product.rating)}
                    </div>
                    <span class="rating-count">(24 reviews)</span>
                </div>
                <div class="product-price">
                    <span class="current-price">${product.price}</span>
                    ${product.originalPrice ? `<span class="original-price">${product.originalPrice}</span>` : ''}
                </div>
                <p class="product-description">${product.description}</p>
                <div class="quantity-selector">
                    <button class="qty-btn minus">-</button>
                    <input type="number" class="qty-input" value="1" min="1">
                    <button class="qty-btn plus">+</button>
                </div>
                <button class="add-to-cart-modal" data-product="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Add to Cart</span>
                </button>
                <a href="/product/${product.id}/" class="view-details">
                    View Full Details
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        // Bind events for the new content
        this.bindModalEvents();
    }

    bindModalEvents() {
        const modal = document.getElementById('quickViewModal');
        if (!modal) return;

        // Quantity controls
        modal.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', this.handleQuantityChange.bind(this));
        });

        // Add to cart
        const addBtn = modal.querySelector('.add-to-cart-modal');
        if (addBtn) {
            addBtn.addEventListener('click', this.handleModalAddToCart.bind(this));
        }
    }

    handleQuantityChange(e) {
        const input = e.target.parentElement.querySelector('.qty-input');
        const currentValue = parseInt(input.value) || 1;
        
        if (e.target.classList.contains('minus') && currentValue > 1) {
            input.value = currentValue - 1;
        } else if (e.target.classList.contains('plus')) {
            input.value = currentValue + 1;
        }
    }

    handleModalAddToCart(e) {
        const productId = e.currentTarget.dataset.product;
        const quantity = document.querySelector('.qty-input')?.value || 1;
        
        // Add to cart with specified quantity
        this.addToCartWithQuantity(productId, parseInt(quantity));
        
        // Close modal after adding
        this.quickViewModal.hide();
    }

    addToCartWithQuantity(productId, quantity) {
        const requests = [];
        
        // Make multiple requests for the specified quantity
        for (let i = 0; i < quantity; i++) {
            requests.push(
                fetch('/update_item/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': this.getCSRFToken(),
                    },
                    body: JSON.stringify({
                        productId: productId,
                        action: 'add'
                    })
                })
            );
        }

        Promise.all(requests)
            .then(() => {
                this.updateCartCounter();
                this.showNotification(`${quantity} item(s) added to cart!`, 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                this.showNotification('Failed to add items to cart', 'error');
            });
    }

    resetQuickView() {
        const modal = document.getElementById('quickViewModal');
        if (!modal) return;

        const content = modal.querySelector('.quick-view-content');
        if (content) {
            content.innerHTML = '';
        }
    }

    getProductRating(productCard) {
        const stars = productCard.querySelectorAll('.stars .fas');
        return stars.length;
    }

    generateStars(rating) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        return starsHTML;
    }

    applySorting(sortType) {
        const grid = document.querySelector('.products-grid');
        if (!grid) return;

        const products = Array.from(grid.querySelectorAll('.product-card'));
        
        products.sort((a, b) => {
            switch (sortType) {
                case 'Price: Low to High':
                    return this.getProductPrice(a) - this.getProductPrice(b);
                case 'Price: High to Low':
                    return this.getProductPrice(b) - this.getProductPrice(a);
                case 'Newest First':
                    return 0; // Would need actual dates from backend
                case 'Best Rating':
                    return this.getProductRating(b) - this.getProductRating(a);
                default: // Most Popular
                    return 0;
            }
        });

        // Re-append sorted products
        products.forEach(product => {
            grid.appendChild(product);
        });

        // Add animation
        grid.classList.add('sorting');
        setTimeout(() => {
            grid.classList.remove('sorting');
        }, 300);
    }

    getProductPrice(productCard) {
        const priceText = productCard.querySelector('.current-price')?.textContent || '0';
        return parseInt(priceText.replace(/[^\d]/g, '')) || 0;
    }

    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            const originalContent = button.innerHTML;
            button.dataset.originalContent = originalContent;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            if (button.dataset.originalContent) {
                button.innerHTML = button.dataset.originalContent;
                delete button.dataset.originalContent;
            }
        }
    }

    showCartFeedback(button, type) {
        if (type === 'added') {
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Added!';
            button.classList.add('success');
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('success');
            }, 2000);
        }
    }

    updateCartCounter() {
        // Update cart badge in header
        const cartBadge = document.querySelector('.cart-btn .action-badge');
        if (cartBadge) {
            const currentCount = parseInt(cartBadge.textContent) || 0;
            cartBadge.textContent = currentCount + 1;
            
            // Add animation
            cartBadge.classList.add('animate-bounce');
            setTimeout(() => {
                cartBadge.classList.remove('animate-bounce');
            }, 1000);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto hide after 4 seconds
        const hideTimeout = setTimeout(() => {
            this.hideNotification(notification);
        }, 4000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(hideTimeout);
            this.hideNotification(notification);
        });
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    buildURL() {
        const params = new URLSearchParams();
        
        if (this.activeFilters.search) {
            params.set('search', this.activeFilters.search);
        }
        if (this.activeFilters.category) {
            params.set('category', this.activeFilters.category);
        }
        
        const baseURL = window.location.pathname;
        const queryString = params.toString();
        
        return queryString ? `${baseURL}?${queryString}` : baseURL;
    }

    updateURL() {
        const newURL = this.buildURL();
        window.history.replaceState({}, '', newURL);
    }

    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
               document.querySelector('meta[name=csrf-token]')?.content ||
               window.MANIPI?.csrfToken || '';
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function clearSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    
    // Trigger search
    if (window.storeManager) {
        window.storeManager.performSearch('');
    }
}

function quickView(productId) {
    if (window.storeManager) {
        window.storeManager.openQuickView(productId);
    }
}

// ===========================
// ADDITIONAL CSS FOR NOTIFICATIONS
// ===========================

const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 9999;
    border-left: 4px solid;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left-color: #10b981;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
}

.notification-error {
    border-left-color: #ef4444;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
}

.notification-warning {
    border-left-color: #f59e0b;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
}

.notification-info {
    border-left-color: #3b82f6;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
}

.notification-content i {
    font-size: 1.25rem;
}

.notification-success i { color: #10b981; }
.notification-error i { color: #ef4444; }
.notification-warning i { color: #f59e0b; }
.notification-info i { color: #3b82f6; }

.notification-close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.notification-close:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1e293b;
}

.quick-view-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    text-align: center;
}

.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.spinner-ring {
    width: 3rem;
    height: 3rem;
    border: 3px solid #e2e8f0;
    border-left-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.products-grid.sorting {
    opacity: 0.7;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.add-to-cart.success {
    background: #10b981 !important;
}

@media (max-width: 768px) {
    .notification {
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
</style>
`;

// Inject notification styles
document.head.insertAdjacentHTML('beforeend', notificationStyles);

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize store manager
    window.storeManager = new StoreManager();
    
    console.log('Store page initialized successfully');
});

// Make functions globally available
window.clearSearch = clearSearch;
window.quickView = quickView;