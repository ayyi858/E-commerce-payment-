// Update Cart Buttons
const updateBtns = document.querySelectorAll('.update-cart');

// Add click event listeners to all update buttons
updateBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
        const productId = btn.dataset.product;
        const action = btn.dataset.action;

        console.log(`Product ID: ${productId}, Action: ${action}`);
        console.log(`User: ${user}`);

        // Add animation feedback for button click
        animateButton(btn);

        // Show loading spinner
        const spinner = createLoadingSpinner();
        btn.appendChild(spinner);

        // Handle cart update based on user authentication
        if (user === 'AnonymousUser') {
            addCookieItem(productId, action);
        } else {
            await updateUserOrder(productId, action);
        }

        // Remove loading spinner after action
        spinner.remove();
    });
});

// Function to update order for authenticated users
const updateUserOrder = async (productId, action) => {
    console.log('User is authenticated, sending data...');

    const url = '/update_item/';
    const payload = { productId, action };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('Order updated successfully:', data);

        // Reload page to reflect changes
        location.reload();
    } catch (error) {
        console.error('Error updating order:', error);
    }
};

// Function to handle cart updates for anonymous users
const addCookieItem = (productId, action) => {
    console.log('User is not authenticated');

    if (action === 'add') {
        cart[productId] = cart[productId] || { quantity: 0 };
        cart[productId].quantity += 1;
    }

    if (action === 'remove') {
        if (cart[productId]) {
            cart[productId].quantity -= 1;

            // Remove item from cart if quantity is zero or less
            if (cart[productId].quantity <= 0) {
                console.log('Item removed from cart');
                delete cart[productId];
            }
        }
    }

    console.log('Updated Cart:', cart);
    document.cookie = `cart=${JSON.stringify(cart)};domain=;path=/`;

    // Reload page to reflect changes
    location.reload();
};

// Function to add animation feedback to buttons
const animateButton = (btn) => {
    btn.style.transition = 'transform 0.2s ease-in-out';
    btn.style.transform = 'scale(1.1)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
};

// Function to create a loading spinner
const createLoadingSpinner = () => {
    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    spinner.style.display = 'inline-block';
    spinner.style.width = '12px';
    spinner.style.height = '12px';
    spinner.style.marginLeft = '8px';
    spinner.style.border = '2px solid #f3f3f3';
    spinner.style.borderTop = '2px solid #3498db';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 0.6s linear infinite';
    return spinner;
};

// CSS Animation for Spinner (added dynamically via JS)
const style = document.createElement('style');
style.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
// --------------------------------------------------
// 14. Animasi Countdown Flash Sale (lanjutan)
// --------------------------------------------------
function initCountdown() {
    const countdownContainer = document.querySelector('.countdown');
    
    if (!countdownContainer) return;
    
    // Set waktu akhir (6 jam dari sekarang)
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 6);
    
    function updateCountdown() {
        const now = new Date();
        const diff = endTime - now;
        
        if (diff <= 0) {
            // Reset countdown untuk demo
            endTime.setHours(endTime.getHours() + 6);
            updateCountdown();
            return;
        }
        
        // Hitung jam, menit, dan detik yang tersisa
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Update elemen HTML
        const hoursElement = countdownContainer.querySelector('.hours');
        const minutesElement = countdownContainer.querySelector('.minutes');
        const secondsElement = countdownContainer.querySelector('.seconds');
        
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        // Tambahkan efek pulsa pada detik
        if (secondsElement) {
            secondsElement.classList.add('pulse');
            setTimeout(() => {
                secondsElement.classList.remove('pulse');
            }, 500);
        }
    }
    
    // Update countdown setiap detik
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

initCountdown();

// --------------------------------------------------
// 15. Efek Parallax Ringan
// --------------------------------------------------
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.5;
            const offset = element.offsetTop;
            const distance = (scrollTop - offset) * speed;
            
            element.style.transform = `translateY(${distance}px)`;
        });
    });
}

initParallaxEffect();

// --------------------------------------------------
// 16. Efek 3D Tilt pada Kartu Produk
// --------------------------------------------------
function initTiltEffect() {
    const tiltCards = document.querySelectorAll('.product-card, .category-card');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            // Hanya terapkan jika viewport cukup besar
            if (window.innerWidth > 992) {
                const cardRect = this.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const cardCenterY = cardRect.top + cardRect.height / 2;
                
                // Posisi relatif dari kursor terhadap pusat kartu (-1 sampai 1)
                const relativeX = (e.clientX - cardCenterX) / (cardRect.width / 2);
                const relativeY = (e.clientY - cardCenterY) / (cardRect.height / 2);
                
                // Terapkan rotasi (maksimal 5 derajat)
                const maxRotation = 5;
                this.style.transform = `perspective(1000px) rotateX(${-relativeY * maxRotation}deg) rotateY(${relativeX * maxRotation}deg) translateZ(10px)`;
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

initTiltEffect();

// --------------------------------------------------
// 17. Smooth Scroll untuk Semua Anchor Links
// --------------------------------------------------
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Animasi smooth scroll
                window.scrollTo({
                    top: targetElement.offsetTop - 100, // Offset untuk navbar
                    behavior: 'smooth'
                });
                
                // Tambahkan efek highlight ke elemen target
                targetElement.classList.add('highlight');
                setTimeout(() => {
                    targetElement.classList.remove('highlight');
                }, 1500);
            }
        });
    });
}

initSmoothScroll();

// --------------------------------------------------
// 18. Lazy Load Gambar dengan Fade-in
// --------------------------------------------------
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                
                img.classList.add('fade-in');
                img.onload = () => {
                    img.classList.add('active');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                };
            }
        });
    }, { threshold: 0.1, rootMargin: "50px" });
    
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

initLazyLoading();

// --------------------------------------------------
// 19. Animasi Rating Stars
// --------------------------------------------------
function initRatingAnimation() {
    const ratingElements = document.querySelectorAll('.product-rating, .testimonial-rating');
    
    ratingElements.forEach(ratingEl => {
        const stars = ratingEl.querySelectorAll('i');
        
        ratingEl.addEventListener('mouseenter', () => {
            stars.forEach((star, index) => {
                setTimeout(() => {
                    star.classList.add('animate-star');
                }, index * 100);
            });
        });
        
        ratingEl.addEventListener('mouseleave', () => {
            stars.forEach(star => {
                star.classList.remove('animate-star');
            });
        });
    });
}

initRatingAnimation();

// --------------------------------------------------
// 20. Efek Float Continuous untuk CTA Buttons
// --------------------------------------------------
function initFloatingButtons() {
    const floatingButtons = document.querySelectorAll('.hero-button, .offer-button');
    
    floatingButtons.forEach(button => {
        // Tambahkan kelas untuk animasi continuous float
        button.classList.add('float-animation');
    });
}

initFloatingButtons();

// --------------------------------------------------
// 21. Efek Ripple untuk Tombol
// --------------------------------------------------
function initRippleEffect() {
    const buttons = document.querySelectorAll('.btn, .action-button, .add-to-cart');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

initRippleEffect();

// --------------------------------------------------
// 22. Animasi Cart Dropdown
// --------------------------------------------------
function initCartDropdown() {
    const cartButton = document.querySelector('.cart-button');
    const cartDropdown = document.querySelector('.cart-dropdown');
    
    if (cartButton && cartDropdown) {
        cartButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            cartDropdown.classList.toggle('active');
            
            if (cartDropdown.classList.contains('active')) {
                // Animasi item masuk
                const cartItems = cartDropdown.querySelectorAll('.cart-item');
                cartItems.forEach((item, index) => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100 + index * 50);
                });
            }
        });
        
        // Tutup dropdown saat klik di luar
        document.addEventListener('click', function(e) {
            if (!cartButton.contains(e.target) && !cartDropdown.contains(e.target)) {
                cartDropdown.classList.remove('active');
            }
        });
    }
}

initCartDropdown();

// Jalankan semua inisialisasi animasi
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi semua animasi
    initAnnouncementSlider();
    initFlashSaleProgress();
    initCountdown();
    initParallaxEffect();
    initTiltEffect();
    initSmoothScroll();
    initLazyLoading();
    initRatingAnimation();
    initFloatingButtons();
    initRippleEffect();
    initCartDropdown();
    
    // Tambahkan kelas untuk animasi entrance
    setTimeout(() => {
        document.body.classList.add('page-loaded');
    }, 500);
});